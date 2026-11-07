// Siapa yang sedang masuk, dan apakah ia boleh membuka halaman/menjalankan aksi ini.
// Aturan keamanan no. 1: SETIAP halaman pengurus dan Server Action wajib lewat requireRole().
// Menyembunyikan tombol di tampilan tidak cukup.
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boleh, rapikanHak, type Aksi, type Fitur, type HakLevel } from "@/lib/hak-akses";
import { kelompokMenu } from "@/lib/menu";

export type PenggunaMasuk = {
  userId: string;
  email: string;
  pengurusId: string;
  nama: string;
  jabatan: string;
  wilayah: string; // "Pimpinan" / "Bendlay 2" / "Bendlay 4"
  // Level dan hak aksesnya (KONSEP 3.1). Bentuknya cocok dengan HakPengguna, jadi bisa langsung ke boleh().
  levelId: string;
  levelNama: string;
  aksesPenuh: boolean;
  hak: HakLevel;
};

const labelWilayah = { pimpinan: "Pimpinan", bendlay_2: "Bendlay 2", bendlay_4: "Bendlay 4" } as const;

// cache(): dalam satu kali membuka halaman, sesi hanya dicek sekali ke database
// walaupun fungsi ini dipanggil dari layout, halaman, dan komponen sekaligus.
export const ambilPenggunaMasuk = cache(async (): Promise<PenggunaMasuk | null> => {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) return null;

  const pengurus = await prisma.pengurus.findUnique({ where: { userId: sesi.user.id }, include: { level: true } });
  // Akun yang tidak terhubung ke data pengurus, atau pengurus yang sudah dinonaktifkan, tidak diberi akses.
  if (!pengurus || !pengurus.aktif) return null;

  return {
    userId: sesi.user.id,
    email: sesi.user.email,
    pengurusId: pengurus.id,
    nama: pengurus.nama,
    jabatan: pengurus.jabatan,
    wilayah: labelWilayah[pengurus.wilayah],
    levelId: pengurus.level.id,
    levelNama: pengurus.level.nama,
    aksesPenuh: pengurus.level.aksesPenuh,
    hak: rapikanHak(pengurus.level.hak),
  };
});

// Halaman pertama setelah masuk, sesuai hak levelnya: Beranda; kalau tidak boleh, Scanner (petugas scan);
// kalau tidak juga, menu pertama yang boleh dibuka (misalnya Sodaqoh); terakhir Akun saya.
export function halamanAwal(p: PenggunaMasuk): string {
  if (boleh(p, "beranda", "lihat")) return "/dashboard";
  if (boleh(p, "scan", "jalankan")) return "/scan";
  const menu = kelompokMenu.flatMap((k) => k.item).find((m) => boleh(p, m.fitur, "lihat"));
  return menu?.href ?? "/akun";
}

// Pemeriksaan akses per fitur dan tindakan (tabel di lib/hak-akses.ts = KONSEP 3.2).
// Untuk halaman: belum masuk -> ke /masuk; tidak berhak -> ke halaman awalnya.
// Untuk Server Action: dipanggil di baris pertama aksi, sebelum menyentuh database.
export async function requireRole(fitur: Fitur, aksi: Aksi): Promise<PenggunaMasuk> {
  const pengguna = await ambilPenggunaMasuk();
  if (!pengguna) redirect("/masuk");
  if (!boleh(pengguna, fitur, aksi)) redirect(halamanAwal(pengguna));
  return pengguna;
}
