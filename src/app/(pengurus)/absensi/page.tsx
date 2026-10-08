import type { Metadata } from "next";
import { connection } from "next/server";
import { Clock, ScanLine, User } from "lucide-react";
import { daftarPeserta, dataAbsensiContoh } from "@/lib/mock";
import { labelJenisKelamin, tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal, labelSasaran, ringkasKehadiran, type Sesi } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Absensi · SIMUDA",
};

function ChipJenisKelamin({ sesi }: { sesi: Sesi }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
        sesi.jenisKelamin === "putra"
          ? "bg-primary-container text-on-primary-container"
          : "bg-tertiary-container text-on-tertiary-container"
      }`}
    >
      {labelJenisKelamin[sesi.jenisKelamin]}
    </span>
  );
}

function KartuSesiHariIni({ sesi, ringkasan }: { sesi: Sesi; ringkasan: ReturnType<typeof ringkasKehadiran> }) {
  const persenHadir = ringkasan.sasaran ? (ringkasan.hadir / ringkasan.sasaran) * 100 : 0;
  const persenIzin = ringkasan.sasaran ? (ringkasan.izin / ringkasan.sasaran) * 100 : 0;

  return (
    <article className="flex flex-col gap-5 rounded-3xl bg-surface-low p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ChipJenisKelamin sesi={sesi} />
        <span className="inline-flex rounded-lg bg-surface-highest px-2.5 py-1 text-xs font-bold text-on-surface-variant">
          {labelSasaran[sesi.sasaran]}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Berlangsung
        </span>
      </div>

      <div>
        <h3 className="text-lg font-extrabold">{sesi.materi}</h3>
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <User size={14} /> {sesi.pemateri}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {sesi.jamMulai}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p>
          <span className="text-4xl font-extrabold">{ringkasan.hadir}</span>{" "}
          <span className="text-on-surface-variant">hadir dari {ringkasan.sasaran} peserta sasaran</span>
        </p>
        {/* Bilah progres: hijau = hadir, biru = izin, sisanya belum tercatat */}
        <div className="flex h-3 overflow-hidden rounded-full bg-surface-highest">
          <div className="bg-primary" style={{ width: `${persenHadir}%` }} />
          <div className="bg-tertiary-container" style={{ width: `${persenIzin}%` }} />
        </div>
        <p className="flex gap-4 text-xs font-semibold text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Hadir {ringkasan.hadir}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-tertiary-container" /> Izin {ringkasan.izin}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-surface-highest" /> Belum {ringkasan.belum}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <md-filled-button href={`/scan?sesi=${sesi.id}`}>
          <ScanLine slot="icon" size={18} />
          Buka scanner
        </md-filled-button>
        {/* Input manual dan tutup sesi dikerjakan di langkah A.3 */}
        <md-outlined-button disabled>Input manual</md-outlined-button>
        <md-text-button disabled>Tutup sesi</md-text-button>
      </div>
    </article>
  );
}

export default async function AbsensiPage() {
  // Halaman ini bergantung pada tanggal hari ini, jadi dibuat saat dibuka, bukan saat build.
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);

  const sesiHariIni = sesi.filter((s) => s.tanggal === hariIni);
  const riwayat = sesi
    .filter((s) => s.status === "selesai")
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.jenisKelamin.localeCompare(b.jenisKelamin));

  const idSesiHariIni = new Set(sesiHariIni.map((s) => s.id));
  const izinHariIni = kehadiran
    .filter((k) => k.status === "izin" && idSesiHariIni.has(k.sesiId))
    .map((k) => ({
      ...k,
      peserta: daftarPeserta.find((p) => p.id === k.pesertaId)!,
      sesi: sesiHariIni.find((s) => s.id === k.sesiId)!,
    }))
    .sort((a, b) => a.peserta.nama.localeCompare(b.peserta.nama, "id"));

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Absensi</h1>
        <p className="text-on-surface-variant">{formatTanggal(hariIni)}</p>
      </header>

      {/* Sesi hari ini */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Pengajian hari ini</h2>
        {sesiHariIni.length === 0 ? (
          <p className="rounded-3xl bg-surface-low px-6 py-10 text-center text-on-surface-variant">
            Tidak ada pengajian hari ini.
          </p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sesiHariIni.map((s) => (
              <KartuSesiHariIni key={s.id} sesi={s} ringkasan={ringkasKehadiran(s, daftarPeserta, kehadiran)} />
            ))}
          </div>
        )}
      </section>

      {/* Izin tercatat */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Izin hari ini</h2>
          {/* Catat izin dikerjakan di langkah A.3 */}
          <md-outlined-button disabled>Catat izin</md-outlined-button>
        </div>
        <div className="overflow-hidden rounded-3xl bg-surface-low">
          {izinHariIni.length === 0 ? (
            <p className="px-6 py-8 text-center text-on-surface-variant">Belum ada izin untuk hari ini.</p>
          ) : (
            <ul>
              {izinHariIni.map((k, i) => (
                <li
                  key={k.sesiId + k.pesertaId}
                  className={`flex items-center gap-3 px-4 py-3 lg:px-6 ${i > 0 ? "border-t border-outline-variant/60" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{k.peserta.nama}</p>
                    <p className="text-xs text-on-surface-variant">
                      {k.keterangan} · dicatat {k.dicatatOleh}, {k.waktu}
                    </p>
                  </div>
                  <ChipJenisKelamin sesi={k.sesi} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Riwayat sesi */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Riwayat sesi</h2>
        <div className="overflow-hidden rounded-3xl bg-surface-low">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 lg:px-6">Tanggal</th>
                <th className="px-4 py-3">Sesi</th>
                <th className="hidden px-4 py-3 md:table-cell">Materi</th>
                <th className="px-4 py-3 text-right">Hadir</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Izin</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell lg:pr-6">Alpa</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((s) => {
                const r = ringkasKehadiran(s, daftarPeserta, kehadiran);
                return (
                  <tr key={s.id} className="border-t border-outline-variant/60 transition-colors hover:bg-surface-mid">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold lg:px-6">
                      {formatTanggal(s.tanggal, { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <ChipJenisKelamin sesi={s} />
                        <span className="text-xs text-on-surface-variant">{labelSasaran[s.sasaran]}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="font-semibold">{s.materi}</p>
                      <p className="text-xs text-on-surface-variant">{s.pemateri}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-bold">{r.hadir}</span>
                      <span className="text-on-surface-variant">/{r.sasaran}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell">{r.izin}</td>
                    <td className="hidden px-4 py-3 text-right sm:table-cell lg:pr-6">{r.alpa}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
