// Lapisan data kepengurusan: pengurus, petugas scan, dan status akun login masing-masing.
// Hanya untuk server. Hak akses tetap diperiksa di halaman/aksi lewat requireRole().
import "server-only";
import type { WilayahPengurus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { LevelRingkas } from "@/lib/kepengurusan";

export const labelWilayahPengurus: Record<WilayahPengurus, string> = {
  pimpinan: "Pimpinan",
  bendlay_2: "Bendlay 2",
  bendlay_4: "Bendlay 4",
};

export function keWilayahPengurusDb(w: string): WilayahPengurus {
  return w === "Pimpinan" ? "pimpinan" : w === "Bendlay 4" ? "bendlay_4" : "bendlay_2";
}

export type PengurusTampil = {
  id: string;
  nama: string;
  jabatan: string;
  wilayah: string;
  levelId: string;
  level: LevelRingkas & { kode: string | null };
  aktif: boolean; // false = akses dicabut
  email: string | null; // null = belum punya akun login
  pesertaId: string | null; // terisi untuk petugas scan
};

export async function ambilSemuaPengurus(): Promise<PengurusTampil[]> {
  const semua = await prisma.pengurus.findMany({
    orderBy: [{ wilayah: "asc" }, { dibuatAt: "asc" }],
    include: { user: { select: { email: true } }, level: { select: { id: true, nama: true, kode: true, aksesPenuh: true } } },
  });
  return semua.map((p) => ({
    id: p.id,
    nama: p.nama,
    jabatan: p.jabatan,
    wilayah: labelWilayahPengurus[p.wilayah],
    levelId: p.levelId,
    level: p.level,
    aktif: p.aktif,
    email: p.user?.email ?? null,
    pesertaId: p.pesertaId,
  }));
}

// Semua level untuk pilihan di form pengurus. Level Administrator ikut dikirim, tapi form hanya
// menampilkannya kepada Administrator (server juga menolak kalau bukan Administrator).
export async function ambilSemuaLevel(): Promise<(LevelRingkas & { kode: string | null })[]> {
  return prisma.levelPengguna.findMany({
    orderBy: [{ aksesPenuh: "desc" }, { dibuatAt: "asc" }],
    select: { id: true, nama: true, kode: true, aksesPenuh: true },
  });
}
