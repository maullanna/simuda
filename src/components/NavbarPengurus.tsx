"use client";

import { usePathname } from "next/navigation";
import { ChevronsLeft, Menu } from "lucide-react";
import { FilterTanggal } from "@/components/FilterTanggal";
import { LabelMelayang } from "@/components/LabelMelayang";
import { TombolTema } from "@/components/TombolTema";
import { judulHalaman, menuAktif } from "@/lib/menu";

// Halaman yang datanya bisa disaring per periode. Di halaman lain filter tanggal disembunyikan.
const HALAMAN_BERPERIODE = ["/dashboard", "/absensi", "/rekap", "/sodaqoh", "/masukan"];

const tombolBulat =
  "group relative grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface";

export function NavbarPengurus({
  ciut,
  gantiCiut,
  bukaLaci,
  hariIni,
}: {
  ciut: boolean;
  gantiCiut: () => void;
  bukaLaci: () => void;
  hariIni: string;
}) {
  const pathname = usePathname();
  const adaFilter = HALAMAN_BERPERIODE.some((href) => menuAktif(pathname, href));

  return (
    <header className="sticky top-0 z-30 bg-surface px-4 pb-2 pt-3 lg:px-10 lg:pt-4">
      <div className="flex h-14 items-center gap-1 rounded-full bg-surface-low px-2">
        {/* HP: buka laci menu */}
        <button type="button" onClick={bukaLaci} aria-label="Buka menu" className={`${tombolBulat} lg:hidden`}>
          <Menu size={20} />
        </button>

        {/* Laptop: ciutkan/lebarkan sidebar. Ikon « diputar 180° menjadi » saat ciut. */}
        <button
          type="button"
          onClick={gantiCiut}
          aria-label={ciut ? "Lebarkan sidebar" : "Ciutkan sidebar"}
          aria-expanded={!ciut}
          className={`${tombolBulat} hidden lg:grid`}
        >
          <ChevronsLeft
            size={20}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${ciut ? "rotate-180" : ""}`}
          />
          <LabelMelayang teks={`${ciut ? "Lebarkan" : "Ciutkan"} sidebar · Ctrl+B`} posisi="bawah-kiri" />
        </button>

        <p className="ml-1 truncate font-bold">{judulHalaman(pathname)}</p>

        <div className="ml-auto flex items-center gap-1">
          {adaFilter && <FilterTanggal hariIni={hariIni} />}
          <TombolTema className={tombolBulat} denganLabel={<LabelMelayang teks="Mode terang / gelap" posisi="bawah" />} />
        </div>
      </div>
    </header>
  );
}
