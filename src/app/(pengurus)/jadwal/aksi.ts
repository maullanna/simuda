"use server";

// Server Action halaman Jadwal: sesi pengajian, jadwal rutin, batal/pulihkan, dan catatan.
// Urutan wajib: requireRole() -> validasi Zod -> database (+ audit_log).

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { keSasaranDb } from "@/lib/data/absensi";
import { keTanggalDb, keTeksTanggal } from "@/lib/data/peserta";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";
import { skemaAlasan, skemaCatatan, skemaSesi } from "@/lib/skema/sesi";
import { geserTanggal, hariDalamPekan, jadwalRutin } from "@/lib/sesi";

export type HasilJadwal = { ok: true; pesan?: string } | { ok: false; pesan: string; galat?: Record<string, string> };

function galatDari(e: z.ZodError): Record<string, string> {
  return Object.fromEntries(Object.entries(z.flattenError(e).fieldErrors).map(([k, v]) => [k, (v as string[] | undefined)?.[0] ?? ""]));
}

function segarkan() {
  revalidatePath("/jadwal");
  revalidatePath("/absensi");
  revalidatePath("/dashboard");
}

// Pemateri dicari berdasarkan nama (huruf besar/kecil tidak dibedakan); kalau belum ada, dibuat.
async function idPemateri(tx: Prisma.TransactionClient, nama: string): Promise<string | null> {
  if (!nama) return null;
  const ada = await tx.pemateri.findFirst({ where: { nama: { equals: nama, mode: "insensitive" }, disuspendAt: null }, select: { id: true } });
  if (ada) return ada.id;
  return (await tx.pemateri.create({ data: { nama } })).id;
}

// id kosong = tambah sesi baru; id terisi = isi/ubah materi sesi itu.
export async function simpanSesi(id: string | null, form: FormData): Promise<HasilJadwal> {
  const pengguna = await requireRole("sesi", id ? "ubah" : "tambah");
  const baru = !id;
  const teks = (k: string) => String(form.get(k) ?? "");
  const cek = skemaSesi(tanggalHariIniWib(), baru).safeParse({
    tanggal: teks("tanggal"),
    jenisKelamin: teks("jenisKelamin"),
    jamMulai: teks("jamMulai"),
    sasaran: teks("sasaran"),
    materi: teks("materi"),
    pemateri: teks("pemateri"),
  });
  if (!cek.success) return { ok: false, pesan: "Periksa lagi isiannya.", galat: galatDari(cek.error) };
  const d = cek.data;

  if (baru) {
    const tanggal = keTanggalDb(d.tanggal!);
    const jenisKelamin = d.jenisKelamin as "putra" | "putri";
    // Sesi ganda: tanggal, putra/putri, dan jam yang sama (yang dibatalkan tidak dihitung).
    const ganda = await prisma.sesiPengajian.findFirst({
      where: { tanggal, jenisKelamin, jamMulai: d.jamMulai, status: { not: "batal" } },
      select: { id: true },
    });
    if (ganda) return { ok: false, pesan: "Sudah ada sesi di tanggal, kelompok, dan jam yang sama.", galat: { tanggal: "Sesi ini sudah ada" } };

    await prisma.$transaction(async (tx) => {
      const s = await tx.sesiPengajian.create({
        data: { tanggal, jenisKelamin, jamMulai: d.jamMulai, sasaran: keSasaranDb(d.sasaran), materi: d.materi || null, pemateriId: await idPemateri(tx, d.pemateri) },
      });
      await tx.auditLog.create({ data: { userId: pengguna.userId, tabel: "sesi_pengajian", recordId: s.id, aksi: "buat", dataBaru: d } });
    });
    segarkan();
    return { ok: true, pesan: "Sesi ditambahkan." };
  }

  const lama = await prisma.sesiPengajian.findUnique({ where: { id: id! }, include: { pemateri: { select: { nama: true } } } });
  if (!lama) return { ok: false, pesan: "Sesi tidak ditemukan." };
  if (lama.status === "batal") return { ok: false, pesan: "Sesi ini dibatalkan. Pulihkan dulu sebelum mengubah." };

  await prisma.$transaction(async (tx) => {
    await tx.sesiPengajian.update({
      where: { id: id! },
      data: { jamMulai: d.jamMulai, sasaran: keSasaranDb(d.sasaran), materi: d.materi, pemateriId: await idPemateri(tx, d.pemateri) },
    });
    await tx.auditLog.create({
      data: {
        userId: pengguna.userId,
        tabel: "sesi_pengajian",
        recordId: id!,
        aksi: "ubah",
        dataLama: { jamMulai: lama.jamMulai, sasaran: lama.sasaran, materi: lama.materi, pemateri: lama.pemateri?.nama ?? null },
        dataBaru: { jamMulai: d.jamMulai, sasaran: d.sasaran, materi: d.materi, pemateri: d.pemateri },
      },
    });
  });
  segarkan();
  return { ok: true, pesan: "Materi tersimpan." };
}

