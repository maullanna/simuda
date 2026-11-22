import {
  CalendarDays,
  ChartColumn,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Network,
  Baby,
  UsersRound,
  ShieldCheck,
  ScanLine,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Fitur } from "@/lib/hak-akses";

// Daftar menu pengurus. Dipakai sidebar (untuk tautan) dan navbar (untuk judul halaman).

// segera = menu sudah ada, isinya belum (ditandai label "Segera" di sidebar).
export type ItemMenu = { label: string; href: string; ikon: LucideIcon; fitur: Fitur; segera?: boolean };

// Menu dikelompokkan supaya mudah dipindai: kegiatan pengajian, master data (orang), lalu organisasi.
export const kelompokMenu: { judul: string; item: ItemMenu[] }[] = [
  {
    judul: "Pengajian",
    item: [
      { label: "Beranda", href: "/dashboard", ikon: LayoutDashboard, fitur: "beranda" },
      { label: "Absensi", href: "/absensi", ikon: ScanLine, fitur: "daftarHadir" },
      { label: "Jadwal & materi", href: "/jadwal", ikon: CalendarDays, fitur: "sesi" },
      { label: "Rekap", href: "/rekap", ikon: ChartColumn, fitur: "rekap" },
    ],
  },
  {
    judul: "Master data",
    item: [
      { label: "Pemuda/i", href: "/peserta", ikon: Users, fitur: "peserta" },
      { label: "Bapak & Ibu", href: "/bapak-ibu", ikon: UsersRound, fitur: "bapakIbu", segera: true },
      { label: "Caberawit", href: "/caberawit", ikon: Baby, fitur: "caberawit", segera: true },
    ],
  },
  {
    judul: "Organisasi",
    item: [
      { label: "Sodaqoh", href: "/sodaqoh", ikon: Wallet, fitur: "sodaqohMasuk" },
      { label: "Musyawarah", href: "/musyawarah", ikon: MessagesSquare, fitur: "musyawarah" },
      { label: "Masukan", href: "/masukan", ikon: Inbox, fitur: "masukan" },
      { label: "Kepengurusan", href: "/kepengurusan", ikon: Network, fitur: "pengurus" },
      { label: "Level pengguna", href: "/level-pengguna", ikon: ShieldCheck, fitur: "levelPengguna" },
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
