"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";

const pegas = "duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

// Durasi animasi ganti tema (milidetik). Ubah angka "lambat" untuk memperpanjang
// atau memperpendek gerakan pelan di tengah.
const DURASI = {
  membuka: 450, // lingkaran membuka cepat dari tombol
  lambat: 2000, // bergerak sangat pelan di tengah
  melanjutkan: 650, // lanjut cepat sampai menutupi layar
};

// Tombol ganti mode terang/gelap.
// Tema disimpan sebagai atribut <html data-tema="..."> dan di cookie "tema".
// Ikon yang tampil diatur oleh CSS (varian gelap:), jadi tombol ini tidak perlu
// tahu tema saat dirender dan tidak ada risiko tampilan server berbeda dengan browser.
export function TombolTema({ className = "", denganLabel }: { className?: string; denganLabel?: React.ReactNode }) {
  function gantiTema(e: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const berikut = root.dataset.tema === "gelap" ? "terang" : "gelap";

    function terapkan() {
      root.dataset.tema = berikut;
      document.cookie = `tema=${berikut}; path=/; max-age=31536000; samesite=lax`;
    }

    // Browser lama atau pengguna yang meminta gerak dikurangi: langsung ganti tanpa animasi.
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || kurangiGerak) {
      terapkan();
      return;
    }

    // Tampilan baru "terbuka" melingkar dari tengah tombol sampai menutupi layar.
    const kotak = e.currentTarget.getBoundingClientRect();
    const x = kotak.left + kotak.width / 2;
    const y = kotak.top + kotak.height / 2;
    const jariJari = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const lingkaran = (r: number) => `circle(${r}px at ${x}px ${y}px)`;
    const total = DURASI.membuka + DURASI.lambat + DURASI.melanjutkan;

    const transisi = document.startViewTransition(terapkan);
    transisi.ready.then(() => {
      // Tiga fase: membuka cepat, bergerak sangat pelan di tengah, lalu melanjutkan cepat.
      // `offset` = posisi titik itu di sepanjang animasi (0 = awal, 1 = akhir).
      // `easing` di tiap titik mengatur kecepatan menuju titik berikutnya.
      root.animate(
        [
          { clipPath: lingkaran(0), offset: 0, easing: "cubic-bezier(0.2, 0, 0, 1)" },
          { clipPath: lingkaran(jariJari * 0.35), offset: DURASI.membuka / total, easing: "linear" },
          {
            clipPath: lingkaran(jariJari * 0.45),
            offset: (DURASI.membuka + DURASI.lambat) / total,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          { clipPath: lingkaran(jariJari), offset: 1 },
        ],
        { duration: total, pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={gantiTema}
      aria-label="Ganti mode terang atau gelap"
      className={`group relative grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface ${className}`}
    >
      {/* Mode terang: tampil bulan (klik untuk gelap). Mode gelap: tampil matahari. */}
      <Moon
        size={20}
        className={`col-start-1 row-start-1 transition-all ${pegas} group-hover:-rotate-12 gelap:rotate-90 gelap:scale-0 gelap:opacity-0`}
      />
      <Sun
        size={20}
        className={`col-start-1 row-start-1 -rotate-90 scale-0 opacity-0 transition-all ${pegas} gelap:rotate-0 gelap:scale-100 gelap:opacity-100 gelap:group-hover:rotate-45`}
      />
      {denganLabel}
    </button>
  );
}
