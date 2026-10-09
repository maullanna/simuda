// Tipe data sesi pengajian dan kehadiran, beserta fungsi bantunya.

import { kategoriPeserta, type JenisKelamin, type Peserta } from "./peserta";

export type Sasaran = "remaja" | "pra-nikah" | "gabungan";
export type StatusSesi = "terjadwal" | "berlangsung" | "selesai" | "batal";
export type StatusKehadiran = "hadir" | "izin" | "alpa";
export type MetodeKehadiran = "qr" | "manual" | "izin";

export type Sesi = {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jenisKelamin: JenisKelamin;
  sasaran: Sasaran;
  pemateri: string; // kosong = belum diisi
  materi: string; // kosong = belum diisi
  status: StatusSesi;
  catatan?: string; // diisi setelah pengajian
  lampiran?: Lampiran[];
};

// File pendukung catatan pengajian. Filenya nanti disimpan di storage,
// database hanya menyimpan alamatnya (KONSEP bagian 7, tabel lampiran).
export type Lampiran = {
  nama: string;
  tipe: "foto" | "pdf";
};

// Jadwal rutin 3 kali seminggu. Harinya masih contoh (pertanyaan terbuka di KONSEP bagian 14).
// hari: 0 = Minggu, 1 = Senin, ... 6 = Sabtu
export const jadwalRutin = [
  { hari: 2, nama: "Selasa", jam: "19:30" },
  { hari: 4, nama: "Kamis", jam: "19:30" },
  { hari: 6, nama: "Sabtu", jam: "19:30" },
];

export type Kehadiran = {
  sesiId: string;
  pesertaId: string;
  status: StatusKehadiran;
  metode: MetodeKehadiran;
  keterangan?: string;
  dicatatOleh: string;
  waktu: string; // HH:MM
};

export const labelSasaran: Record<Sasaran, string> = {
  remaja: "Remaja",
  "pra-nikah": "Pra-nikah",
  gabungan: "Gabungan",
};

// Peserta yang menjadi sasaran sesi: aktif, jenis kelaminnya sama,
// dan kategorinya cocok (kecuali sesi gabungan).
export function pesertaSasaran(sesi: Sesi, semuaPeserta: Peserta[]): Peserta[] {
  return semuaPeserta.filter((p) => p.status === "aktif" && p.jenisKelamin === sesi.jenisKelamin && (sesi.sasaran === "gabungan" || kategoriPeserta(p.tanggalLahir) === sesi.sasaran));
}

export function ringkasKehadiran(sesi: Sesi, semuaPeserta: Peserta[], semuaKehadiran: Kehadiran[]) {
  const sasaran = pesertaSasaran(sesi, semuaPeserta);
  const catatan = semuaKehadiran.filter((k) => k.sesiId === sesi.id);
  const hadir = catatan.filter((k) => k.status === "hadir").length;
  const izin = catatan.filter((k) => k.status === "izin").length;
  const alpa = catatan.filter((k) => k.status === "alpa").length;
  return { sasaran: sasaran.length, hadir, izin, alpa, belum: Math.max(sasaran.length - hadir - izin - alpa, 0) };
}

// Tanggal disimpan sebagai teks YYYY-MM-DD. Jam 12 siang WIB dipakai supaya
// pergeseran zona waktu tidak membuat tanggalnya mundur sehari.
function keDate(tanggal: string): Date {
  return new Date(`${tanggal}T12:00:00+07:00`);
}

const formatLengkap: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

export function formatTanggal(tanggal: string, opsi: Intl.DateTimeFormatOptions = formatLengkap): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...opsi }).format(keDate(tanggal));
}

export function geserTanggal(tanggal: string, jumlahHari: number): string {
  const d = keDate(tanggal);
  d.setUTCDate(d.getUTCDate() + jumlahHari);
  return d.toISOString().slice(0, 10);
}

// 0 = Minggu, 1 = Senin, ... 6 = Sabtu
export function hariDalamPekan(tanggal: string): number {
  return keDate(tanggal).getUTCDay();
}

// Daftar "perlu dihubungi" (KONSEP 5.6): peserta aktif yang tidak hadir
// di 2 pengajian terakhir yang menjadi sasarannya (alpa atau izin berturut-turut).
// Hanya untuk pengurus, tidak pernah ditampilkan ke peserta.
export function perluDihubungi(semuaSesi: Sesi[], semuaPeserta: Peserta[], semuaKehadiran: Kehadiran[]): Peserta[] {
  const sesiSelesai = semuaSesi
    .filter((s) => s.status === "selesai")
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return semuaPeserta.filter((p) => {
    if (p.status !== "aktif") return false;
    const duaTerakhir = sesiSelesai.filter((s) => pesertaSasaran(s, [p]).length > 0).slice(0, 2);
    if (duaTerakhir.length < 2) return false;
    return duaTerakhir.every((s) => {
      const k = semuaKehadiran.find((x) => x.sesiId === s.id && x.pesertaId === p.id);
      return k?.status !== "hadir";
    });
  });
}

