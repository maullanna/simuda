// Membaca dan memeriksa baris-baris Excel untuk impor peserta (KONSEP 5.1).
// Fungsi di sini tidak bergantung pada library Excel: isinya hanya mengubah nilai sel
// mentah menjadi data peserta, supaya mudah diuji dan bisa dipakai ulang di server nanti.

import { kategoriPeserta, periksaIsianPeserta, type IsianPeserta } from "./peserta";

export const KOLOM_IMPOR = ["Nama lengkap", "Jenis kelamin", "Wilayah", "Tanggal lahir", "No HP"] as const;

export type BarisImpor = {
  nomorBaris: number; // nomor baris di Excel, supaya pengurus mudah mencarinya
  nama: string;
  jenisKelamin: string; // "putra" / "putri" setelah dinormalkan
  wilayah: string; // "Bendlay 2" / "Bendlay 4" setelah dinormalkan
  tanggalLahir: string; // YYYY-MM-DD setelah dinormalkan
  noHp: string;
  kategori: string | null;
  masalah: string[]; // kosong = siap diimpor
};

// Mencari kolom dari judulnya, supaya urutan kolom di file boleh berbeda.
function cariKolom(judul: string[], kata: string[]): number {
  return judul.findIndex((j) => kata.some((k) => j.toLowerCase().includes(k)));
}

function teks(nilai: unknown): string {
  if (nilai === null || nilai === undefined) return "";
  if (typeof nilai === "object" && "text" in nilai) return String((nilai as { text: unknown }).text ?? "").trim(); // sel teks berformat
  if (typeof nilai === "object" && "result" in nilai) return teks((nilai as { result: unknown }).result); // sel rumus
  return String(nilai).trim();
}

function normalJenisKelamin(nilai: string): string {
  const v = nilai.toLowerCase().replace(/[^a-z]/g, "");
  if (["putra", "lakilaki", "laki", "l", "pria", "ikhwan"].includes(v)) return "putra";
  if (["putri", "perempuan", "wanita", "akhwat"].includes(v)) return "putri";
  return ""; // termasuk "P" yang bisa berarti Putra atau Putri, jadi sengaja tidak ditebak
}

function normalWilayah(nilai: string): string {
  const angka = nilai.replace(/\D/g, "");
  if (angka === "2") return "Bendlay 2";
  if (angka === "4") return "Bendlay 4";
  return "";
}

const duaDigit = (n: number) => String(n).padStart(2, "0");

// Tanggal bisa datang sebagai objek Date (sel tanggal Excel) atau teks
// "17/08/2008", "17-08-2008", atau "2008-08-17".
export function normalTanggal(nilai: unknown): string {
  if (nilai instanceof Date && !Number.isNaN(nilai.getTime())) {
    // Excel menyimpan tanggal tanpa zona waktu; exceljs membacanya sebagai tengah malam UTC.
    return `${nilai.getUTCFullYear()}-${duaDigit(nilai.getUTCMonth() + 1)}-${duaDigit(nilai.getUTCDate())}`;
  }
  const t = teks(nilai);
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${duaDigit(+m[2])}-${duaDigit(+m[3])}`;
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${duaDigit(+m[2])}-${duaDigit(+m[1])}`;
  return t; // dibiarkan apa adanya, nanti ditandai salah oleh pemeriksaan
}

// No HP yang diketik sebagai angka di Excel kehilangan angka 0 di depan (812... bukan 0812...).
function normalNoHp(nilai: unknown): string {
  const t = teks(nilai).replace(/[\s-]/g, "");
  if (/^8\d{7,11}$/.test(t)) return `0${t}`;
  return t;
}

export type PesertaAda = { nama: string; tanggalLahir: string };

// Mengubah baris mentah (baris pertama = judul kolom) menjadi daftar peserta yang sudah diperiksa.
export function periksaBarisImpor(baris: unknown[][], hariIni: string, sudahAda: PesertaAda[]): { baris: BarisImpor[]; galatFile?: string } {
  if (baris.length < 2) return { baris: [], galatFile: "File kosong atau hanya berisi judul kolom." };

  const judul = baris[0].map(teks);
  const k = {
    nama: cariKolom(judul, ["nama"]),
    jk: cariKolom(judul, ["jenis", "kelamin", "jk"]),
    wilayah: cariKolom(judul, ["wilayah", "bendlay"]),
    lahir: cariKolom(judul, ["lahir"]),
    hp: cariKolom(judul, ["hp", "telepon", "wa"]),
  };
  const hilang = (["nama", "jk", "wilayah", "lahir"] as const).filter((x) => k[x] < 0);
  if (hilang.length > 0) {
    return { baris: [], galatFile: `Kolom wajib tidak ditemukan. Pastikan baris pertama berisi judul: ${KOLOM_IMPOR.slice(0, 4).join(", ")}.` };
  }

  const kunci = (nama: string, lahir: string) => `${nama.trim().toLowerCase().replace(/\s+/g, " ")}|${lahir}`;
  const ada = new Set(sudahAda.map((p) => kunci(p.nama, p.tanggalLahir)));
  const diFile = new Map<string, number>();

  const hasil: BarisImpor[] = [];
  baris.slice(1).forEach((sel, i) => {
    const nomorBaris = i + 2;
    if (sel.every((x) => teks(x) === "")) return; // baris kosong dilewati

    const mentahJk = teks(sel[k.jk]);
    const mentahWilayah = teks(sel[k.wilayah]);
    const isian: IsianPeserta = {
      nama: teks(sel[k.nama]).replace(/\s+/g, " "),
      jenisKelamin: normalJenisKelamin(mentahJk),
      wilayah: normalWilayah(mentahWilayah),
      tanggalLahir: normalTanggal(sel[k.lahir]),
      noHp: k.hp >= 0 ? normalNoHp(sel[k.hp]) : "",
      status: "aktif",
    };

    // Aturan yang sama persis dengan form Tambah peserta.
    const galat = periksaIsianPeserta(isian, hariIni);
    const masalah = Object.values(galat).filter((g): g is string => Boolean(g));
    if (galat.jenisKelamin && mentahJk) masalah.splice(masalah.indexOf(galat.jenisKelamin), 1, `Jenis kelamin "${mentahJk}" tidak dikenali, tulis Putra atau Putri`);
    if (galat.wilayah && mentahWilayah) masalah.splice(masalah.indexOf(galat.wilayah), 1, `Wilayah "${mentahWilayah}" tidak dikenali, tulis Bendlay 2 atau Bendlay 4`);

    const kunciBaris = kunci(isian.nama, isian.tanggalLahir);
    if (!galat.nama && !galat.tanggalLahir) {
      if (ada.has(kunciBaris)) masalah.push("Sudah terdaftar (nama dan tanggal lahir sama)");
      else if (diFile.has(kunciBaris)) masalah.push(`Ganda dengan baris ${diFile.get(kunciBaris)}`);
      else diFile.set(kunciBaris, nomorBaris);
    }

    hasil.push({
      nomorBaris,
      nama: isian.nama,
      jenisKelamin: isian.jenisKelamin,
      wilayah: isian.wilayah,
      tanggalLahir: isian.tanggalLahir,
      noHp: isian.noHp,
      kategori: galat.tanggalLahir ? null : kategoriPeserta(isian.tanggalLahir),
      masalah,
    });
  });

  if (hasil.length === 0) return { baris: [], galatFile: "Tidak ada baris data di bawah judul kolom." };
  return { baris: hasil };
}
