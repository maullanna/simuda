// Tipe data peserta dan fungsi bantu yang dipakai di banyak halaman.

export type JenisKelamin = "putra" | "putri";
export type Wilayah = "Bendlay 2" | "Bendlay 4";
export type StatusPeserta = "aktif" | "tidak_aktif";
export type Kategori = "remaja" | "pra-nikah";

export type Peserta = {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  wilayah: Wilayah;
  tanggalLahir: string; // format YYYY-MM-DD
  noHp: string;
  status: StatusPeserta;
  tanggalBergabung: string; // format YYYY-MM-DD
};

// Tanggal hari ini menurut jam Indonesia (WIB), dalam format YYYY-MM-DD.
// Server Vercel memakai jam UTC, jadi zona waktunya harus disebut jelas.
// Locale "en-CA" dipakai hanya karena formatnya kebetulan YYYY-MM-DD.
function tanggalHariIniWib(sekarang: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(sekarang);
}

export function hitungUmur(tanggalLahir: string, sekarang = new Date()): number {
  const [tahunIni, bulanIni, hariIni] = tanggalHariIniWib(sekarang).split("-").map(Number);
  const [tahunLahir, bulanLahir, hariLahir] = tanggalLahir.split("-").map(Number);

  let umur = tahunIni - tahunLahir;
  const belumUlangTahun = bulanIni < bulanLahir || (bulanIni === bulanLahir && hariIni < hariLahir);
  if (belumUlangTahun) umur--;
  return umur;
}

// Kategori tidak disimpan di database, selalu dihitung dari tanggal lahir.
// Begitu peserta berusia 19 tahun, otomatis pindah ke pra-nikah.
export function kategoriPeserta(tanggalLahir: string, sekarang = new Date()): Kategori {
  return hitungUmur(tanggalLahir, sekarang) <= 18 ? "remaja" : "pra-nikah";
}

export const labelKategori: Record<Kategori, string> = {
  remaja: "Remaja",
  "pra-nikah": "Pra-nikah",
};

export const labelJenisKelamin: Record<JenisKelamin, string> = {
  putra: "Putra",
  putri: "Putri",
};
