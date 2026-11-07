// Data kepengurusan untuk form (browser dan server). Hak akses tiap pengurus mengikuti LEVEL-nya
// (KONSEP 3.1); daftar fitur dan hak awal ada di lib/hak-akses.ts.

// Level ringkas yang dikirim ke tampilan (pilihan di form, label di kartu pengurus).
export type LevelRingkas = { id: string; nama: string; aksesPenuh: boolean };

export type Pengurus = { id: string; nama: string; jabatan: string; wilayah: string; levelId: string };

export type GalatPengurus = Partial<Record<"nama" | "jabatan" | "wilayah" | "levelId", string>>;

// Pemeriksaan cepat di browser; diulang di server dengan Zod.
export function periksaPengurus(isian: { nama: string; jabatan: string; wilayah: string; levelId: string }): GalatPengurus {
  const galat: GalatPengurus = {};
  if (isian.nama.trim().length < 3) galat.nama = "Nama minimal 3 huruf";
  if (isian.jabatan.trim().length < 3) galat.jabatan = "Isi jabatan, contoh: Seksi Acara";
  if (!["Pimpinan", "Bendlay 2", "Bendlay 4"].includes(isian.wilayah)) galat.wilayah = "Pilih kelompok";
  if (!isian.levelId) galat.levelId = "Pilih level";
  return galat;
}
