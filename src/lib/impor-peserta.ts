// Membaca dan memeriksa baris-baris Excel untuk impor pemuda/i (KONSEP 5.1 dan 5.1b).
// Fungsi di sini tidak bergantung pada library Excel: isinya hanya mengubah nilai sel
// mentah menjadi data pemuda/i, supaya bisa dipakai di browser (pratinjau) dan diulang di server.

import { kategoriPeserta, periksaIsianPeserta, type IsianPeserta } from "./peserta";
import { skemaBiodata } from "./skema/biodata";

// Kolom data diri (sama dengan form Tambah pemuda/i). Empat yang pertama wajib.
export const KOLOM_IMPOR = ["Nama lengkap", "Jenis kelamin", "Kelompok", "Tanggal lahir", "No HP"] as const;

// Kolom biodata (sama dengan form biodata, KONSEP 5.1b). Semua boleh kosong.
// Hanya diproses kalau yang mengimpor Administrator.
export const KOLOM_BIODATA_IMPOR = [
  { kunci: "namaAyah", judul: "Nama ayah", cari: ["nama ayah", "ayah"], contoh: "Ahmad Fauzi" },
  { kunci: "tempatLahir", judul: "Kota lahir", cari: ["kota lahir", "tempat lahir"], contoh: "Bekasi" },
  { kunci: "anakKe", judul: "Anak ke", cari: ["anak ke"], contoh: "2" },
  { kunci: "jumlahSaudara", judul: "Jumlah saudara", cari: ["saudara"], contoh: "4" },
  { kunci: "suku", judul: "Suku", cari: ["suku"], contoh: "Jawa" },
  { kunci: "tinggiCm", judul: "Tinggi (cm)", cari: ["tinggi"], contoh: "165" },
  { kunci: "beratKg", judul: "Berat (kg)", cari: ["berat"], contoh: "55" },
  { kunci: "golonganDarah", judul: "Golongan darah", cari: ["golongan darah", "gol darah", "darah"], contoh: "O" },
  { kunci: "statusNikah", judul: "Status nikah", cari: ["status nikah", "nikah", "status"], contoh: "Belum menikah" },
  { kunci: "pendidikanJenjang", judul: "Pendidikan", cari: ["pendidikan", "jenjang"], contoh: "S1" },
  { kunci: "pendidikanJurusan", judul: "Jurusan", cari: ["jurusan"], contoh: "Informatika" },
  { kunci: "pekerjaan", judul: "Pekerjaan", cari: ["pekerjaan"], contoh: "Karyawan" },
  { kunci: "skill", judul: "Skill", cari: ["skill", "keahlian"], contoh: "Desain grafis" },
  { kunci: "hobi", judul: "Hobi", cari: ["hobi", "hobby"], contoh: "Membaca" },
  { kunci: "dapukan", judul: "Dapukan", cari: ["dapukan"], contoh: "Penerobos" },
] as const;

export type KunciBiodata = (typeof KOLOM_BIODATA_IMPOR)[number]["kunci"];

export type BarisImpor = {
  nomorBaris: number; // nomor baris di Excel, supaya pengurus mudah mencarinya
  nama: string;
  jenisKelamin: string; // "putra" / "putri" setelah dinormalkan
  wilayah: string; // "Bendlay 2" / "Bendlay 4" setelah dinormalkan
  tanggalLahir: string; // YYYY-MM-DD setelah dinormalkan
  noHp: string;
  kategori: string | null;
  biodata: Partial<Record<KunciBiodata, string>>; // isian biodata yang terisi (bentuk teks, seperti isian form)
  masalah: string[]; // kosong = siap diimpor
};

// Mencari kolom dari judulnya, supaya urutan kolom di file boleh berbeda.
// `kecuali`: judul yang mengandung kata ini dilewati (misalnya "ayah" saat mencari "nama").
function cariKolom(judul: string[], kata: string[], kecuali: string[] = []): number {
  const j = judul.map((x) => x.toLowerCase());
  for (const k of kata) {
    const i = j.findIndex((x) => x.includes(k) && !kecuali.some((e) => x.includes(e)));
    if (i >= 0) return i;
  }
  return -1;
}

