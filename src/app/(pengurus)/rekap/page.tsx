import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarCheck, HandHeart, MessageCircle, PhoneCall, UserCheck } from "lucide-react";
import { GrafikKehadiran } from "@/components/beranda/GrafikKehadiran";
import { KotakStat } from "@/components/beranda/KotakStat";
import { ChipJenisKelamin } from "@/components/ChipJenisKelamin";
import { FilterChip } from "@/components/FilterChip";
import { Paginasi } from "@/components/Paginasi";
import { TombolSalinRingkasan } from "@/components/rekap/TombolSalinRingkasan";
import { TombolUnduhRekap } from "@/components/rekap/TombolUnduhRekap";
import type { DataEksporRekap } from "@/lib/ekspor-rekap";
import { daftarPeserta, dataAbsensiContoh } from "@/lib/mock";
import { potongHalaman } from "@/lib/halaman";
import { bacaPeriode } from "@/lib/periode";
import { kategoriPeserta, labelJenisKelamin, labelKategori, tanggalHariIniWib, type Kategori } from "@/lib/peserta";
import { daftarPerluDihubungi, hitungRekap, nomorWhatsApp } from "@/lib/rekap";
import { formatTanggal, labelSasaran } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Rekap · SIMUDA",
};

// Jumlah baris tiap tabel (per-peserta, per-sesi) ikut dibawa saat filter diganti;
// nomor halamannya tidak, supaya tabel kembali ke halaman 1.
type Filter = {
  dari?: string;
  sampai?: string;
  jk?: string;
  wilayah?: string;
  kategori?: string;
  urut?: string;
  "per-peserta"?: string;
  "per-sesi"?: string;
};

function ambilTeks(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === "string" && nilai !== "" ? nilai : undefined;
}

// URL baru dengan satu filter diubah; menekan filter yang sama melepasnya.
// Periode dari navbar (dari/sampai) ikut dibawa.
function urlFilter(saatIni: Filter, kunci: keyof Filter, nilai: string): string {
  const baru: Filter = { ...saatIni, [kunci]: saatIni[kunci] === nilai ? undefined : nilai };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(baru)) if (v) params.set(k, v);
  const q = params.toString();
  return q ? `/rekap?${q}` : "/rekap";
}

