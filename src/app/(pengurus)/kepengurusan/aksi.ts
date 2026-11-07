"use server";

// Server Action halaman Kepengurusan: data pengurus, akun login, dan petugas scan.
// Urutan wajib: requireRole() -> validasi Zod -> database (+ audit_log).
//
// Aturan tambahan supaya sistem tidak bisa disalahgunakan atau terkunci:
// - Data & akun Administrator hanya boleh diubah oleh Administrator.
// - Tidak ada yang bisa mencabut akses dirinya sendiri.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { keWilayahPengurusDb } from "@/lib/data/pengurus";
import { prisma } from "@/lib/db";
import { requireRole, type PenggunaMasuk } from "@/lib/pengguna";
import { KOLOM_DATA_KELOMPOK, skemaDataKelompok } from "@/lib/skema/biodata";
import { skemaAkunBaru, skemaKataSandi, skemaPengurus } from "@/lib/skema/pengurus";

export type HasilAksi = { ok: true; pesan?: string } | { ok: false; pesan: string; galat?: Record<string, string> };

function galatZod(e: z.ZodError): Record<string, string> {
  return Object.fromEntries(Object.entries(z.flattenError(e).fieldErrors).map(([k, v]) => [k, (v as string[] | undefined)?.[0] ?? ""]));
}

// Ambil pengurus target dan pastikan pengguna boleh mengubahnya.
async function ambilTarget(id: string, pengguna: PenggunaMasuk) {
  const target = await prisma.pengurus.findUnique({ where: { id }, include: { user: { select: { email: true } }, level: true } });
  if (!target) return { target: null, galat: "Pengurus tidak ditemukan." };
  if (target.level.aksesPenuh && !pengguna.aksesPenuh) {
    return { target: null, galat: "Data Administrator hanya bisa diubah oleh Administrator." };
  }
  return { target, galat: null };
}

function segarkan() {
  revalidatePath("/kepengurusan");
}

// ---------------------------------------------------------------------------
// Data pengurus

export async function simpanPengurus(id: string | null, form: FormData): Promise<HasilAksi> {
  const pengguna = await requireRole("pengurus", id ? "ubah" : "tambah");
  const cek = skemaPengurus.safeParse({
    nama: form.get("nama") ?? "",
    jabatan: form.get("jabatan") ?? "",
    wilayah: form.get("wilayah") ?? "",
    levelId: form.get("levelId") ?? "",
  });
  if (!cek.success) return { ok: false, pesan: "Periksa lagi isiannya.", galat: galatZod(cek.error) };
  const data = { ...cek.data, wilayah: keWilayahPengurusDb(cek.data.wilayah) };

  // Level harus ada. Level Administrator hanya boleh diberikan oleh Administrator (KONSEP 3.1).
  const level = await prisma.levelPengguna.findUnique({ where: { id: data.levelId } });
  if (!level) return { ok: false, pesan: "Periksa lagi isiannya.", galat: { levelId: "Level tidak ditemukan" } };
  if (level.aksesPenuh && !pengguna.aksesPenuh) {
    return { ok: false, pesan: "Hanya Administrator yang bisa memberi level Administrator.", galat: { levelId: "Tidak boleh memilih level ini" } };
  }

  if (!id) {
    const baru = await prisma.$transaction(async (tx) => {
      const p = await tx.pengurus.create({ data });
      await tx.auditLog.create({ data: { userId: pengguna.userId, tabel: "pengurus", recordId: p.id, aksi: "buat", dataBaru: data } });
      return p;
    });
    segarkan();
    return { ok: true, pesan: `${baru.nama} ditambahkan.` };
  }

  const t = await ambilTarget(id, pengguna);
  if (!t.target) return { ok: false, pesan: t.galat };
  if (t.target.pesertaId) return { ok: false, pesan: "Petugas scan diatur dari bagian Petugas scan." };
  if (t.target.id === pengguna.pengurusId && data.levelId !== t.target.levelId) {
    return { ok: false, pesan: "Kamu tidak bisa mengubah levelmu sendiri.", galat: { levelId: "Tidak bisa mengubah level sendiri" } };
  }
  await prisma.$transaction(async (tx) => {
    await tx.pengurus.update({ where: { id }, data });
    await tx.auditLog.create({
      data: {
        userId: pengguna.userId,
        tabel: "pengurus",
        recordId: id,
        aksi: "ubah",
        dataLama: { nama: t.target.nama, jabatan: t.target.jabatan, wilayah: t.target.wilayah, levelId: t.target.levelId },
        dataBaru: data,
      },
    });
  });
  segarkan();
  return { ok: true, pesan: "Perubahan tersimpan." };
}

