"use client";

import { useState } from "react";

export type Angka = { hadir: number; izin: number; alpa: number; sasaran: number };

export type TitikKehadiran = {
  tanggal: string;
  label: string; // contoh "1 Okt", untuk sumbu bawah
  labelPanjang: string; // contoh "Kamis, 1 Oktober", untuk rincian saat hover
  gabungan: Angka;
  putra: Angka | null;
  putri: Angka | null;
};

type Mode = "gabungan" | "kelompok";

function persen(a: Angka | null): number {
  return a && a.sasaran ? Math.round((a.hadir / a.sasaran) * 100) : 0;
}

const GARIS_BANTU = [100, 75, 50, 25, 0];
const pegas = "duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

// Grafik batang persentase hadir per hari pengajian.
// "use client" karena ada pilihan tampilan dan rincian saat batang disorot.
export function GrafikKehadiran({ data, periode }: { data: TitikKehadiran[]; periode: string }) {
  const [mode, setMode] = useState<Mode>("gabungan");
  const [aktif, setAktif] = useState<number | null>(null);

  const total = data.reduce(
    (t, d) => ({ hadir: t.hadir + d.gabungan.hadir, sasaran: t.sasaran + d.gabungan.sasaran }),
    { hadir: 0, sasaran: 0 },
  );
  const rataRata = total.sasaran ? Math.round((total.hadir / total.sasaran) * 100) : 0;

  // Kalau titiknya banyak, label tanggal di bawah ditampilkan berselang supaya tidak bertumpuk.
  const selang = Math.max(1, Math.ceil(data.length / 8));
  const titikAktif = aktif !== null ? data[aktif] : null;

  return (
    <section className="muncul flex flex-col gap-5 rounded-[28px] bg-surface-low p-5 lg:p-6" style={{ animationDelay: "440ms" }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Grafik kehadiran · {periode}
          </p>
          <h2 className="text-lg font-extrabold">Persentase hadir per pengajian</h2>
          {data.length > 0 && (
            <p className="text-sm text-on-surface-variant">
              Rata-rata <span className="font-bold text-on-surface">{rataRata}%</span> dari {data.length} hari pengajian
            </p>
          )}
        </div>
        {/* Pilihan tampilan */}
        <div className="flex rounded-full bg-surface-mid p-1 text-xs font-bold" role="group" aria-label="Tampilan grafik">
          {(
            [
              ["gabungan", "Gabungan"],
              ["kelompok", "Putra & putri"],
            ] as const
          ).map(([nilai, label]) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setMode(nilai)}
              aria-pressed={mode === nilai}
              className={`h-8 rounded-full px-3 transition-colors ${
                mode === nilai ? "bg-surface text-on-surface" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {data.length === 0 ? (
        <p className="py-16 text-center text-on-surface-variant">Belum ada pengajian selesai di periode ini.</p>
      ) : (
        <>
          <div className="flex gap-2">
            {/* Sumbu kiri */}
            <div className="relative h-56 w-9 shrink-0 text-right text-[11px] text-on-surface-variant">
              {GARIS_BANTU.map((g) => (
                <span key={g} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - g}%` }}>
                  {g}%
                </span>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              {/* Garis bantu, sengaja tipis dan pudar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-56">
                {GARIS_BANTU.map((g) => (
                  <div
                    key={g}
                    className={`absolute inset-x-0 border-t ${g === 0 ? "border-outline-variant" : "border-dashed border-outline-variant/50"}`}
                    style={{ top: `${100 - g}%` }}
                  />
                ))}
              </div>

              {/* Batang */}
              <div className="relative flex h-56 items-end gap-1" onMouseLeave={() => setAktif(null)}>
                {data.map((d, i) => {
                  const sorot = aktif === i;
                  const redup = aktif !== null && !sorot;
                  return (
                    <button
                      key={d.tanggal}
                      type="button"
                      onMouseEnter={() => setAktif(i)}
                      onFocus={() => setAktif(i)}
                      onBlur={() => setAktif(null)}
                      onClick={() => setAktif(sorot ? null : i)}
                      aria-label={`${d.labelPanjang}: ${persen(d.gabungan)}% hadir`}
                      className={`flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-t-lg transition-colors ${sorot ? "bg-surface-highest/60" : ""}`}
                    >
                      {mode === "gabungan" ? (
                        <span
                          className={`w-full max-w-7 rounded-t-[4px] bg-grafik-1 transition-all ${pegas} ${redup ? "opacity-40" : ""}`}
                          style={{ height: `${Math.max(persen(d.gabungan), 1)}%` }}
                        />
                      ) : (
                        (["putra", "putri"] as const).map((k) => (
                          <span
                            key={k}
                            className={`w-full max-w-4 rounded-t-[4px] transition-all ${pegas} ${k === "putra" ? "bg-grafik-1" : "bg-grafik-2"} ${redup ? "opacity-40" : ""}`}
                            style={{ height: `${Math.max(persen(d[k]), 1)}%` }}
                          />
                        ))
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Label tanggal */}
              <div className="mt-2 flex gap-1">
                {data.map((d, i) => (
                  <span
                    key={d.tanggal}
                    className={`min-w-0 flex-1 truncate text-center text-[11px] ${aktif === i ? "font-bold text-on-surface" : "text-on-surface-variant"}`}
                  >
                    {i % selang === 0 || aktif === i ? d.label : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rincian titik yang disorot, atau legenda saat tidak ada yang disorot */}
          <div className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl bg-surface-mid px-4 py-2.5 text-sm">
            {titikAktif ? (
              <>
                <span className="font-bold">{titikAktif.labelPanjang}</span>
                {mode === "gabungan" ? (
                  <span className="text-on-surface-variant">
                    Hadir <b className="text-on-surface">{titikAktif.gabungan.hadir}</b> dari {titikAktif.gabungan.sasaran} (
                    {persen(titikAktif.gabungan)}%) · Izin {titikAktif.gabungan.izin} · Alpa {titikAktif.gabungan.alpa}
                  </span>
                ) : (
                  (["putra", "putri"] as const).map((k) => (
                    <span key={k} className="inline-flex items-center gap-1.5 text-on-surface-variant">
                      <span className={`size-2.5 rounded-full ${k === "putra" ? "bg-grafik-1" : "bg-grafik-2"}`} />
                      {k === "putra" ? "Putra" : "Putri"}{" "}
                      <b className="text-on-surface">
                        {titikAktif[k]?.hadir ?? 0}/{titikAktif[k]?.sasaran ?? 0}
                      </b>{" "}
                      ({persen(titikAktif[k])}%)
                    </span>
                  ))
                )}
              </>
            ) : mode === "kelompok" ? (
              <>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="size-2.5 rounded-full bg-grafik-1" /> Putra
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="size-2.5 rounded-full bg-grafik-2" /> Putri
                </span>
                <span className="text-on-surface-variant">Arahkan kursor ke batang untuk melihat rinciannya.</span>
              </>
            ) : (
              <span className="text-on-surface-variant">Arahkan kursor ke batang untuk melihat rinciannya.</span>
            )}
          </div>

          {/* Versi tabel untuk pembaca layar */}
          <table className="sr-only">
            <caption>Kehadiran per hari pengajian, {periode}</caption>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hadir</th>
                <th>Sasaran</th>
                <th>Izin</th>
                <th>Alpa</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.tanggal}>
                  <td>{d.labelPanjang}</td>
                  <td>{d.gabungan.hadir}</td>
                  <td>{d.gabungan.sasaran}</td>
                  <td>{d.gabungan.izin}</td>
                  <td>{d.gabungan.alpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
