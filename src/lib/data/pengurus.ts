// Lapisan data kepengurusan: pengurus, petugas scan, dan status akun login masing-masing.
// Hanya untuk server. Hak akses tetap diperiksa di halaman/aksi lewat requireRole().
import "server-only";
import type { WilayahPengurus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { Peran } from "@/lib/kepengurusan";

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
  peran: Peran;
  aktif: boolean; // false = akses dicabut
  email: string | null; // null = belum punya akun login
  pesertaId: string | null; // terisi untuk petugas scan
};

export async function ambilSemuaPengurus(): Promise<PengurusTampil[]> {
  const semua = await prisma.pengurus.findMany({
    orderBy: [{ wilayah: "asc" }, { dibuatAt: "asc" }],
    include: { user: { select: { email: true } } },
  });
  return semua.map((p) => ({
    id: p.id,
    nama: p.nama,
    jabatan: p.jabatan,
    wilayah: labelWilayahPengurus[p.wilayah],
    peran: p.peran,
    aktif: p.aktif,
    email: p.user?.email ?? null,
    pesertaId: p.pesertaId,
  }));
}