// ---------------------------------------------------------------------------
// Akun login

export async function buatAkun(pengurusId: string, email: string, kataSandi: string): Promise<HasilAksi> {
  const pengguna = await requireRole("akunLogin", "jalankan");
  const cek = skemaAkunBaru.safeParse({ email, kataSandi });
  if (!cek.success) return { ok: false, pesan: "Periksa lagi isiannya.", galat: galatZod(cek.error) };

  const t = await ambilTarget(pengurusId, pengguna);
  if (!t.target) return { ok: false, pesan: t.galat };
  if (t.target.userId) return { ok: false, pesan: `${t.target.nama} sudah punya akun.` };
  if (await prisma.user.findUnique({ where: { email: cek.data.email }, select: { id: true } })) {
    return { ok: false, pesan: "Email ini sudah dipakai akun lain.", galat: { email: "Email sudah dipakai" } };
  }

  // Cara yang sama dengan pendaftaran Better Auth: hash kata sandi, buat user, simpan akun "credential".
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(cek.data.kataSandi);
  const user = await ctx.internalAdapter.createUser({ email: cek.data.email, name: t.target.nama }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hash });

  await prisma.$transaction([
    prisma.pengurus.update({ where: { id: pengurusId }, data: { userId: user.id } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "user", recordId: user.id, aksi: "buat", dataBaru: { email: cek.data.email, pengurusId } },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: `Akun ${cek.data.email} dibuat.` };
}

export async function resetKataSandi(pengurusId: string, kataSandi: string): Promise<HasilAksi> {
  const pengguna = await requireRole("akunLogin", "jalankan");
  const cek = skemaKataSandi.safeParse(kataSandi);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message, galat: { kataSandi: cek.error.issues[0].message } };

  const t = await ambilTarget(pengurusId, pengguna);
  if (!t.target) return { ok: false, pesan: t.galat };
  if (!t.target.userId) return { ok: false, pesan: "Pengurus ini belum punya akun." };

  const ctx = await auth.$context;
  await ctx.internalAdapter.updatePassword(t.target.userId, await ctx.password.hash(cek.data));
  // Semua sesi lama dikeluarkan: siapa pun yang masih login dengan kata sandi lama harus masuk ulang.
  await ctx.internalAdapter.deleteUserSessions(t.target.userId);
  await prisma.auditLog.create({
    data: { userId: pengguna.userId, tabel: "user", recordId: t.target.userId, aksi: "ubah", alasan: "Reset kata sandi oleh pengurus" },
  });
  return { ok: true, pesan: "Kata sandi diganti. Sampaikan kata sandi baru secara pribadi." };
}

export async function aturAkses(pengurusId: string, aktif: boolean): Promise<HasilAksi> {
  const pengguna = await requireRole("akunLogin", "jalankan");
  const t = await ambilTarget(pengurusId, pengguna);
  if (!t.target) return { ok: false, pesan: t.galat };
  if (t.target.id === pengguna.pengurusId) return { ok: false, pesan: "Kamu tidak bisa mencabut aksesmu sendiri." };

  await prisma.$transaction([
    prisma.pengurus.update({ where: { id: pengurusId }, data: { aktif } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "pengurus", recordId: pengurusId, aksi: "ubah", dataLama: { aktif: t.target.aktif }, dataBaru: { aktif } },
    }),
  ]);
  // Dicabut: langsung keluarkan dari semua perangkat.
  if (!aktif && t.target.userId) await (await auth.$context).internalAdapter.deleteUserSessions(t.target.userId);
  segarkan();
  return { ok: true, pesan: aktif ? "Akses dipulihkan." : "Akses dicabut dan semua sesi dikeluarkan." };
}

