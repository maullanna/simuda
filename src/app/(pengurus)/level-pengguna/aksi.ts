"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { KODE_BAWAAN, hakAwal, rapikanHak, type KodeLevel } from "@/lib/hak-akses";
import { requireRole } from "@/lib/pengguna";

export type HasilLevel = { ok: true; id: string } | { ok: false; pesan: string; galat?: Partial<Record<"nama" | "keterangan", string>> };

const skemaLevel = z.object({
  nama: z.string().trim().min(2, { error: "Nama level minimal 2 huruf" }).max(40, { error: "Nama level terlalu panjang" }),
  keterangan: z
    .string()
    .trim()
    .max(200, { error: "Keterangan terlalu panjang" })
    .transform((s) => s || null),
});

function segarkan() {
  revalidatePath("/level-pengguna");
  revalidatePath("/kepengurusan");
}

// id kosong = level baru. hak = hasil centang { fitur: ["lihat", ...] }, dirapikan di server.
export async function simpanLevel(id: string | null, isi: { nama: string; keterangan: string; hak: unknown }): Promise<HasilLevel> {
  const pengguna = await requireRole("levelPengguna", "jalankan");
  const cek = skemaLevel.safeParse({ nama: isi.nama, keterangan: isi.keterangan });
  if (!cek.success) {
    const galat = Object.fromEntries(Object.entries(z.flattenError(cek.error).fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]));
    return { ok: false, pesan: "Periksa lagi isiannya.", galat };
  }
  const hak = rapikanHak(isi.hak);

  const kembar = await prisma.levelPengguna.findFirst({
    where: { nama: { equals: cek.data.nama, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (kembar) return { ok: false, pesan: "Periksa lagi isiannya.", galat: { nama: "Nama level ini sudah dipakai" } };

  if (!id) {
    const baru = await prisma.$transaction(async (tx) => {
      const l = await tx.levelPengguna.create({ data: { nama: cek.data.nama, keterangan: cek.data.keterangan, hak } });
      await tx.auditLog.create({ data: { userId: pengguna.userId, tabel: "level_pengguna", recordId: l.id, aksi: "buat", dataBaru: { ...cek.data, hak } } });
      return l;
    });
    segarkan();
    return { ok: true, id: baru.id };
  }

  const lama = await prisma.levelPengguna.findUnique({ where: { id } });
  if (!lama) return { ok: false, pesan: "Level tidak ditemukan." };
  if (lama.aksesPenuh) return { ok: false, pesan: "Level Administrator terkunci dan tidak bisa diubah." };

  await prisma.$transaction([
    prisma.levelPengguna.update({ where: { id }, data: { nama: cek.data.nama, keterangan: cek.data.keterangan, hak } }),
    prisma.auditLog.create({
      data: {
        userId: pengguna.userId,
        tabel: "level_pengguna",
        recordId: id,
        aksi: "ubah",
        dataLama: { nama: lama.nama, keterangan: lama.keterangan, hak: rapikanHak(lama.hak) },
        dataBaru: { ...cek.data, hak },
      },
    }),
  ]);
  segarkan();
  return { ok: true, id };
}

// Level bawaan: kembalikan hak ke hak awal tabel KONSEP 3.2.
export async function kembalikanHakAwal(id: string): Promise<HasilLevel> {
  const pengguna = await requireRole("levelPengguna", "jalankan");
  const lama = await prisma.levelPengguna.findUnique({ where: { id } });
  if (!lama) return { ok: false, pesan: "Level tidak ditemukan." };
  if (lama.aksesPenuh) return { ok: false, pesan: "Level Administrator terkunci." };
  if (!lama.kode || !(KODE_BAWAAN as readonly string[]).includes(lama.kode)) return { ok: false, pesan: "Hanya level bawaan yang punya hak awal." };

  const hak = hakAwal(lama.kode as KodeLevel);
  await prisma.$transaction([
    prisma.levelPengguna.update({ where: { id }, data: { hak } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "level_pengguna", recordId: id, aksi: "ubah", dataLama: { hak: rapikanHak(lama.hak) }, dataBaru: { hak }, alasan: "Kembalikan ke hak awal" },
    }),
  ]);
  segarkan();
  return { ok: true, id };
}

// Hapus level yang tidak dipakai siapa pun. Level Administrator dan Petugas scan tidak bisa dihapus
// (Petugas scan dipakai bagian "Petugas scan" di Kepengurusan).
export async function hapusLevel(id: string): Promise<HasilLevel> {
  const pengguna = await requireRole("levelPengguna", "jalankan");
  const lama = await prisma.levelPengguna.findUnique({ where: { id }, include: { _count: { select: { pengurus: true } } } });
  if (!lama) return { ok: false, pesan: "Level tidak ditemukan." };
  if (lama.aksesPenuh || lama.kode === "petugas_scan") return { ok: false, pesan: `Level ${lama.nama} tidak bisa dihapus.` };
  if (lama._count.pengurus > 0) {
    return { ok: false, pesan: `Masih dipakai ${lama._count.pengurus} pengurus. Pindahkan mereka ke level lain dulu.` };
  }

  await prisma.$transaction([
    prisma.levelPengguna.delete({ where: { id } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "level_pengguna", recordId: id, aksi: "hapus", dataLama: { nama: lama.nama, keterangan: lama.keterangan, hak: rapikanHak(lama.hak) } },
    }),
  ]);
  segarkan();
  return { ok: true, id };
}
