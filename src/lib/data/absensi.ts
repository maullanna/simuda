// Lapisan data sesi pengajian dan kehadiran: membaca database lalu menerjemahkan ke bentuk
// yang dipakai tampilan (tipe Sesi dan Kehadiran di lib/sesi.ts), sama persis dengan data contoh dulu.
// Hanya untuk server. Hak akses tetap diperiksa di halaman/aksi lewat requireRole().
import "server-only";
import type { Sasaran as SasaranDb } from "@/generated/prisma/enums";
import { keTeksTanggal } from "@/lib/data/peserta";
import { prisma } from "@/lib/db";
import type { Kehadiran, Sasaran, Sesi } from "@/lib/sesi";

const labelSasaran: Record<SasaranDb, Sasaran> = {
  pra_remaja: "pra-remaja",
  remaja: "remaja",
  pra_nikah: "pra-nikah",
  gabungan: "gabungan",
};

export function keSasaranDb(s: Sasaran): SasaranDb {
  return s === "pra-nikah" ? "pra_nikah" : s === "pra-remaja" ? "pra_remaja" : s;
}

// Jam pencatatan ditampilkan dalam WIB, "HH:MM".
const formatJam = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false });
const keJam = (d: Date) => formatJam.format(d).replace(".", ":");

// Semua sesi beserta kehadirannya. Data yang di-suspend (KONSEP 3.3) tidak ikut.
// Jumlah datanya masih kecil (± 7.500 kehadiran per tahun), jadi dibaca sekaligus.
// Kalau nanti terasa lambat, tambahkan batas rentang tanggal di sini.
export async function ambilDataAbsensi(): Promise<{ sesi: Sesi[]; kehadiran: Kehadiran[] }> {
  const [semuaSesi, semuaKehadiran, pencatat] = await Promise.all([
    prisma.sesiPengajian.findMany({
      orderBy: [{ tanggal: "desc" }, { jamMulai: "asc" }, { jenisKelamin: "asc" }],
      include: {
        pemateri: { select: { nama: true } },
        lampiran: { where: { disuspendAt: null }, orderBy: { dibuatAt: "asc" }, select: { namaFile: true, tipe: true } },
      },
    }),
    prisma.kehadiran.findMany({ where: { disuspendAt: null } }),
    // dicatat_oleh berisi id user: diterjemahkan ke nama pengurus supaya bisa dibaca.
    prisma.pengurus.findMany({ where: { userId: { not: null } }, select: { userId: true, nama: true } }),
  ]);
  const namaPencatat = new Map(pencatat.map((p) => [p.userId, p.nama]));

  const sesi: Sesi[] = semuaSesi.map((s) => ({
    id: s.id,
    tanggal: keTeksTanggal(s.tanggal),
    jamMulai: s.jamMulai,
    jenisKelamin: s.jenisKelamin,
    sasaran: labelSasaran[s.sasaran],
    pemateri: s.pemateri?.nama ?? "",
    materi: s.materi ?? "",
    status: s.status,
    ...(s.catatan ? { catatan: s.catatan } : {}),
    lampiran: s.lampiran.map((l) => ({ nama: l.namaFile, tipe: l.tipe })),
  }));

  const kehadiran: Kehadiran[] = semuaKehadiran.map((k) => ({
    sesiId: k.sesiId,
    pesertaId: k.pesertaId,
    status: k.status,
    metode: k.metode,
    ...(k.keterangan ? { keterangan: k.keterangan } : {}),
    dicatatOleh: namaPencatat.get(k.dicatatOleh) ?? (k.dicatatOleh === "seed" ? "Data contoh" : "Pengurus"),
    waktu: keJam(k.waktu),
  }));

  return { sesi, kehadiran };
}