// ---------------------------------------------------------------------------
// Petugas scan: peserta yang diberi level "Petugas scan" (digilir, bisa dicabut kapan saja).

export async function tambahPetugasScan(pesertaIds: string[]): Promise<HasilAksi> {
  const pengguna = await requireRole("petugasScan", "jalankan");
  const cek = z.array(z.string().min(1)).min(1).max(50).safeParse(pesertaIds);
  if (!cek.success) return { ok: false, pesan: "Pilih minimal satu peserta." };

  const level = await prisma.levelPengguna.findUnique({ where: { kode: "petugas_scan" } });
  if (!level) return { ok: false, pesan: "Level Petugas scan tidak ditemukan. Hubungi Administrator." };
  const peserta = await prisma.peserta.findMany({ where: { id: { in: cek.data }, status: "aktif" } });
  for (const p of peserta) {
    // Pernah jadi petugas: cukup aktifkan lagi (riwayat & akunnya tetap). Belum pernah: buat baru.
    await prisma.pengurus.upsert({
      where: { pesertaId: p.id },
      update: { aktif: true },
      create: {
        pesertaId: p.id,
        nama: p.nama,
        jabatan: "Petugas scan",
        wilayah: p.wilayah === "bendlay_4" ? "bendlay_4" : "bendlay_2",
        levelId: level.id,
      },
    });
  }
  await prisma.auditLog.create({
    data: { userId: pengguna.userId, tabel: "pengurus", recordId: "petugas_scan", aksi: "buat", dataBaru: { pesertaIds: peserta.map((p) => p.id) } },
  });
  segarkan();
  return { ok: true, pesan: `${peserta.length} petugas scan ditambahkan.` };
}

export async function cabutPetugasScan(pengurusId: string): Promise<HasilAksi> {
  const pengguna = await requireRole("petugasScan", "jalankan");
  const t = await ambilTarget(pengurusId, pengguna);
  if (!t.target) return { ok: false, pesan: t.galat };
  if (!t.target.pesertaId) return { ok: false, pesan: "Ini bukan petugas scan." };
  return aturAkses(pengurusId, false);
}

// ---------------------------------------------------------------------------
// Data kelompok (KONSEP 5.1b): desa, daerah, Kipok, Tim PnKB. Diisi sekali per kelompok.

export async function simpanDataKelompok(wilayah: string, form: FormData): Promise<HasilAksi> {
  const pengguna = await requireRole("dataKelompok", "ubah");
  const w = z.enum(["bendlay_2", "bendlay_4"]).safeParse(wilayah);
  if (!w.success) return { ok: false, pesan: "Kelompok tidak dikenal." };
  const cek = skemaDataKelompok.safeParse(Object.fromEntries(KOLOM_DATA_KELOMPOK.map((k) => [k, String(form.get(k) ?? "")])));
  if (!cek.success) return { ok: false, pesan: "Periksa lagi isiannya.", galat: galatZod(cek.error) };

  const lama = await prisma.dataKelompok.findUnique({ where: { wilayah: w.data } });
  await prisma.$transaction([
    prisma.dataKelompok.upsert({ where: { wilayah: w.data }, create: { wilayah: w.data, ...cek.data }, update: cek.data }),
    prisma.auditLog.create({
      data: {
        userId: pengguna.userId,
        tabel: "data_kelompok",
        recordId: w.data,
        aksi: lama ? "ubah" : "buat",
        dataLama: lama ? Object.fromEntries(KOLOM_DATA_KELOMPOK.map((k) => [k, lama[k]])) : undefined,
        dataBaru: cek.data,
      },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: "Data kelompok tersimpan." };
}
