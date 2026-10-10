import {
  CalendarDays,
  ChartColumn,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Network,
  ScanLine,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Fitur } from "@/lib/hak-akses";

// Daftar menu pengurus. Dipakai sidebar (untuk tautan) dan navbar (untuk judul halaman).

export type ItemMenu = { label: string; href: string; ikon: LucideIcon; fitur: Fitur };

// Menu dikelompokkan supaya mudah dipindai: kegiatan pengajian dulu, lalu organisasi.
export const kelompokMenu: { judul: string; item: ItemMenu[] }[] = [
  {
    judul: "Pengajian",
    item: [
      { label: "Beranda", href: "/dashboard", ikon: LayoutDashboard, fitur: "beranda" },
      { label: "Peserta", href: "/peserta", ikon: Users, fitur: "peserta" },
      { label: "Absensi", href: "/absensi", ikon: ScanLine, fitur: "daftarHadir" },
      { label: "Jadwal & materi", href: "/jadwal", ikon: CalendarDays, fitur: "sesi" },
      { label: "Rekap", href: "/rekap", ikon: ChartColumn, fitur: "rekap" },
    ],
  },
  {
    judul: "Organisasi",
    item: [
      { label: "Sodaqoh", href: "/sodaqoh", ikon: Wallet, fitur: "sodaqohMasuk" },
      { label: "Musyawarah", href: "/musyawarah", ikon: MessagesSquare, fitur: "musyawarah" },
      { label: "Masukan", href: "/masukan", ikon: Inbox, fitur: "masukan" },
      { label: "Kepengurusan", href: "/kepengurusan", ikon: Network, fitur: "pengurus" },
    ],
  },
];

export function menuAktif(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function judulHalaman(pathname: string): string {
  for (const kelompok of kelompokMenu) {
    for (const item of kelompok.item) {
      if (menuAktif(pathname, item.href)) return item.label;
    }
  }
  return "SIMUDA";
}
