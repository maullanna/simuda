// Lapisan data level pengguna (KONSEP 3.1). Hanya untuk server; halaman/aksi wajib memeriksa
// requireRole("levelPengguna", "jalankan") (hanya Administrator) sebelum memakai ini.
import "server-only";
import { prisma } from "@/lib/db";
import { rapikanHak, type HakLevel } from "@/lib/hak-akses";

export type LevelLengkap = {
  id: string;
  kode: string | null;
  nama: string;
  keterangan: string | null;
  aksesPenuh: boolean;
  hak: HakLevel;
  jumlahPengurus: number;
};

function keLengkap(l: { id: string; kode: string | null; nama: string; keterangan: string | null; aksesPenuh: boolean; hak: unknown; _count: { pengurus: number } }): LevelLengkap {
  return { id: l.id, kode: l.kode, nama: l.nama, keterangan: l.keterangan, aksesPenuh: l.aksesPenuh, hak: rapikanHak(l.hak), jumlahPengurus: l._count.pengurus };
}

export async function ambilDaftarLevel(): Promise<LevelLengkap[]> {
  const semua = await prisma.levelPengguna.findMany({
    orderBy: [{ aksesPenuh: "desc" }, { dibuatAt: "asc" }],
    include: { _count: { select: { pengurus: true } } },
  });
  return semua.map(keLengkap);
}

export async function ambilLevel(id: string): Promise<LevelLengkap | null> {
  const l = await prisma.levelPengguna.findUnique({ where: { id }, include: { _count: { select: { pengurus: true } } } });
  return l ? keLengkap(l) : null;
}
