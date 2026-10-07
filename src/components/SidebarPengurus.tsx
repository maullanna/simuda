"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ChartColumn,
  Inbox,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Network,
  ScanLine,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { penggunaAktif } from "@/lib/mock";

// Komponen ini "use client" karena butuh dua hal yang hanya ada di browser:
// usePathname (tahu halaman mana yang sedang dibuka) dan useState (laci menu di HP).

const menu: { label: string; href: string; ikon: LucideIcon }[] = [
  { label: "Beranda", href: "/dashboard", ikon: LayoutDashboard },
  { label: "Peserta", href: "/peserta", ikon: Users },
  { label: "Absensi", href: "/absensi", ikon: ScanLine },
  { label: "Jadwal & materi", href: "/jadwal", ikon: CalendarDays },
  { label: "Rekap", href: "/rekap", ikon: ChartColumn },
  { label: "Sodaqoh", href: "/sodaqoh", ikon: Wallet },
  { label: "Musyawarah", href: "/musyawarah", ikon: MessagesSquare },
  { label: "Masukan", href: "/masukan", ikon: Inbox },
  { label: "Kepengurusan", href: "/kepengurusan", ikon: Network },
];

function Logo() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-on-primary">
        S
      </div>
      <div className="leading-tight">
        <p className="font-extrabold">SIMUDA</p>
        <p className="text-xs text-on-surface-variant">Bendlay 2 & 4</p>
      </div>
    </div>
  );
}

export function SidebarPengurus() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const isiSidebar = (
    <>
      <nav className="mt-4 flex flex-col gap-1">
        {menu.map((item) => {
          const aktif = pathname === item.href || pathname.startsWith(item.href + "/");
          const Ikon = item.ikon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setTerbuka(false)}
              aria-current={aktif ? "page" : undefined}
              className={`flex h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors ${
                aktif
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-high"
              }`}
            >
              <Ikon size={20} strokeWidth={aktif ? 2.25 : 1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-surface-mid px-4 py-3">
        <p className="text-sm font-bold">{penggunaAktif.nama}</p>
        <p className="text-xs text-on-surface-variant">
          {penggunaAktif.jabatan} · {penggunaAktif.wilayah}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* HP: bar atas dengan tombol menu */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-1 bg-surface px-2 lg:hidden">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setTerbuka(true)}
          className="grid size-12 place-items-center rounded-full hover:bg-surface-high"
        >
          <Menu size={22} />
        </button>
        <p className="font-extrabold">SIMUDA</p>
      </header>

      {/* HP: laci menu yang muncul dari kiri */}
      {terbuka && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-on-surface/40" onClick={() => setTerbuka(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto rounded-r-[28px] bg-surface-low p-3">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setTerbuka(false)}
                className="grid size-12 place-items-center rounded-full hover:bg-surface-high"
              >
                <X size={22} />
              </button>
            </div>
            {isiSidebar}
          </aside>
        </div>
      )}

      {/* Laptop: sidebar tetap di kiri */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto bg-surface-low p-3 lg:flex">
        <Logo />
        {isiSidebar}
      </aside>
    </>
  );
}
