import type { Metadata } from "next";
import { connection } from "next/server";
import { ArrowDownLeft, ArrowUpRight, FileText, History, Image as IkonFoto, ShieldCheck, Users, Wallet } from "lucide-react";
import { KotakStat } from "@/components/beranda/KotakStat";
import { FilterChip } from "@/components/FilterChip";
import { Paginasi } from "@/components/Paginasi";
import { TombolCatatPemasukan, TombolCatatPengeluaran, TombolUbahTransaksi } from "@/components/sodaqoh/AksiSodaqoh";
import { formatRupiah } from "@/lib/format";
import { potongHalaman } from "@/lib/halaman";
import { daftarPengurus, dataSodaqohContoh } from "@/lib/mock";
import { bacaPeriode } from "@/lib/periode";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";
import { hitungSaldoBerjalan, ringkasSodaqoh } from "@/lib/sodaqoh";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Sodaqoh · SIMUDA",
};

function ambilTeks(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === "string" && nilai !== "" ? nilai : undefined;
}

// Sodaqoh (KONSEP 5.8): saldo otomatis, pemasukan dihitung dua orang, pengeluaran dengan nota,
// tidak ada hapus, dan setiap perubahan tercatat beserta alasannya.
export default async function SodaqohPage(props: PageProps<"/sodaqoh">) {
  await requireRole("sodaqohMasuk", "lihat");
  await connection();
  const hariIni = tanggalHariIniWib();
  const { transaksi, riwayat } = dataSodaqohContoh(hariIni);

  const sp = await props.searchParams;
  const periode = bacaPeriode(sp.dari, sp.sampai, hariIni);
  const jenis = ambilTeks(sp.jenis);
  const ringkasan = ringkasSodaqoh(transaksi, periode.dari, periode.sampai);

  // Saldo berjalan dihitung dari SEMUA transaksi, baru kemudian disaring per periode,
  // supaya kolom saldo tetap benar walaupun yang tampil hanya sebagian.
  const semua = hitungSaldoBerjalan(transaksi);
  const tampil = semua
    .filter((t) => t.tanggal >= periode.dari && t.tanggal <= periode.sampai && (!jenis || t.jenis === jenis))
    .reverse();
  const tabel = potongHalaman(tampil, sp.halaman, sp.per);

  // Link filter jenis: periode dan jumlah baris ikut dibawa, halaman kembali ke 1.
  const urlJenis = (nilai?: string) => {
    const params = new URLSearchParams();
    for (const k of ["dari", "sampai", "per"]) {
      const v = ambilTeks(sp[k]);
      if (v) params.set(k, v);
    }
    if (nilai && nilai !== jenis) params.set("jenis", nilai);
    const q = params.toString();
    return q ? `/sodaqoh?${q}` : "/sodaqoh";
  };

  const namaTransaksi = new Map(transaksi.map((t) => [t.id, `${t.keterangan} (${formatTanggal(t.tanggal, { day: "numeric", month: "short" })})`]));

  return (
    <div className="flex flex-col gap-6">
      {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
      <h1 className="sr-only">Sodaqoh</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Saldo */}
        <section className="muncul relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-linear-to-br from-primary-container to-primary/35 p-6 text-on-primary-container">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 -z-10 size-40 rounded-full bg-surface/25" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Saldo kas sodaqoh</p>
            <Wallet size={20} className="opacity-70" />
          </div>
          <div>
            <p className="text-4xl font-extrabold tracking-tight">{formatRupiah(ringkasan.saldo)}</p>
            <p className="text-sm opacity-80">Dihitung otomatis dari semua pemasukan dan pengeluaran</p>
          </div>
        </section>
        <KotakStat
          ikon={ArrowDownLeft}
          label={`Pemasukan · ${periode.label}`}
          nilai={formatRupiah(ringkasan.masuk)}
          catatan={`${tampil.filter((t) => t.jenis === "pemasukan").length || "Tidak ada"} transaksi${jenis === "pengeluaran" ? " (tersaring)" : ""}`}
          jeda={60}
        />
        <KotakStat
          ikon={ArrowUpRight}
          label={`Pengeluaran · ${periode.label}`}
          nilai={formatRupiah(ringkasan.keluar)}
          catatan={`Selisih periode ini ${ringkasan.masuk - ringkasan.keluar >= 0 ? "+" : "−"}${formatRupiah(Math.abs(ringkasan.masuk - ringkasan.keluar))}`}
          jeda={120}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TombolCatatPemasukan hariIni={hariIni} daftarPengurus={daftarPengurus.map((p) => p.nama)} />
        <TombolCatatPengeluaran hariIni={hariIni} />
        <p className="flex items-center gap-1.5 text-xs text-on-surface-variant sm:ml-auto">
          <ShieldCheck size={16} className="text-primary" /> Data tidak bisa dihapus. Setiap perubahan tercatat beserta alasannya.
        </p>
      </div>

      {/* Tabel transaksi */}
      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold">Transaksi · {periode.label}</h2>
          <div className="flex gap-2">
            <FilterChip label="Semua" href={urlJenis()} aktif={!jenis} />
            <FilterChip label="Pemasukan" href={urlJenis("pemasukan")} aktif={jenis === "pemasukan"} />
            <FilterChip label="Pengeluaran" href={urlJenis("pengeluaran")} aktif={jenis === "pengeluaran"} />
          </div>
        </div>

        {tampil.length === 0 ? (
          <p className="py-10 text-center text-on-surface-variant">Tidak ada transaksi di periode ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="px-3 py-2">Keterangan</th>
                  <th className="px-3 py-2 text-right">Jumlah</th>
                  <th className="hidden px-3 py-2 text-right md:table-cell">Saldo</th>
                  <th className="w-10 py-2" aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {tabel.isi.map((t) => {
                  const masuk = t.jenis === "pemasukan";
                  return (
                    <tr key={t.id} className="border-t border-outline-variant/60">
                      <td className="whitespace-nowrap py-3 pr-3 font-semibold">
                        {formatTanggal(t.tanggal, { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold">{t.keterangan}</span>
                          {t.diubah && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-surface-highest px-1.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                              <History size={12} /> diubah
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                          {t.penghitung ? (
                            <>
                              <Users size={12} /> Dihitung {t.penghitung.join(" & ")}
                            </>
                          ) : t.bukti ? (
                            <>
                              {t.bukti.tipe === "foto" ? <IkonFoto size={12} /> : <FileText size={12} />} Nota: {t.bukti.nama}
                            </>
                          ) : null}
                        </p>
                      </td>
                      {/* Pengeluaran sengaja tidak merah: ini catatan kas, bukan kesalahan */}
                      <td className={`whitespace-nowrap px-3 py-3 text-right font-bold ${masuk ? "text-primary" : ""}`}>
                        {masuk ? "+" : "−"}
                        {formatRupiah(t.jumlah)}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-right text-on-surface-variant md:table-cell">
                        {formatRupiah(t.saldo)}
                      </td>
                      <td className="py-3">
                        <TombolUbahTransaksi transaksi={t} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Paginasi total={tabel.total} halaman={tabel.halaman} per={tabel.per} label="transaksi" />
      </section>

      {/* Riwayat perubahan (audit log) */}
      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div>
          <h2 className="text-lg font-extrabold">Riwayat perubahan</h2>
          <p className="text-sm text-on-surface-variant">Semua perubahan data sodaqoh, terbaru di atas. Riwayat ini juga tidak bisa dihapus.</p>
        </div>
        {riwayat.length === 0 ? (
          <p className="py-6 text-center text-on-surface-variant">Belum ada perubahan.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {riwayat.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-surface-mid p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-highest text-on-surface-variant">
                  <History size={16} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p>
                    <b>{r.oleh}</b> mengubah <span className="font-semibold">{namaTransaksi.get(r.transaksiId)}</span>
                  </p>
                  <p className="text-on-surface-variant">{r.perubahan}</p>
                  <p className="mt-1 text-on-surface-variant">
                    Alasan: <span className="text-on-surface">{r.alasan}</span>
                  </p>
                </div>
                <p className="shrink-0 text-xs text-on-surface-variant">
                  {formatTanggal(r.waktu.slice(0, 10), { day: "numeric", month: "short" })}, {r.waktu.slice(11)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
