import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarDays, EyeOff, MessageSquareQuote } from "lucide-react";
import { ChipJenisKelamin } from "@/components/ChipJenisKelamin";
import { FilterChip } from "@/components/FilterChip";
import { PratinjauFormMasukan } from "@/components/masukan/PratinjauFormMasukan";
import { Paginasi } from "@/components/Paginasi";
import { potongHalaman } from "@/lib/halaman";
import { daftarPeserta, dataAbsensiContoh, dataMasukanContoh } from "@/lib/mock";
import { bacaPeriode } from "@/lib/periode";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Masukan · SIMUDA",
};

function ambilTeks(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === "string" && nilai !== "" ? nilai : undefined;
}

// Masukan peserta (KONSEP 5.10). Dilihat oleh Kyai, Wakil, Ketua, dan Sekretaris.
export default async function MasukanPage(props: PageProps<"/masukan">) {
  await requireRole("masukan", "lihat");
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi } = dataAbsensiContoh(hariIni);
  const semuaMasukan = dataMasukanContoh(hariIni);

  const sp = await props.searchParams;
  const periode = bacaPeriode(sp.dari, sp.sampai, hariIni);
  const pengirim = ambilTeks(sp.pengirim); // "bernama" / "anonim"

  const dalamPeriode = semuaMasukan.filter((m) => m.dibuat.slice(0, 10) >= periode.dari && m.dibuat.slice(0, 10) <= periode.sampai);
  const tampil = dalamPeriode
    .filter((m) => !pengirim || (pengirim === "anonim" ? m.pesertaId === null : m.pesertaId !== null))
    .sort((a, b) => b.dibuat.localeCompare(a.dibuat));
  const tabel = potongHalaman(tampil, sp.halaman, sp.per);
  const jumlahAnonim = dalamPeriode.filter((m) => m.pesertaId === null).length;

  // Link filter pengirim: periode dan jumlah per halaman ikut dibawa, halaman kembali ke 1.
  const urlPengirim = (nilai?: string) => {
    const params = new URLSearchParams();
    for (const k of ["dari", "sampai", "per"]) {
      const v = ambilTeks(sp[k]);
      if (v) params.set(k, v);
    }
    if (nilai && nilai !== pengirim) params.set("pengirim", nilai);
    const q = params.toString();
    return q ? `/masukan?${q}` : "/masukan";
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Masukan</h1>
          <p className="text-on-surface-variant">
            <span className="font-bold text-on-surface">{dalamPeriode.length} masukan</span> · {periode.label} · {jumlahAnonim} tanpa nama
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="Semua" href={urlPengirim()} aktif={!pengirim} />
          <FilterChip label="Dengan nama" href={urlPengirim("bernama")} aktif={pengirim === "bernama"} />
          <FilterChip label="Tanpa nama" href={urlPengirim("anonim")} aktif={pengirim === "anonim"} />
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-3">
          {tampil.length === 0 ? (
            <p className="rounded-[28px] bg-surface-low px-6 py-16 text-center text-on-surface-variant">
              Belum ada masukan di periode ini.
            </p>
          ) : (
            tabel.isi.map((m, i) => {
              const p = m.pesertaId ? daftarPeserta.find((x) => x.id === m.pesertaId) : null;
              const s = m.sesiId ? sesi.find((x) => x.id === m.sesiId) : null;
              return (
                <article
                  key={m.id}
                  className="muncul flex gap-4 rounded-[28px] bg-surface-low p-5"
                  style={{ animationDelay: `${i * 40}ms`, animationDuration: "400ms" }}
                >
                  {p ? (
                    <div
                      className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        p.jenisKelamin === "putra" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
                      }`}
                    >
                      {p.nama.charAt(0)}
                    </div>
                  ) : (
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-highest text-on-surface-variant">
                      <EyeOff size={18} />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-bold">{p ? p.nama : "Tanpa nama"}</p>
                      {p && <ChipJenisKelamin jenisKelamin={p.jenisKelamin} />}
                      <p className="ml-auto text-xs text-on-surface-variant">
                        {formatTanggal(m.dibuat.slice(0, 10), { day: "numeric", month: "short" })}, {m.dibuat.slice(11)}
                      </p>
                    </div>
                    <blockquote className="flex gap-2 text-sm leading-relaxed">
                      <MessageSquareQuote size={16} className="mt-0.5 shrink-0 text-primary" />
                      <span>{m.isi}</span>
                    </blockquote>
                    <p className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <CalendarDays size={13} />
                      {s ? `Tentang pengajian ${formatTanggal(s.tanggal, { weekday: "long", day: "numeric", month: "short" })} · ${s.materi}` : "Masukan umum"}
                    </p>
                  </div>
                </article>
              );
            })
          )}
          {tampil.length > 0 && (
            <div className="rounded-[28px] bg-surface-low px-5 pb-3">
              <Paginasi total={tabel.total} halaman={tabel.halaman} per={tabel.per} label="masukan" />
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <PratinjauFormMasukan />
          <p className="rounded-2xl bg-surface-mid px-4 py-3 text-xs text-on-surface-variant">
            Masukan tanpa nama tidak menyimpan identitas pengirim sama sekali. Tanggapi masukan lewat pengumuman di grup, bukan dengan
            mencari tahu pengirimnya.
          </p>
        </aside>
      </div>
    </div>
  );
}
