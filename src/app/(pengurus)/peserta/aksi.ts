"use server";

// Server Action halaman Peserta. "use server" berarti fungsi di file ini hanya berjalan di server;
// browser memanggilnya seperti fungsi biasa, tapi kodenya tidak pernah terkirim ke browser.
//
// Urutan wajib di setiap aksi (AI_RULES bagian 8):
// 1) requireRole()  2) validasi Zod  3) baru menyentuh database (+ audit_log untuk data peserta).

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { keTampilan, keTanggalDb, keWilayahDb } from "@/lib/data/peserta";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";
import { skemaPeserta } from "@/lib/skema/peserta";

// Token kartu acak 128 bit tanpa data pribadi (aturan keamanan no. 4).
const tokenAcak = () => randomBytes(16).toString("hex");

export type HasilSimpan = { ok: true; id: string } | { ok: false; galat: Record<string, string>; pesan?: string };

function bacaForm(form: FormData) {
  const teks = (k: string) => String(form.get(k) ?? "");
  return {
    nama: teks("nama"),
    jenisKelamin: teks("jenisKelamin"),
    wilayah: teks("wilayah"),
    tanggalLahir: teks("tanggalLahir"),
    noHp: teks("noHp"),
    status: form.get("status") ? teks("status") : undefined, // tidak ada di form tambah
  };
}

// id kosong = tambah peserta baru; id terisi = ubah peserta itu.
export async function simpanPeserta(id: string | null, form: FormData): Promise<HasilSimpan> {
  const pengguna = await requireRole("peserta", id ? "ubah" : "tambah");

  const hasil = skemaPeserta(tanggalHariIniWib()).safeParse(bacaForm(form));
  if (!hasil.success) {
    const galat = Object.fromEntries(Object.entries(z.flattenError(hasil.error).fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]));
    return { ok: false, galat };
  }
  const d = hasil.data;

  // Peserta ganda: nama (tanpa beda huruf besar/kecil) dan tanggal lahir sama.
  const ganda = await prisma.peserta.findFirst({
    where: {
      nama: { equals: d.nama, mode: "insensitive" },
      tanggalLahir: keTanggalDb(d.tanggalLahir),
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });
  if (ganda) return { ok: false, galat: { nama: "Peserta dengan nama dan tanggal lahir ini sudah terdaftar" } };

  const data = {
    nama: d.nama,
    jenisKelamin: d.jenisKelamin,
    wilayah: keWilayahDb(d.wilayah),
    tanggalLahir: keTanggalDb(d.tanggalLahir),
    noHp: d.noHp || null,
  };

  if (!id) {
    // Peserta baru + kartu aktif + catatan audit, sekaligus dalam satu transaksi.
    const baru = await prisma.$transaction(async (tx) => {
      const p = await tx.peserta.create({ data: { ...data, status: "aktif" } });
      await tx.kartu.create({ data: { pesertaId: p.id, token: tokenAcak() } });
      await tx.auditLog.create({
        data: { userId: pengguna.userId, tabel: "peserta", recordId: p.id, aksi: "buat", dataBaru: keTampilan(p) },
      });
      return p;
    });
    revalidatePath("/peserta");
    return { ok: true, id: baru.id };
  }

  const lama = await prisma.peserta.findUnique({ where: { id } });
  if (!lama) return { ok: false, galat: {}, pesan: "Peserta tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    const p = await tx.peserta.update({ where: { id }, data: { ...data, status: d.status } });
    // Peserta dinonaktifkan: kartunya ikut tidak berlaku. Diaktifkan lagi: dibuatkan kartu baru kalau belum ada.
    if (d.status === "tidak_aktif") {
      await tx.kartu.updateMany({
        where: { pesertaId: id, aktif: true },
        data: { aktif: false, dinonaktifkanAt: new Date(), alasanNonaktif: "Peserta tidak aktif" },
      });
    } else if (!(await tx.kartu.findFirst({ where: { pesertaId: id, aktif: true } }))) {
      await tx.kartu.create({ data: { pesertaId: id, token: tokenAcak() } });
    }
    await tx.auditLog.create({
      data: { userId: pengguna.userId, tabel: "peserta", recordId: id, aksi: "ubah", dataLama: keTampilan(lama), dataBaru: keTampilan(p) },
    });
  });
  revalidatePath("/peserta");
  revalidatePath(`/peserta/${id}/ubah`);
  return { ok: true, id };
}

const skemaGantiKartu = z.object({
  pesertaId: z.string().min(1),
  alasan: z.enum(["Hilang", "Rusak", "Lainnya"], { error: "Pilih alasan" }),
});

export type HasilGantiKartu = { ok: true; dibuatAt: string } | { ok: false; pesan: string };

// Kartu hilang/rusak (KONSEP 8.5): kartu lama langsung tidak berlaku, kartu baru dibuat.
export async function gantiKartu(pesertaId: string, alasan: string): Promise<HasilGantiKartu> {
  const pengguna = await requireRole("kartu", "tambah");

  const cek = skemaGantiKartu.safeParse({ pesertaId, alasan });
  if (!cek.success) return { ok: false, pesan: "Isian tidak valid." };

  const peserta = await prisma.peserta.findUnique({ where: { id: pesertaId }, select: { status: true } });
  if (!peserta) return { ok: false, pesan: "Peserta tidak ditemukan." };
  if (peserta.status !== "aktif") return { ok: false, pesan: "Peserta tidak aktif, kartunya tidak bisa diganti." };

  const baru = await prisma.$transaction(async (tx) => {
    const lama = await tx.kartu.updateMany({
      where: { pesertaId, aktif: true },
      data: { aktif: false, dinonaktifkanAt: new Date(), alasanNonaktif: cek.data.alasan },
    });
    const k = await tx.kartu.create({ data: { pesertaId, token: tokenAcak() } });
    await tx.auditLog.create({
      data: {
        userId: pengguna.userId,
        tabel: "kartu",
        recordId: k.id,
        aksi: "buat",
        dataBaru: { pesertaId, kartuLamaDinonaktifkan: lama.count },
        alasan: cek.data.alasan,
      },
    });
    return k;
  });

  revalidatePath(`/peserta/${pesertaId}/ubah`);
  revalidatePath("/peserta/kartu");
  return { ok: true, dibuatAt: baru.dibuatAt.toISOString().slice(0, 10) };
}
