"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, House, QrCode, type LucideIcon } from "lucide-react";

const menu: { label: string; href: string; ikon: LucideIcon }[] = [
  { label: "Beranda", href: "/app-peserta", ikon: House },
  { label: "Jadwal", href: "/app-peserta/jadwal", ikon: CalendarDays },
  { label: "Materi", href: "/app-peserta/materi", ikon: BookOpen },
  { label: "Kartu", href: "/app-peserta/kartu", ikon: QrCode },
];

// Navigasi bawah gaya Material 3 untuk tampilan peserta di HP.
// Menu aktif ditandai pil berwarna di belakang ikon, yang melebar dengan pantulan pegas.
export function NavBawah() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Menu peserta"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md bg-surface-mid px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2"
    >
      {menu.map((m) => {
        const aktif = m.href === "/app-peserta" ? pathname === m.href : pathname.startsWith(m.href);
        const Ikon = m.ikon;
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={aktif ? "page" : undefined}
            className="group flex flex-1 flex-col items-center gap-1 py-1 text-xs font-semibold"
          >
            <span className="relative grid h-8 w-16 place-items-center">
              <span
                className={`absolute inset-0 rounded-full bg-secondary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  aktif ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50 group-hover:bg-surface-highest"
                }`}
              />
              <Ikon size={20} strokeWidth={aktif ? 2.4 : 1.8} className={`relative ${aktif ? "text-on-secondary-container" : "text-on-surface-variant"}`} />
            </span>
            <span className={aktif ? "text-on-surface" : "text-on-surface-variant"}>{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
