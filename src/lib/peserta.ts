
export type JenisKelamin = "putra" | "putri";
export type Wilayah = "Bendlay 2" | "Bendlay 4";
export type StatusPeserta = "aktif" | "tidak_aktif";
export type Kategori = "pra-remaja" | "remaja" | "pra-nikah";
export const DAFTAR_KATEGORI: Kategori[] = ["pra-remaja", "remaja", "pra-nikah"];

export type Peserta = {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  wilayah: Wilayah;
  tanggalLahir: string; 
  noHp: string;
  status: StatusPeserta;
  tanggalBergabung: string; 
};


export function tanggalHariIniWib(sekarang = new Date()): string {
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


// Pra-remaja sampai 15 tahun, remaja 16–18 tahun, pra-nikah 19 tahun ke atas (KONSEP bagian 2).
export function kategoriPeserta(tanggalLahir: string, sekarang = new Date()): Kategori {
  const umur = hitungUmur(tanggalLahir, sekarang);
  return umur <= 15 ? "pra-remaja" : umur <= 18 ? "remaja" : "pra-nikah";
}

export const labelKategori: Record<Kategori, string> = {
  "pra-remaja": "Pra-remaja",
  remaja: "Remaja",
  "pra-nikah": "Pra-nikah",
};

export const labelJenisKelamin: Record<JenisKelamin, string> = {
  putra: "Putra",
  putri: "Putri",
};

export type IsianPeserta = {
  nama: string;
  jenisKelamin: string;
  wilayah: string;
  tanggalLahir: string;
  noHp: string;
  status: string;
};

export type GalatIsian = Partial<Record<keyof IsianPeserta, string>>;


export function periksaIsianPeserta(isian: IsianPeserta, hariIni: string): GalatIsian {
  const galat: GalatIsian = {};

  const nama = isian.nama.trim();
  if (nama.length < 3) galat.nama = "Nama minimal 3 huruf";
  else if (nama.length > 100) galat.nama = "Nama terlalu panjang";

  if (isian.jenisKelamin !== "putra" && isian.jenisKelamin !== "putri") {
    galat.jenisKelamin = "Pilih putra atau putri";
  }

  if (isian.wilayah !== "Bendlay 2" && isian.wilayah !== "Bendlay 4") {
    galat.wilayah = "Pilih wilayah";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isian.tanggalLahir)) galat.tanggalLahir = "Isi tanggal lahir";
  else if (isian.tanggalLahir > hariIni) galat.tanggalLahir = "Tanggal lahir tidak boleh setelah hari ini";

  const noHp = isian.noHp.replace(/[\s-]/g, "");
  if (noHp !== "" && !/^(\+62|62|0)8\d{7,11}$/.test(noHp)) {
    galat.noHp = "Format no HP belum benar, contoh 081234567890";
  }

  return galat;
}