export default async function RekapPage(props: PageProps<"/rekap">) {
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);

  const sp = await props.searchParams;
  const periode = bacaPeriode(sp.dari, sp.sampai, hariIni);
  const filter: Filter = {
    dari: ambilTeks(sp.dari),
    sampai: ambilTeks(sp.sampai),
    jk: ambilTeks(sp.jk),
    wilayah: ambilTeks(sp.wilayah),
    kategori: ambilTeks(sp.kategori),
    urut: ambilTeks(sp.urut),
    "per-peserta": ambilTeks(sp["per-peserta"]),
    "per-sesi": ambilTeks(sp["per-sesi"]),
  };

  // Peserta aktif sesuai filter kelompok, wilayah, kategori.
  const peserta = daftarPeserta.filter(
    (p) =>
      p.status === "aktif" &&
      (!filter.jk || p.jenisKelamin === filter.jk) &&
      (!filter.wilayah || p.wilayah === `Bendlay ${filter.wilayah}`) &&
      (!filter.kategori || kategoriPeserta(p.tanggalLahir) === filter.kategori),
  );

  const sesiPeriode = sesi.filter(
    (s) => s.status === "selesai" && s.tanggal >= periode.dari && s.tanggal <= periode.sampai && (!filter.jk || s.jenisKelamin === filter.jk),
  );
  const { perTanggal, perPeserta, total } = hitungRekap(sesiPeriode, peserta, kehadiran);
  const rataRata = total.sasaran ? Math.round((total.hadir / total.sasaran) * 100) : 0;

  const urutPeserta = [...perPeserta]
    .filter((r) => r.sesi > 0)
    .sort((a, b) =>
      filter.urut === "kehadiran" ? a.persen - b.persen || a.peserta.nama.localeCompare(b.peserta.nama, "id") : a.peserta.nama.localeCompare(b.peserta.nama, "id"),
    );
  const tabelPeserta = potongHalaman(urutPeserta, sp["hal-peserta"], sp["per-peserta"]);

  // Perlu dihubungi: keadaan saat ini (2 pengajian terakhir), dikelompokkan per wilayah.
  const perluDihubungi = daftarPerluDihubungi(sesi, peserta, kehadiran);
  const perWilayah = ["Bendlay 2", "Bendlay 4"]
    .map((w) => ({ wilayah: w, daftar: perluDihubungi.filter((x) => x.peserta.wilayah === w) }))
    .filter((g) => g.daftar.length > 0);

  // Pengajian berikutnya, untuk isi pesan WhatsApp yang bernada mengajak.
  const berikutnya = (jk: string) =>
    sesi
      .filter((s) => s.status === "terjadwal" && s.jenisKelamin === jk)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];

  const sesiUrut = [...sesiPeriode].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.jenisKelamin.localeCompare(b.jenisKelamin));
  const tabelSesi = potongHalaman(sesiUrut, sp["hal-sesi"], sp["per-sesi"]);

  const hadirSemua = perPeserta.filter((r) => r.sesi > 0 && r.hadir === r.sesi).length;
  const rataHadirPerPengajian = perTanggal.length ? Math.round(total.hadir / perTanggal.length) : 0;
  // Ringkasan untuk grup: hanya angka positif, tanpa nama (KONSEP bagian 6).
  const teksGrup = [
    `Rekap pengajian muda/i Bendlay 2 & 4 · ${periode.label}`,
    `• ${perTanggal.length} kali pengajian`,
    `• Rata-rata ${rataHadirPerPengajian} peserta hadir setiap pengajian`,
    hadirSemua > 0 ? `• ${hadirSemua} peserta hadir di semua pengajian. Masya Allah!` : null,
    `Jazakumullahu khairan, sampai jumpa di pengajian berikutnya.`,
  ]
    .filter(Boolean)
    .join("\n");

  // Data untuk unduhan Excel/PDF: SEMUA baris sesuai filter (bukan hanya halaman tabel yang tampil).
  // Daftar "perlu dihubungi" sengaja tidak ikut, karena file bisa diteruskan ke orang lain.
  const labelFilter =
    [
      filter.jk === "putra" || filter.jk === "putri" ? labelJenisKelamin[filter.jk] : null,
      filter.wilayah ? `Bendlay ${filter.wilayah}` : null,
      filter.kategori === "remaja" || filter.kategori === "pra-nikah" ? labelKategori[filter.kategori as Kategori] : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Semua peserta";
  const dataEkspor: DataEksporRekap = {
    periode: periode.label,
    filter: labelFilter,
    dibuat: formatTanggal(hariIni),
    ringkasan: {
      pengajian: perTanggal.length,
      sesi: sesiPeriode.length,
      rataRata,
      hadir: total.hadir,
      sasaran: total.sasaran,
      izin: total.izin,
      alpa: total.alpa,
    },
    perPeserta: urutPeserta.map((r) => ({
      nama: r.peserta.nama,
      kelompok: labelJenisKelamin[r.peserta.jenisKelamin],
      wilayah: r.peserta.wilayah,
      kategori: labelKategori[kategoriPeserta(r.peserta.tanggalLahir)],
      sesi: r.sesi,
      hadir: r.hadir,
      izin: r.izin,
      alpa: r.alpa,
      persen: r.persen,
    })),
    perSesi: sesiUrut.map((s) => {
      const a = hitungRekap([s], peserta, kehadiran).total;
      return {
        tanggal: formatTanggal(s.tanggal, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
        kelompok: labelJenisKelamin[s.jenisKelamin],
        sasaran: labelSasaran[s.sasaran],
        materi: s.materi,
        pemateri: s.pemateri,
        hadir: a.hadir,
        jumlahSasaran: a.sasaran,
        izin: a.izin,
        alpa: a.alpa,
      };
    }),
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Rekap</h1>
          <p className="text-on-surface-variant">
            Rekap kehadiran <span className="font-bold text-on-surface">{periode.label}</span>. Ganti periode lewat filter
            tanggal di atas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TombolSalinRingkasan teks={teksGrup} />
          <TombolUnduhRekap data={dataEkspor} namaFile={`rekap-simuda-${periode.dari}_${periode.sampai}`} />
        </div>
      </header>

      {/* Filter kelompok dan kategori */}
      <div className="flex flex-wrap gap-2">
        <FilterChip label="Putra" href={urlFilter(filter, "jk", "putra")} aktif={filter.jk === "putra"} />
        <FilterChip label="Putri" href={urlFilter(filter, "jk", "putri")} aktif={filter.jk === "putri"} />
        <FilterChip label="Bendlay 2" href={urlFilter(filter, "wilayah", "2")} aktif={filter.wilayah === "2"} />
        <FilterChip label="Bendlay 4" href={urlFilter(filter, "wilayah", "4")} aktif={filter.wilayah === "4"} />
        <FilterChip label="Remaja" href={urlFilter(filter, "kategori", "remaja")} aktif={filter.kategori === "remaja"} />
        <FilterChip label="Pra-nikah" href={urlFilter(filter, "kategori", "pra-nikah")} aktif={filter.kategori === "pra-nikah"} />
      </div>

      {/* Ringkasan angka */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KotakStat ikon={CalendarCheck} label="Pengajian" nilai={`${perTanggal.length} kali`} catatan={`${sesiPeriode.length} sesi putra & putri`} jeda={0} />
        <KotakStat ikon={UserCheck} label="Rata-rata hadir" nilai={`${rataRata}%`} catatan={`${total.hadir} dari ${total.sasaran} kehadiran`} jeda={60} />
        <KotakStat ikon={HandHeart} label="Izin" nilai={`${total.izin} kali`} catatan={`Alpa ${total.alpa} kali`} jeda={120} />
        <KotakStat ikon={PhoneCall} label="Perlu dihubungi" nilai={`${perluDihubungi.length} orang`} catatan="Dari 2 pengajian terakhir" jeda={180} />
      </div>

      <GrafikKehadiran data={perTanggal} periode={periode.label} />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* Rekap per peserta */}
        <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold">Rekap per peserta</h2>
            <div className="flex gap-2">
              <FilterChip label="Urut nama" href={urlFilter({ ...filter, urut: undefined }, "urut", "")} aktif={filter.urut !== "kehadiran"} />
              <FilterChip label="Kehadiran terendah" href={urlFilter(filter, "urut", "kehadiran")} aktif={filter.urut === "kehadiran"} />
            </div>
          </div>
          {urutPeserta.length === 0 ? (
            <p className="py-10 text-center text-on-surface-variant">Tidak ada data untuk filter ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="w-10 py-2 pr-2">No</th>
                    <th className="py-2 pr-3">Nama</th>
                    <th className="hidden px-3 py-2 md:table-cell">Kategori</th>
                    <th className="px-3 py-2 text-right">Hadir</th>
                    <th className="hidden px-3 py-2 text-right sm:table-cell">Izin</th>
                    <th className="hidden px-3 py-2 text-right sm:table-cell">Alpa</th>
                    <th className="w-32 py-2 pl-3">Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelPeserta.isi.map((r, i) => (
                    <tr key={r.peserta.id} className="border-t border-outline-variant/60">
                      <td className="py-2.5 pr-2 text-on-surface-variant">{tabelPeserta.nomorAwal + i}</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold">{r.peserta.nama}</p>
                        <p className="text-xs text-on-surface-variant">
                          {r.peserta.jenisKelamin === "putra" ? "Putra" : "Putri"} · {r.peserta.wilayah}
                        </p>
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell">{labelKategori[kategoriPeserta(r.peserta.tanggalLahir)]}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <b>{r.hadir}</b>
                        <span className="text-on-surface-variant">/{r.sesi}</span>
                      </td>
                      <td className="hidden px-3 py-2.5 text-right sm:table-cell">{r.izin}</td>
                      <td className="hidden px-3 py-2.5 text-right sm:table-cell">{r.alpa}</td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-highest">
                            <div className="h-full rounded-full bg-grafik-1" style={{ width: `${r.persen}%` }} />
                          </div>
                          <span className="w-9 text-right text-xs font-bold">{r.persen}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Paginasi
            total={tabelPeserta.total}
            halaman={tabelPeserta.halaman}
            per={tabelPeserta.per}
            kunciHalaman="hal-peserta"
            kunciPer="per-peserta"
            label="peserta"
          />
        </section>

        {/* Perlu dihubungi */}
        <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
          <div>
            <h2 className="text-lg font-extrabold">Perlu dihubungi</h2>
            <p className="text-sm text-on-surface-variant">
              Hanya terlihat oleh pengurus. Hubungi secara pribadi dengan nada mengajak.
            </p>
          </div>
          {perWilayah.length === 0 ? (
            <p className="py-10 text-center text-on-surface-variant">Alhamdulillah, tidak ada yang perlu dihubungi.</p>
          ) : (
            perWilayah.map((g) => (
              <div key={g.wilayah} className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Untuk pengurus {g.wilayah}</p>
                <ul className="flex flex-col gap-2">
                  {g.daftar.map((x) => {
                    const wa = nomorWhatsApp(x.peserta.noHp);
                    const sesiBerikut = berikutnya(x.peserta.jenisKelamin);
                    const namaDepan = x.peserta.nama.split(" ")[0];
                    // Pesan mengajak, tidak pernah menyebut jumlah absen (KONSEP bagian 6).
                    const pesan = `Assalamu'alaikum ${namaDepan}, semoga sehat selalu. ${
                      sesiBerikut
                        ? `Pengajian muda/i berikutnya ${formatTanggal(sesiBerikut.tanggal, { weekday: "long", day: "numeric", month: "long" })} pukul ${sesiBerikut.jamMulai.replace(":", ".")}. `
                        : ""
                    }Kami tunggu kehadirannya ya.`;
                    return (
                      <li key={x.peserta.id} className="flex items-center gap-3 rounded-2xl bg-surface-mid p-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{x.peserta.nama}</p>
                            <ChipJenisKelamin jenisKelamin={x.peserta.jenisKelamin} />
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {x.alasan} · terakhir hadir{" "}
                            {x.terakhirHadir ? formatTanggal(x.terakhirHadir, { day: "numeric", month: "short" }) : "belum tercatat"}
                          </p>
                        </div>
                        {wa ? (
                          <md-filled-tonal-button href={`https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`} target="_blank">
                            <MessageCircle slot="icon" size={16} />
                            WhatsApp
                          </md-filled-tonal-button>
                        ) : (
                          <span className="text-xs text-on-surface-variant">No HP belum ada</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Rincian sesi */}
      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <h2 className="text-lg font-extrabold">Rincian sesi</h2>
        {sesiPeriode.length === 0 ? (
          <p className="py-10 text-center text-on-surface-variant">Tidak ada sesi selesai di periode ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="px-3 py-2">Sesi</th>
                  <th className="hidden px-3 py-2 md:table-cell">Materi</th>
                  <th className="px-3 py-2 text-right">Hadir</th>
                  <th className="hidden px-3 py-2 text-right sm:table-cell">Izin</th>
                  <th className="hidden py-2 pl-3 text-right sm:table-cell">Alpa</th>
                </tr>
              </thead>
              <tbody>
                {tabelSesi.isi.map((s) => {
                    const r = hitungRekap([s], peserta, kehadiran).total;
                    return (
                      <tr key={s.id} className="border-t border-outline-variant/60">
                        <td className="whitespace-nowrap py-2.5 pr-3 font-semibold">
                          <Link href={`/absensi/${s.id}`} className="hover:underline">
                            {formatTanggal(s.tanggal, { weekday: "short", day: "numeric", month: "short" })}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <ChipJenisKelamin jenisKelamin={s.jenisKelamin} />
                            <span className="text-xs text-on-surface-variant">{labelSasaran[s.sasaran]}</span>
                          </div>
                        </td>
                        <td className="hidden px-3 py-2.5 md:table-cell">
                          <p className="font-semibold">{s.materi}</p>
                          <p className="text-xs text-on-surface-variant">{s.pemateri}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right">
                          <b>{r.hadir}</b>
                          <span className="text-on-surface-variant">/{r.sasaran}</span>
                        </td>
                        <td className="hidden px-3 py-2.5 text-right sm:table-cell">{r.izin}</td>
                        <td className="hidden py-2.5 pl-3 text-right sm:table-cell">{r.alpa}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        <Paginasi
          total={tabelSesi.total}
          halaman={tabelSesi.halaman}
          per={tabelSesi.per}
          kunciHalaman="hal-sesi"
          kunciPer="per-sesi"
          label="sesi"
        />
      </section>
    </div>
  );
}
