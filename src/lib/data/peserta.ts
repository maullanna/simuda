// Lapisan data peserta: membaca dari database lalu menerjemahkan ke bentuk yang dipakai tampilan
// (enum database seperti "bendlay_2" -> "Bendlay 2", tanggal -> teks "YYYY-MM-DD").
// Hanya boleh dipakai di server. Pemeriksaan hak akses tetap di halaman/aksi lewat requireRole().
import "server-only";
import type { Peserta as PesertaDb, Wilayah as WilayahDb } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { Peserta, Wilayah } from "@/lib/peserta";

const labelWilayah: Record<WilayahDb, Wilayah> = { bendlay_2: "Bendlay 2", bendlay_4: "Bendlay 4" };

export function keWilayahDb(w: Wilayah): WilayahDb {
  return w === "Bendlay 4" ? "bendlay_4" : "bendlay_2";
}

// Kolom @db.Date dibaca sebagai tengah malam UTC; cukup ambil bagian tanggalnya.
export const keTeksTanggal = (d: Date) => d.toISOString().slice(0, 10);
export const keTanggalDb = (t: string) => new Date(`${t}T00:00:00Z`);

export function keTampilan(p: PesertaDb): Peserta {
  return {
    id: p.id,
    nama: p.nama,
    jenisKelamin: p.jenisKelamin,
    wilayah: labelWilayah[p.wilayah],
    tanggalLahir: keTeksTanggal(p.tanggalLahir),
    noHp: p.noHp ?? "",
    status: p.status,
    tanggalBergabung: keTeksTanggal(p.tanggalBergabung),
  };
}

export async function ambilSemuaPeserta(): Promise<Peserta[]> {
  const semua = await prisma.peserta.findMany({ orderBy: { nama: "asc" } });
  return semua.map(keTampilan);
}

export async function ambilPeserta(id: string): Promise<Peserta | null> {
  const p = await prisma.peserta.findUnique({ where: { id } });
  return p ? keTampilan(p) : null;
}

export async function ambilKartuAktif(pesertaId: string) {
  return prisma.kartu.findFirst({ where: { pesertaId, aktif: true }, select: { id: true, dibuatAt: true } });
}

// Untuk cetak kartu: peserta aktif beserta token kartu aktifnya.
export async function ambilPesertaUntukKartu() {
  const semua = await prisma.peserta.findMany({
    where: { status: "aktif" },
    orderBy: { nama: "asc" },
    include: { kartu: { where: { aktif: true }, select: { token: true } } },
  });
  return semua
    .filter((p) => p.kartu.length > 0)
    .map((p) => ({ id: p.id, nama: p.nama, jenisKelamin: p.jenisKelamin, wilayah: labelWilayah[p.wilayah], token: p.kartu[0].token }));
}
