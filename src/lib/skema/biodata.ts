// Aturan isian biodata muda/i dan data kelompok, dipakai Server Action (aturan keamanan no. 2).
// Semua isian boleh kosong: teks kosong dan pilihan kosong disimpan sebagai null.
import { z } from "zod";

const teks = (maks: number) =>
  z
    .string()
    .trim()
    .max(maks, { error: `Maksimal ${maks} karakter` })
    .transform((s) => (s === "" ? null : s.replace(/\s+/g, " ")));

const angka = (min: number, maks: number, satuan = "") =>
  z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : Number(s)))
    .refine((n) => n === null || (Number.isInteger(n) && n >= min && n <= maks), {
      error: `Isi angka ${min}–${maks}${satuan}`,
    });

const pilihan = <const T extends readonly [string, ...string[]]>(nilai: T, pesan: string) =>
  z
    .string()
    .transform((s) => (s === "" ? null : s))
    .pipe(z.enum(nilai, { error: pesan }).nullable());

export const skemaBiodata = z
  .object({
    namaAyah: teks(100),
    tempatLahir: teks(60),
    anakKe: angka(1, 30),
    jumlahSaudara: angka(1, 30),
    suku: teks(40),
    tinggiCm: angka(80, 250, " cm"),
    beratKg: angka(20, 250, " kg"),
    golonganDarah: pilihan(["A", "B", "AB", "O"], "Pilih golongan darah"),
    statusNikah: pilihan(["belum_menikah", "menikah"], "Pilih status"),
    pendidikanJenjang: pilihan(["sd", "smp", "sma", "smk", "d3", "d4", "s1", "s2", "s3", "lainnya"], "Pilih jenjang"),
    pendidikanJurusan: teks(100),
    skill: teks(200),
    pekerjaan: teks(100),
    hobi: teks(200),
    dapukan: teks(100),
  })
  .refine((b) => b.anakKe === null || b.jumlahSaudara === null || b.anakKe <= b.jumlahSaudara, {
    error: "Anak ke- tidak boleh lebih dari jumlah saudara",
    path: ["anakKe"],
  });

export const skemaDataKelompok = z.object({
  desa: teks(60),
  daerah: teks(60),
  kipok: teks(100),
  timPnkbKelompok: teks(150),
  timPnkbDesa: teks(150),
  timPnkbDaerah: teks(150),
});

export const KOLOM_BIODATA = Object.keys(skemaBiodata.shape) as (keyof z.infer<typeof skemaBiodata>)[];
export const KOLOM_DATA_KELOMPOK = Object.keys(skemaDataKelompok.shape) as (keyof z.infer<typeof skemaDataKelompok>)[];
