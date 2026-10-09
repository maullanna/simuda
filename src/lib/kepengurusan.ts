// Peran pengguna dan hak aksesnya (KONSEP bagian 3).
// Tabel ini nanti juga dipakai requireRole() di server untuk menolak akses yang tidak berhak.

export type Peran = "kyai" | "wakil" | "ketua" | "sekretaris" | "bendahara" | "pengurus" | "petugas_scan";

export const labelPeran: Record<Peran, string> = {
  kyai: "Kyai",
  wakil: "Wakil",
  ketua: "Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  pengurus: "Pengurus",
  petugas_scan: "Petugas scan",
};

export const PERAN_PENGURUS: Peran[] = ["kyai", "wakil", "ketua", "sekretaris", "bendahara", "pengurus"];

export type Pengurus = { id: string; nama: string; jabatan: string; wilayah: string; peran: Peran };

// "–" = tidak ada akses. Kolom urut sesuai PERAN_TABEL.
export const PERAN_TABEL: Peran[] = ["kyai", "wakil", "ketua", "sekretaris", "bendahara", "pengurus", "petugas_scan"];

export const hakAkses: { fitur: string; akses: string[] }[] = [
  { fitur: "Beranda pengurus", akses: ["Lihat", "Lihat", "Lihat", "Lihat", "Lihat", "Lihat", "–"] },
  { fitur: "Data peserta", akses: ["Lihat", "Kelola", "Kelola", "Kelola", "Lihat", "Lihat", "–"] },
  { fitur: "Scan kehadiran", akses: ["–", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya"] },
  { fitur: "Catat izin", akses: ["–", "Ya", "Ya", "Ya", "–", "Ya", "–"] },
  { fitur: "Jadwal & materi", akses: ["Lihat", "Kelola", "Kelola", "Kelola", "Lihat", "Lihat", "–"] },
  { fitur: "Rekap & perlu dihubungi", akses: ["Lihat", "Lihat", "Lihat", "Kelola", "Lihat", "Wilayahnya", "–"] },
  { fitur: "Sodaqoh", akses: ["Lihat", "Lihat", "Lihat", "–", "Kelola", "–", "–"] },
  { fitur: "Musyawarah", akses: ["Lihat", "Kelola", "Kelola", "Kelola", "Lihat", "Lihat", "–"] },
  { fitur: "Masukan", akses: ["Lihat", "Lihat", "Lihat", "Lihat", "–", "–", "–"] },
  { fitur: "Kepengurusan & akun", akses: ["Lihat", "Kelola", "Kelola", "–", "–", "–", "–"] },
];

export type GalatPengurus = Partial<Record<"nama" | "jabatan" | "wilayah" | "peran", string>>;

// Nanti WAJIB diulang di server dengan Zod.
export function periksaPengurus(isian: { nama: string; jabatan: string; wilayah: string; peran: string }): GalatPengurus {
  const galat: GalatPengurus = {};
  if (isian.nama.trim().length < 3) galat.nama = "Nama minimal 3 huruf";
  if (isian.jabatan.trim().length < 3) galat.jabatan = "Isi jabatan, contoh: Seksi Acara";
  if (!["Pimpinan", "Bendlay 2", "Bendlay 4"].includes(isian.wilayah)) galat.wilayah = "Pilih wilayah";
  if (!PERAN_PENGURUS.includes(isian.peran as Peran)) galat.peran = "Pilih peran di sistem";
  return galat;
}
