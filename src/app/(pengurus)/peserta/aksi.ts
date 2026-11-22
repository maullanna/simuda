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
import type { Prisma } from "@/generated/prisma/client";
import { boleh } from "@/lib/hak-akses";
import { requireRole, type PenggunaMasuk } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";
import { KOLOM_BIODATA, skemaBiodata } from "@/lib/skema/biodata";
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
  // Bagian biodata ikut dikirim (hanya tampil untuk Administrator): diperiksa bersamaan,
  // supaya kalau ada yang salah tidak ada yang tersimpan setengah.
  const adaBiodata = form.has("namaAyah");
  if (adaBiodata && !boleh(pengguna, "biodata", "ubah")) return { ok: false, galat: {}, pesan: "Kamu tidak berhak mengubah biodata." };
  const bio = adaBiodata ? bacaBiodata(form) : null;
  if (!hasil.success || (bio && !bio.success)) {
    return { ok: false, galat: { ...(bio && !bio.success ? galatDari(bio.error) : {}), ...(hasil.success ? {} : galatDari(hasil.error)) } };
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
  if (ganda) return { ok: false, galat: { nama: "Pemuda/i dengan nama dan tanggal lahir ini sudah terdaftar" } };

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
      if (bio?.success) await tulisBiodata(tx, p.id, bio.data, pengguna);
      return p;
    });
    revalidatePath("/peserta");
    return { ok: true, id: baru.id };
  }

  const lama = await prisma.peserta.findUnique({ where: { id } });
  if (!lama) return { ok: false, galat: {}, pesan: "Data pemuda/i tidak ditemukan." };

  await prisma.$transaction(async (tx) => {
    // Status tidak diubah dari sini: suspend/pulihkan lewat aksi tersendiri yang mewajibkan alasan (KONSEP 3.3).
    const p = await tx.peserta.update({ where: { id }, data });
    await tx.auditLog.create({
      data: { userId: pengguna.userId, tabel: "peserta", recordId: id, aksi: "ubah", dataLama: keTampilan(lama), dataBaru: keTampilan(p) },
    });
    if (bio?.success) await tulisBiodata(tx, id, bio.data, pengguna);
  });
  revalidatePath("/peserta");
  revalidatePath(`/peserta/${id}/ubah`);
  revalidatePath(`/peserta/${id}`);
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
  if (!peserta) return { ok: false, pesan: "Data pemuda/i tidak ditemukan." };
  if (peserta.status !== "aktif") return { ok: false, pesan: "Pemuda/i ini tidak aktif, kartunya tidak bisa diganti." };

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

// ---------------------------------------------------------------------------
// Biodata muda/i untuk Tim PnKB (KONSEP 5.1b). Data sensitif: hanya Administrator (dan pemiliknya sendiri).

type DataBiodata = z.infer<typeof skemaBiodata>;

function galatDari(e: z.ZodError): Record<string, string> {
  return Object.fromEntries(Object.entries(z.flattenError(e).fieldErrors).map(([k, v]) => [k, (v as string[] | undefined)?.[0] ?? ""]));
}

function bacaBiodata(form: FormData) {
  return skemaBiodata.safeParse(Object.fromEntries(KOLOM_BIODATA.map((k) => [k, String(form.get(k) ?? "")])));
}

// Simpan biodata di dalam transaksi. Riwayat hanya mencatat isian yang berubah, supaya mudah dibaca.
// Biodata yang belum pernah ada dan semuanya kosong tidak dibuat.
async function tulisBiodata(tx: Prisma.TransactionClient, pesertaId: string, data: DataBiodata, pengguna: PenggunaMasuk) {
  const lama = await tx.biodataPeserta.findUnique({ where: { pesertaId } });
  const berubah = KOLOM_BIODATA.filter((k) => (lama?.[k] ?? null) !== data[k]);
  if (berubah.length === 0) return;
  await tx.biodataPeserta.upsert({ where: { pesertaId }, create: { pesertaId, ...data }, update: data });
  await tx.auditLog.create({
    data: {
      userId: pengguna.userId,
      tabel: "biodata_peserta",
      recordId: pesertaId,
      aksi: lama ? "ubah" : "buat",
      dataLama: lama ? Object.fromEntries(berubah.map((k) => [k, lama[k]])) : undefined,
      dataBaru: Object.fromEntries(berubah.map((k) => [k, data[k]])),
    },
  });
}

export type HasilBiodata = { ok: true } | { ok: false; galat: Record<string, string>; pesan?: string };