// Senin dari pekan tanggal tersebut, dalam format YYYY-MM-DD.
export function seninPekanIni(tanggal: string): string {
  const hari = hariDalamPekan(tanggal);
  return geserTanggal(tanggal, hari === 0 ? -6 : 1 - hari);
}

// ---------------------------------------------------------------------------
// Pemeriksaan isian form sesi dan catatan.
// Sama seperti form peserta: ini hanya untuk membantu di browser. Saat database
// tersambung, aturan yang sama WAJIB diperiksa ulang di server dengan Zod.

export type IsianSesi = {
  tanggal: string;
  jenisKelamin: string;
  jamMulai: string;
  sasaran: string;
  materi: string;
  pemateri: string;
};

export type GalatSesi = Partial<Record<keyof IsianSesi, string>>;

// `baru`: true saat menambah sesi (tanggal & putra/putri wajib dipilih,
// materi boleh diisi nanti). false saat mengisi/mengubah materi sesi yang ada.
export function periksaIsianSesi(isian: IsianSesi, hariIni: string, baru: boolean): GalatSesi {
  const galat: GalatSesi = {};

  if (baru) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isian.tanggal)) galat.tanggal = "Pilih tanggal";
    else if (isian.tanggal < hariIni) galat.tanggal = "Tanggal tidak boleh sebelum hari ini";

    if (isian.jenisKelamin !== "putra" && isian.jenisKelamin !== "putri") {
      galat.jenisKelamin = "Pilih putra atau putri";
    }
  }

  if (!/^\d{2}:\d{2}$/.test(isian.jamMulai)) galat.jamMulai = "Isi jam mulai";

  if (!["remaja", "pra-nikah", "gabungan"].includes(isian.sasaran)) galat.sasaran = "Pilih sasaran";

  const materi = isian.materi.trim();
  if (!baru && materi === "") galat.materi = "Isi judul materi";
  else if (materi.length > 150) galat.materi = "Judul materi terlalu panjang (maks. 150 huruf)";

  const pemateri = isian.pemateri.trim();
  if (!baru && pemateri === "") galat.pemateri = "Isi nama pemateri";
  else if (pemateri.length > 80) galat.pemateri = "Nama pemateri terlalu panjang";

  return galat;
}

export const BATAS_LAMPIRAN = {
  jumlah: 5,
  ukuranByte: 5 * 1024 * 1024, // 5 MB per file
};

export const PANJANG_CATATAN = { min: 10, maks: 2000 };

// Mengembalikan pesan kesalahan, atau null kalau file boleh dilampirkan.
export function periksaFileLampiran(file: { name: string; type: string; size: number }): string | null {
  const jenisBoleh = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!jenisBoleh) return `${file.name}: hanya foto atau PDF`;
  if (file.size > BATAS_LAMPIRAN.ukuranByte) return `${file.name}: lebih dari 5 MB`;
  return null;
}

// ---------------------------------------------------------------------------
// Data untuk dialog absensi (input manual, catat izin, tutup sesi).

// Satu peserta beserta statusnya di satu sesi. "belum" = belum dicatat apa pun.
export type PesertaSesi = {
  id: string;
  nama: string;
  wilayah: string;
  status: StatusKehadiran | "belum";
  diLuarSasaran: boolean; // misalnya peserta pra-nikah yang ikut sesi khusus remaja
};

// Semua peserta aktif dengan jenis kelamin yang sama dengan sesi, urut nama.
export function daftarPesertaSesi(sesi: Sesi, semuaPeserta: Peserta[], semuaKehadiran: Kehadiran[]): PesertaSesi[] {
  const idSasaran = new Set(pesertaSasaran(sesi, semuaPeserta).map((p) => p.id));
  return semuaPeserta
    .filter((p) => p.status === "aktif" && p.jenisKelamin === sesi.jenisKelamin)
    .map((p) => ({
      id: p.id,
      nama: p.nama,
      wilayah: p.wilayah,
      status: semuaKehadiran.find((k) => k.sesiId === sesi.id && k.pesertaId === p.id)?.status ?? ("belum" as const),
      diLuarSasaran: !idSasaran.has(p.id),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

export type IsianIzin = { sesiId: string; pesertaId: string; alasan: string; keterangan: string };
export type GalatIzin = Partial<Record<keyof IsianIzin, string>>;

export function periksaIsianIzin(isian: IsianIzin): GalatIzin {
  const galat: GalatIzin = {};
  if (!isian.sesiId) galat.sesiId = "Pilih sesi pengajian";
  if (!isian.pesertaId) galat.pesertaId = "Pilih peserta yang izin";
  if (!isian.alasan) galat.alasan = "Pilih keterangan";
  else if (isian.alasan === "Lainnya" && isian.keterangan.trim().length < 3) {
    galat.keterangan = "Tulis keterangan singkat";
  } else if (isian.keterangan.length > 200) {
    galat.keterangan = "Keterangan terlalu panjang";
  }
  return galat;
}