function teks(nilai: unknown): string {
  if (nilai === null || nilai === undefined) return "";
  if (nilai instanceof Date) return nilai.toISOString().slice(0, 10);
  if (typeof nilai === "object" && "text" in nilai) return String((nilai as { text: unknown }).text ?? "").trim(); // sel teks berformat
  if (typeof nilai === "object" && "result" in nilai) return teks((nilai as { result: unknown }).result); // sel rumus
  if (typeof nilai === "object" && "richText" in nilai) {
    return ((nilai as { richText: { text: string }[] }).richText ?? []).map((r) => r.text).join("").trim();
  }
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

// No HP: rapikan spasi, strip, dan +62. Angka di Excel kehilangan 0 di depan (812... bukan 0812...).
function normalNoHp(nilai: unknown): string {
  let t = teks(nilai).replace(/[\s().-]/g, "");
  if (t.startsWith("+62")) t = `0${t.slice(3)}`;
  else if (/^628/.test(t)) t = `0${t.slice(2)}`;
  if (/^8\d{7,11}$/.test(t)) return `0${t}`;
  return t;
}

// Biodata: diubah ke bentuk yang sama dengan isian form, lalu diperiksa aturan yang sama (skemaBiodata).
function normalBiodata(kunci: KunciBiodata, nilai: unknown): string {
  const t = teks(nilai);
  if (!t) return "";
  switch (kunci) {
    case "anakKe":
    case "jumlahSaudara":
    case "tinggiCm":
    case "beratKg":
      return t.match(/\d+/)?.[0] ?? t; // "165 cm" -> "165"
    case "golonganDarah":
      return t.toUpperCase().replace(/[^ABO]/g, "") || t; // "AB+" -> "AB"; isian tak dikenal dibiarkan supaya ditandai salah
    case "statusNikah": {
      const v = t.toLowerCase();
      if (v.includes("belum") || v.includes("lajang") || v.includes("single")) return "belum_menikah";
      if (v.includes("nikah") || v.includes("kawin")) return "menikah";
      return t;
    }
    case "pendidikanJenjang": {
      const v = t.toLowerCase().replace(/[^a-z0-9]/g, "");
      const peta: Record<string, string> = { sd: "sd", mi: "sd", smp: "smp", mts: "smp", sma: "sma", ma: "sma", smk: "smk", d3: "d3", d4: "d4", s1: "s1", s2: "s2", s3: "s3" };
      return peta[v] ?? (v ? "lainnya" : "");
    }
    default:
      return t;
  }
}

export type PesertaAda = { nama: string; tanggalLahir: string };

// Mengubah baris mentah (baris pertama = judul kolom) menjadi daftar pemuda/i yang sudah diperiksa.
export function periksaBarisImpor(baris: unknown[][], hariIni: string, sudahAda: PesertaAda[]): { baris: BarisImpor[]; galatFile?: string; adaKolomBiodata: boolean } {
  if (baris.length < 2) return { baris: [], galatFile: "File kosong atau hanya berisi judul kolom.", adaKolomBiodata: false };

  const judul = baris[0].map(teks);
  const k = {
    nama: cariKolom(judul, ["nama lengkap", "nama"], ["ayah", "ibu", "wali"]),
    jk: cariKolom(judul, ["jenis kelamin", "kelamin", "jk"]),
    wilayah: cariKolom(judul, ["kelompok", "wilayah", "bendlay"]),
    lahir: cariKolom(judul, ["tanggal lahir", "tgl lahir", "lahir"], ["kota", "tempat"]),
    hp: cariKolom(judul, ["no hp", "hp", "telepon", "whatsapp", "wa"]),
  };
  const hilang = (["nama", "jk", "wilayah", "lahir"] as const).filter((x) => k[x] < 0);
  if (hilang.length > 0) {
    return {
      baris: [],
      galatFile: `Kolom wajib tidak ditemukan. Pastikan baris pertama berisi judul: ${KOLOM_IMPOR.slice(0, 4).join(", ")}.`,
      adaKolomBiodata: false,
    };
  }
  const kolomBiodata = KOLOM_BIODATA_IMPOR.map((b) => ({ ...b, i: cariKolom(judul, [...b.cari]) })).filter((b) => b.i >= 0);

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

    // Aturan yang sama persis dengan form Tambah pemuda/i.
    const galat = periksaIsianPeserta(isian, hariIni);
    const masalah = Object.values(galat).filter((g): g is string => Boolean(g));
    if (galat.jenisKelamin && mentahJk) masalah.splice(masalah.indexOf(galat.jenisKelamin), 1, `Jenis kelamin "${mentahJk}" tidak dikenali, tulis Putra atau Putri`);
    if (galat.wilayah && mentahWilayah) masalah.splice(masalah.indexOf(galat.wilayah), 1, `Kelompok "${mentahWilayah}" tidak dikenali, tulis Bendlay 2 atau Bendlay 4`);

    const kunciBaris = kunci(isian.nama, isian.tanggalLahir);
    if (!galat.nama && !galat.tanggalLahir) {
      if (ada.has(kunciBaris)) masalah.push("Sudah terdaftar (nama dan tanggal lahir sama)");
      else if (diFile.has(kunciBaris)) masalah.push(`Ganda dengan baris ${diFile.get(kunciBaris)}`);
      else diFile.set(kunciBaris, nomorBaris);
    }

    // Biodata: aturan yang sama dengan form biodata.
    const biodata: BarisImpor["biodata"] = {};
    for (const b of kolomBiodata) {
      const v = normalBiodata(b.kunci, sel[b.i]);
      if (v) biodata[b.kunci] = v;
    }
    if (Object.keys(biodata).length > 0) {
      const cek = skemaBiodata.safeParse(Object.fromEntries(KOLOM_BIODATA_IMPOR.map((b) => [b.kunci, biodata[b.kunci] ?? ""])));
      if (!cek.success) {
        for (const isu of cek.error.issues) {
          const judulKolom = KOLOM_BIODATA_IMPOR.find((b) => b.kunci === isu.path[0])?.judul ?? String(isu.path[0]);
          masalah.push(`${judulKolom}: ${isu.message}`);
        }
      }
    }

    hasil.push({
      nomorBaris,
      nama: isian.nama,
      jenisKelamin: isian.jenisKelamin,
      wilayah: isian.wilayah,
      tanggalLahir: isian.tanggalLahir,
      noHp: isian.noHp,
      kategori: galat.tanggalLahir ? null : kategoriPeserta(isian.tanggalLahir),
      biodata,
      masalah,
    });
  });

  if (hasil.length === 0) return { baris: [], galatFile: "Tidak ada baris data di bawah judul kolom.", adaKolomBiodata: kolomBiodata.length > 0 };
  return { baris: hasil, adaKolomBiodata: kolomBiodata.length > 0 };
}