export async function simpanBiodata(pesertaId: string, form: FormData): Promise<HasilBiodata> {
  const pengguna = await requireRole("biodata", "ubah");

  const hasil = bacaBiodata(form);
  if (!hasil.success) return { ok: false, galat: galatDari(hasil.error), pesan: "Periksa lagi isian yang ditandai." };
  if (!(await prisma.peserta.findUnique({ where: { id: pesertaId }, select: { id: true } }))) {
    return { ok: false, galat: {}, pesan: "Data pemuda/i tidak ditemukan." };
  }

  await prisma.$transaction((tx) => tulisBiodata(tx, pesertaId, hasil.data, pengguna));
  revalidatePath(`/peserta/${pesertaId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Suspend, pulihkan, dan hapus permanen peserta (KONSEP 3.3 dan 3.4).

export type HasilStatus = { ok: true } | { ok: false; pesan: string };

const skemaAlasan = z.string().trim().min(5, { error: "Tulis alasan minimal 5 karakter" }).max(300, { error: "Alasan terlalu panjang" });

// Suspend = peserta tidak aktif: tidak muncul di absensi, kartunya tidak berlaku. Riwayat tetap utuh.
export async function suspendPeserta(id: string, alasan: string): Promise<HasilStatus> {
  const pengguna = await requireRole("peserta", "suspend");
  const cek = skemaAlasan.safeParse(alasan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message };
  const p = await prisma.peserta.findUnique({ where: { id }, select: { status: true } });
  if (!p) return { ok: false, pesan: "Data pemuda/i tidak ditemukan." };
  if (p.status === "tidak_aktif") return { ok: false, pesan: "Pemuda/i ini sudah di-suspend." };

  await prisma.$transaction([
    prisma.peserta.update({ where: { id }, data: { status: "tidak_aktif" } }),
    prisma.kartu.updateMany({
      where: { pesertaId: id, aktif: true },
      data: { aktif: false, dinonaktifkanAt: new Date(), alasanNonaktif: "Peserta di-suspend" },
    }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "peserta", recordId: id, aksi: "suspend", dataLama: { status: "aktif" }, dataBaru: { status: "tidak_aktif" }, alasan: cek.data },
    }),
  ]);
  revalidatePath("/peserta");
  revalidatePath(`/peserta/${id}`);
  return { ok: true };
}

// Pulihkan: aktif lagi dan dibuatkan kartu baru (kartu lama tetap tidak berlaku).
export async function pulihkanPeserta(id: string, alasan: string): Promise<HasilStatus> {
  const pengguna = await requireRole("peserta", "suspend");
  const cek = skemaAlasan.safeParse(alasan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message };
  const p = await prisma.peserta.findUnique({ where: { id }, select: { status: true } });
  if (!p) return { ok: false, pesan: "Data pemuda/i tidak ditemukan." };
  if (p.status === "aktif") return { ok: false, pesan: "Pemuda/i ini sudah aktif." };

  await prisma.$transaction(async (tx) => {
    await tx.peserta.update({ where: { id }, data: { status: "aktif" } });
    if (!(await tx.kartu.findFirst({ where: { pesertaId: id, aktif: true } }))) {
      await tx.kartu.create({ data: { pesertaId: id, token: tokenAcak() } });
    }
    await tx.auditLog.create({
      data: { userId: pengguna.userId, tabel: "peserta", recordId: id, aksi: "pulihkan", dataLama: { status: "tidak_aktif" }, dataBaru: { status: "aktif" }, alasan: cek.data },
    });
  });
  revalidatePath("/peserta");
  revalidatePath(`/peserta/${id}`);
  return { ok: true };
}

// Hapus permanen: hanya Administrator, hanya peserta yang sudah di-suspend, wajib ketik ulang nama.
// Kartu, kehadiran, dan biodatanya ikut terhapus. Salinannya disimpan di audit_log; untuk permintaan
// penghapusan data pribadi (samarkan), salinan itu tanpa nama, no HP, tanggal lahir, dan biodata.
export async function hapusPeserta(id: string, ketikNama: string, alasan: string, samarkan: boolean): Promise<HasilStatus> {
  const pengguna = await requireRole("peserta", "hapus");
  const cek = skemaAlasan.safeParse(alasan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message };

  const p = await prisma.peserta.findUnique({ where: { id }, include: { biodata: true, _count: { select: { kehadiran: true, kartu: true } } } });
  if (!p) return { ok: false, pesan: "Data pemuda/i tidak ditemukan." };
  if (p.status !== "tidak_aktif") return { ok: false, pesan: "Suspend pemuda/i ini dulu sebelum menghapus permanen." };
  if (ketikNama.trim().toLowerCase() !== p.nama.toLowerCase()) return { ok: false, pesan: "Nama yang diketik tidak sama." };

  const { biodata, _count, ...dataPeserta } = p;
  const salinan = samarkan
    ? { wilayah: p.wilayah, jenisKelamin: p.jenisKelamin, jumlahKehadiran: _count.kehadiran, disamarkan: true }
    : { ...keTampilan(dataPeserta), biodata, jumlahKehadiran: _count.kehadiran, jumlahKartu: _count.kartu };

  await prisma.$transaction([
    prisma.kehadiran.deleteMany({ where: { pesertaId: id } }),
    prisma.kartu.deleteMany({ where: { pesertaId: id } }),
    prisma.biodataPeserta.deleteMany({ where: { pesertaId: id } }),
    // Masukan tetap disimpan, tapi tidak lagi terhubung ke nama peserta (jadi tanpa nama).
    prisma.masukan.updateMany({ where: { pesertaId: id }, data: { pesertaId: null } }),
    // Kalau pernah jadi petugas scan: lepaskan dan matikan aksesnya.
    prisma.pengurus.updateMany({ where: { pesertaId: id }, data: { pesertaId: null, aktif: false } }),
    prisma.peserta.delete({ where: { id } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "peserta", recordId: id, aksi: "hapus", dataLama: salinan, alasan: cek.data },
    }),
  ]);
  revalidatePath("/peserta");
  return { ok: true };
}
