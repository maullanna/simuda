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

// Daftar menu pengurus. Dipakai sidebar (untuk tautan) dan navbar (untuk judul halaman).

export type ItemMenu = { label: string; href: string; ikon: LucideIcon };

// Menu dikelompokkan supaya mudah dipindai: kegiatan pengajian dulu, lalu organisasi.
export const kelompokMenu: { judul: string; item: ItemMenu[] }[] = [
  {
    judul: "Pengajian",
    item: [
      { label: "Beranda", href: "/dashboard", ikon: LayoutDashboard },
      { label: "Peserta", href: "/peserta", ikon: Users },
      { label: "Absensi", href: "/absensi", ikon: ScanLine },
      { label: "Jadwal & materi", href: "/jadwal", ikon: CalendarDays },
      { label: "Rekap", href: "/rekap", ikon: ChartColumn },
    ],
  },
  {
    judul: "Organisasi",
    item: [
      { label: "Sodaqoh", href: "/sodaqoh", ikon: Wallet },
      { label: "Musyawarah", href: "/musyawarah", ikon: MessagesSquare },
      { label: "Masukan", href: "/masukan", ikon: Inbox },
      { label: "Kepengurusan", href: "/kepengurusan", ikon: Network },
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
