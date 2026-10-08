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
  pemateri: string;
  materi: string;
  status: StatusSesi;
};

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
