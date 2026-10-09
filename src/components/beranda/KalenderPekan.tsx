"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTanggal, geserTanggal, hariDalamPekan } from "@/lib/sesi";

// Hari pengajian rutin: Selasa, Kamis, Sabtu (masih contoh, lihat pertanyaan terbuka di KONSEP).
const HARI_RUTIN = [2, 4, 6];

// Kalender satu pekan. "use client" karena pekan yang tampil dan hari yang dipilih
// disimpan di state, berubah saat tombol panah atau tanggal diklik.
export function KalenderPekan({ hariIni, jumlahPengajianPekanIni }: { hariIni: string; jumlahPengajianPekanIni: number }) {
  const [geserPekan, setGeserPekan] = useState(0);
  const [dipilih, setDipilih] = useState(hariIni);

  // 7 hari dengan hari ini di tengah, digeser per 7 hari oleh tombol panah.
  const tengah = geserTanggal(hariIni, geserPekan * 7);
  const hari = Array.from({ length: 7 }, (_, i) => geserTanggal(tengah, i - 3));

  const adaPengajian = (t: string) => t === hariIni || HARI_RUTIN.includes(hariDalamPekan(t));

  return (
    <section
      className="muncul flex flex-col gap-4 rounded-[28px] bg-surface-low p-5"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="rounded-lg bg-secondary-container px-2.5 py-1 font-bold text-on-secondary-container">
          {jumlahPengajianPekanIni} hari pengajian pekan ini
        </span>
        <span className="text-on-surface-variant">Selasa · Kamis · Sabtu</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Pekan sebelumnya"
          onClick={() => setGeserPekan((g) => g - 1)}
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-surface-highest"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="min-w-36 text-center font-bold">{formatTanggal(tengah, { month: "long", year: "numeric" })}</p>
        <button
          type="button"
          aria-label="Pekan berikutnya"
          onClick={() => setGeserPekan((g) => g + 1)}
          className="grid size-9 place-items-center rounded-full transition-colors hover:bg-surface-highest"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {hari.map((t) => {
          const aktif = t === dipilih;
          const hariIniKah = t === hariIni;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setDipilih(t)}
              aria-pressed={aktif}
              className="group/hari flex flex-col items-center gap-1.5"
            >
              <span className="text-[11px] font-bold uppercase text-on-surface-variant">
                {formatTanggal(t, { weekday: "short" })}
              </span>
              <span
                className={`grid size-10 place-items-center rounded-full text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/hari:scale-110 ${
                  aktif
                    ? "bg-primary text-on-primary"
                    : hariIniKah
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-highest/70"
                }`}
              >
                {Number(t.slice(8))}
              </span>
              <span className={`size-1.5 rounded-full ${adaPengajian(t) ? "bg-primary" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">{formatTanggal(dipilih, { weekday: "long", day: "numeric", month: "long" })}</span>
        {" · "}
        {adaPengajian(dipilih) ? "Pengajian putra & putri, 19.30" : "Tidak ada pengajian"}
      </p>

      <Link href="/jadwal" className="mx-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
        <CalendarDays size={16} /> Lihat jadwal
      </Link>
    </section>
  );
}
