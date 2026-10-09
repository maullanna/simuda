"use client";

import { useState } from "react";

type Bagian = { kunci: string; label: string; nilai: number; warna: string; titik: string };

const JARI_JARI = 48;
const KELILING = 2 * Math.PI * JARI_JARI;
const CELAH = 2.5; // celah antar potongan, dalam satuan keliling

// Donat komposisi status kehadiran dalam periode terpilih.
// Warna "alpa" sengaja kuning tua, bukan merah (prinsip KONSEP bagian 6).
export function DonatKomposisi({
  hadir,
  izin,
  alpa,
  periode,
}: {
  hadir: number;
  izin: number;
  alpa: number;
  periode: string;
}) {
  const [aktif, setAktif] = useState<string | null>(null);

  const bagian: Bagian[] = [
    { kunci: "hadir", label: "Hadir", nilai: hadir, warna: "stroke-grafik-1", titik: "bg-grafik-1" },
    { kunci: "izin", label: "Izin", nilai: izin, warna: "stroke-grafik-2", titik: "bg-grafik-2" },
    { kunci: "alpa", label: "Alpa", nilai: alpa, warna: "stroke-grafik-3", titik: "bg-grafik-3" },
  ];
  const total = hadir + izin + alpa;
  const persen = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  // Hitung posisi awal tiap potongan di sepanjang lingkaran.
  let posisi = 0;
  const potongan = bagian.map((b) => {
    const panjang = total ? (b.nilai / total) * KELILING : 0;
    const hasil = { ...b, awal: posisi, panjang };
    posisi += panjang;
    return hasil;
  });

  const disorot = bagian.find((b) => b.kunci === aktif);

  return (
    <section className="muncul flex flex-col gap-5 rounded-[28px] bg-surface-low p-5 lg:p-6" style={{ animationDelay: "480ms" }}>
      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Komposisi · {periode}</p>
        <h2 className="text-lg font-extrabold">Status kehadiran</h2>
      </header>

      {total === 0 ? (
        <p className="py-16 text-center text-on-surface-variant">Belum ada data di periode ini.</p>
      ) : (
        <>
          <div className="relative mx-auto size-52">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`Hadir ${persen(hadir)}%, izin ${persen(izin)}%, alpa ${persen(alpa)}%`}>
              {/* Lingkaran dasar */}
              <circle cx="60" cy="60" r={JARI_JARI} fill="none" strokeWidth="14" className="stroke-surface-highest" />
              {potongan
                .filter((p) => p.panjang > 0)
                .map((p) => {
                  const redup = aktif !== null && aktif !== p.kunci;
                  return (
                    <circle
                      key={p.kunci}
                      cx="60"
                      cy="60"
                      r={JARI_JARI}
                      fill="none"
                      strokeWidth={aktif === p.kunci ? 17 : 14}
                      strokeDasharray={`${Math.max(p.panjang - CELAH, 0.5)} ${KELILING}`}
                      strokeDashoffset={-p.awal}
                      className={`${p.warna} cursor-pointer transition-all duration-300 ${redup ? "opacity-35" : ""}`}
                      onMouseEnter={() => setAktif(p.kunci)}
                      onMouseLeave={() => setAktif(null)}
                      onClick={() => setAktif(aktif === p.kunci ? null : p.kunci)}
                    />
                  );
                })}
            </svg>
            {/* Angka di tengah: bawaannya % hadir, berganti saat potongan disorot */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-3xl font-extrabold">{persen(disorot?.nilai ?? hadir)}%</p>
                <p className="text-xs font-semibold text-on-surface-variant">
                  {disorot ? `${disorot.label} · ${disorot.nilai} catatan` : "hadir"}
                </p>
              </div>
            </div>
          </div>

          {/* Legenda, sekaligus bisa disorot */}
          <ul className="flex flex-col gap-1">
            {bagian.map((b) => (
              <li
                key={b.kunci}
                onMouseEnter={() => setAktif(b.kunci)}
                onMouseLeave={() => setAktif(null)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${aktif === b.kunci ? "bg-surface-mid" : ""}`}
              >
                <span className={`size-3 shrink-0 rounded-full ${b.titik}`} />
                <span className="flex-1 font-semibold">{b.label}</span>
                <span className="text-on-surface-variant">{b.nilai}</span>
                <span className="w-10 text-right font-bold">{persen(b.nilai)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
