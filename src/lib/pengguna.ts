// Siapa yang sedang masuk, dan apakah ia boleh membuka halaman/menjalankan aksi ini.
// Aturan keamanan no. 1: SETIAP halaman pengurus dan Server Action wajib lewat requireRole().
// Menyembunyikan tombol di tampilan tidak cukup.
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Peran } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boleh, type Aksi, type Fitur } from "@/lib/hak-akses";

export type PenggunaMasuk = {
  userId: string;
  email: string;
  pengurusId: string;
  nama: string;
  jabatan: string;
  wilayah: string; // "Pimpinan" / "Bendlay 2" / "Bendlay 4"
  peran: Peran;
};

const labelWilayah = { pimpinan: "Pimpinan", bendlay_2: "Bendlay 2", bendlay_4: "Bendlay 4" } as const;

// cache(): dalam satu kali membuka halaman, sesi hanya dicek sekali ke database
// walaupun fungsi ini dipanggil dari layout, halaman, dan komponen sekaligus.
export const ambilPenggunaMasuk = cache(async (): Promise<PenggunaMasuk | null> => {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) return null;

  const pengurus = await prisma.pengurus.findUnique({ where: { userId: sesi.user.id } });
  // Akun yang tidak terhubung ke data pengurus, atau pengurus yang sudah dinonaktifkan, tidak diberi akses.
  if (!pengurus || !pengurus.aktif) return null;

  return {
    userId: sesi.user.id,
    email: sesi.user.email,
    pengurusId: pengurus.id,
    nama: pengurus.nama,
    jabatan: pengurus.jabatan,
    wilayah: labelWilayah[pengurus.wilayah],
    peran: pengurus.peran,
  };
});

// Halaman pertama setelah masuk: petugas scan langsung ke Scanner, yang lain ke Beranda.
export function halamanAwal(peran: Peran): string {
  return peran === "petugas_scan" ? "/scan" : "/dashboard";
}

// Pemeriksaan akses per fitur dan tindakan (tabel di lib/hak-akses.ts = KONSEP 3.2).
// Untuk halaman: belum masuk -> ke /masuk; tidak berhak -> ke halaman awalnya.
// Untuk Server Action: dipanggil di baris pertama aksi, sebelum menyentuh database.
export async function requireRole(fitur: Fitur, aksi: Aksi): Promise<PenggunaMasuk> {
  const pengguna = await ambilPenggunaMasuk();
  if (!pengguna) redirect("/masuk");
  if (!boleh(pengguna.peran, fitur, aksi)) redirect(halamanAwal(pengguna.peran));
  return pengguna;
}