// Jadwal rutin 2 pekan ke depan (termasuk hari ini): sesi putra dan putri di setiap hari rutin.
// Sesi yang sudah ada di tanggal & kelompok itu (termasuk yang dibatalkan) dilewati, jadi aman diklik berkali-kali.
export async function buatJadwalRutin(): Promise<HasilJadwal> {
  const pengguna = await requireRole("sesi", "tambah");
  const hariIni = tanggalHariIniWib();
  const rencana = Array.from({ length: 14 }, (_, i) => geserTanggal(hariIni, i)).flatMap((tanggal) => {
    const rutin = jadwalRutin.find((j) => j.hari === hariDalamPekan(tanggal));
    return rutin ? (["putra", "putri"] as const).map((jenisKelamin) => ({ tanggal, jenisKelamin, jamMulai: rutin.jam })) : [];
  });

  const ada = await prisma.sesiPengajian.findMany({
    where: { tanggal: { in: [...new Set(rencana.map((r) => keTanggalDb(r.tanggal)))] } },
    select: { tanggal: true, jenisKelamin: true },
  });
  const kunciAda = new Set(ada.map((s) => `${keTeksTanggal(s.tanggal)}|${s.jenisKelamin}`));
  const dibuat = rencana.filter((r) => !kunciAda.has(`${r.tanggal}|${r.jenisKelamin}`));
  if (dibuat.length === 0) return { ok: true, pesan: "Jadwal rutin 2 pekan ke depan sudah lengkap." };

  await prisma.$transaction([
    prisma.sesiPengajian.createMany({
      data: dibuat.map((r) => ({ tanggal: keTanggalDb(r.tanggal), jenisKelamin: r.jenisKelamin, jamMulai: r.jamMulai, sasaran: "gabungan" as const })),
    }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "sesi_pengajian", recordId: "jadwal_rutin", aksi: "buat", dataBaru: { jumlah: dibuat.length, tanggal: [...new Set(dibuat.map((r) => r.tanggal))] } },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: `${dibuat.length} sesi rutin dibuat.` };
}

// Batalkan sesi (bentuk suspend untuk sesi, KONSEP 3.3): tidak muncul di absensi dan tidak dihitung di rekap.
export async function batalkanSesi(id: string, alasan: string): Promise<HasilJadwal> {
  const pengguna = await requireRole("sesi", "suspend");
  const cek = skemaAlasan.safeParse(alasan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message };
  const s = await prisma.sesiPengajian.findUnique({ where: { id }, select: { status: true, _count: { select: { kehadiran: true } } } });
  if (!s) return { ok: false, pesan: "Sesi tidak ditemukan." };
  if (s.status !== "terjadwal") return { ok: false, pesan: "Hanya sesi yang belum dimulai yang bisa dibatalkan." };

  await prisma.$transaction([
    prisma.sesiPengajian.update({ where: { id }, data: { status: "batal" } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "sesi_pengajian", recordId: id, aksi: "suspend", dataLama: { status: "terjadwal" }, dataBaru: { status: "batal" }, alasan: cek.data },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: "Sesi dibatalkan." };
}

export async function pulihkanSesi(id: string, alasan: string): Promise<HasilJadwal> {
  const pengguna = await requireRole("sesi", "suspend");
  const cek = skemaAlasan.safeParse(alasan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message };
  const s = await prisma.sesiPengajian.findUnique({ where: { id }, select: { status: true } });
  if (!s) return { ok: false, pesan: "Sesi tidak ditemukan." };
  if (s.status !== "batal") return { ok: false, pesan: "Sesi ini tidak sedang dibatalkan." };

  await prisma.$transaction([
    prisma.sesiPengajian.update({ where: { id }, data: { status: "terjadwal" } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "sesi_pengajian", recordId: id, aksi: "pulihkan", dataLama: { status: "batal" }, dataBaru: { status: "terjadwal" }, alasan: cek.data },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: "Sesi dipulihkan." };
}

// Catatan pengajian (diisi setelah pengajian). Lampiran menyusul setelah penyimpanan file tersedia.
export async function simpanCatatan(id: string, catatan: string): Promise<HasilJadwal> {
  const pengguna = await requireRole("materi", "ubah");
  const cek = skemaCatatan.safeParse(catatan);
  if (!cek.success) return { ok: false, pesan: cek.error.issues[0].message, galat: { catatan: cek.error.issues[0].message } };
  const lama = await prisma.sesiPengajian.findUnique({ where: { id }, select: { status: true, catatan: true } });
  if (!lama) return { ok: false, pesan: "Sesi tidak ditemukan." };
  if (lama.status === "batal") return { ok: false, pesan: "Sesi ini dibatalkan." };

  await prisma.$transaction([
    prisma.sesiPengajian.update({ where: { id }, data: { catatan: cek.data } }),
    prisma.auditLog.create({
      data: { userId: pengguna.userId, tabel: "sesi_pengajian", recordId: id, aksi: lama.catatan ? "ubah" : "buat", dataLama: { catatan: lama.catatan }, dataBaru: { catatan: cek.data } },
    }),
  ]);
  segarkan();
  return { ok: true, pesan: "Catatan tersimpan." };
}
