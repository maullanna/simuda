// Peran pengguna (KONSEP bagian 3.1). Tabel hak akses per fitur ada di lib/hak-akses.ts.
// Peran admin tidak ada di PERAN_PENGURUS, jadi tidak bisa dipilih dari form: hanya lewat `npm run jadikan-admin`.

export type Peran = "admin" | "kyai" | "wakil" | "ketua" | "sekretaris" | "bendahara" | "pengurus" | "petugas_scan";

export const labelPeran: Record<Peran, string> = {
  admin: "Administrator",
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
