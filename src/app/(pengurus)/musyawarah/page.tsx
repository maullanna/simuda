import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarDays, ChevronDown, Clock, MapPin, PenLine } from "lucide-react";
import { TombolJadwalkan, TombolTulisHasil } from "@/components/musyawarah/AksiMusyawarah";
import { PapanTindakLanjut, type ItemPapan } from "@/components/musyawarah/PapanTindakLanjut";
import { daftarPengurus, dataMusyawarahContoh } from "@/lib/mock";
import { lewatTenggat } from "@/lib/musyawarah";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Musyawarah · SIMUDA",
};

function selisihHari(dari: string, ke: string): number {
  return Math.round((Date.parse(ke) - Date.parse(dari)) / 86_400_000);
}

// Musyawarah (KONSEP 5.9): jadwal, agenda, hasil, dan tindak lanjut supaya keputusan tidak berhenti di rapat.
export default async function MusyawarahPage() {
  await connection();
  const hariIni = tanggalHariIniWib();
  const { musyawarah, tindakLanjut } = dataMusyawarahContoh(hariIni);
  const namaPengurus = daftarPengurus.map((p) => p.nama);

  const berikutnya = musyawarah
    .filter((m) => m.status === "terjadwal" && m.tanggal >= hariIni)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];
  const riwayat = musyawarah.filter((m) => m.status === "selesai").sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const itemPapan: ItemPapan[] = tindakLanjut.map((t) => {
    const asal = musyawarah.find((m) => m.id === t.musyawarahId);
    return { ...t, asal: asal ? `Musyawarah ${formatTanggal(asal.tanggal, { day: "numeric", month: "short" })}` : "" };
  });
  const berjalan = tindakLanjut.filter((t) => t.status !== "selesai").length;
  const telat = tindakLanjut.filter((t) => lewatTenggat(t, hariIni)).length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Musyawarah</h1>
          <p className="text-on-surface-variant">
            {riwayat.length} musyawarah tercatat · {berjalan} tindak lanjut belum selesai
            {telat > 0 && ` · ${telat} lewat tenggat`}
          </p>
        </div>
        <TombolJadwalkan hariIni={hariIni} />
      </header>

      {/* Musyawarah berikutnya */}
      {berikutnya && (
        <section className="muncul group relative isolate flex flex-col gap-5 overflow-hidden rounded-[28px] bg-primary-container p-6 text-on-primary-container lg:flex-row lg:items-center lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 -z-10 size-48 rounded-full bg-primary/15 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-3 group-hover:translate-y-2"
          />
          <div className="flex shrink-0 flex-col items-center justify-center rounded-3xl bg-surface/60 px-6 py-4 text-center">
            <p className="text-xs font-bold uppercase">{formatTanggal(berikutnya.tanggal, { weekday: "short" })}</p>
            <p className="text-4xl font-extrabold leading-tight">{Number(berikutnya.tanggal.slice(8))}</p>
            <p className="text-xs font-semibold">{formatTanggal(berikutnya.tanggal, { month: "short", year: "numeric" })}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider opacity-75">
              Musyawarah berikutnya · {selisihHari(hariIni, berikutnya.tanggal)} hari lagi
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} /> {berikutnya.jam.replace(":", ".")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} /> {berikutnya.lokasi}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PenLine size={16} /> Notulis {berikutnya.notulis}
              </span>
            </p>
            <ol className="mt-3 list-decimal pl-5 text-sm">
              {berikutnya.agenda.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </div>
          <div className="shrink-0">
            <TombolTulisHasil musyawarah={berikutnya} daftarPengurus={namaPengurus} />
          </div>
        </section>
      )}

      <PapanTindakLanjut item={itemPapan} hariIni={hariIni} />

      {/* Riwayat musyawarah */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Riwayat musyawarah</h2>
        {riwayat.map((m, i) => {
          const tugas = tindakLanjut.filter((t) => t.musyawarahId === m.id);
          const selesai = tugas.filter((t) => t.status === "selesai").length;
          return (
            // <details>: ringkasan selalu tampil, isinya dibuka dengan klik. Yang terbaru langsung terbuka.
            <details key={m.id} open={i === 0} className="group rounded-[28px] bg-surface-low p-5 open:pb-6">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-extrabold">
                  <CalendarDays size={18} className="text-primary" />
                  {formatTanggal(m.tanggal)}
                </span>
                <span className="text-sm text-on-surface-variant">{m.lokasi}</span>
                {tugas.length > 0 && (
                  <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-highest">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(selesai / tugas.length) * 100}%` }} />
                    </span>
                    {selesai}/{tugas.length} tindak lanjut selesai
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className={`${tugas.length ? "" : "ml-auto"} text-on-surface-variant transition-transform duration-300 group-open:rotate-180`}
                />
              </summary>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Agenda</p>
                  <ol className="mt-1 list-decimal pl-5 text-sm">
                    {m.agenda.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Hasil · notulis {m.notulis}</p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {m.hasil.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-3">
                <TombolTulisHasil musyawarah={m} daftarPengurus={namaPengurus} varian="teks" />
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}
