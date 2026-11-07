// Biodata muda/i untuk Tim PnKB (KONSEP 5.1b): tipe, label pilihan, dan teks "PROFIL BIODATA MUDA MUDI".
// Dipakai di server dan browser (tidak berisi rahasia; datanya sendiri hanya dikirim ke yang berhak).

import type { JenisKelamin, Wilayah } from "@/lib/peserta";

export type GolonganDarah = "A" | "B" | "AB" | "O";
export type StatusNikah = "belum_menikah" | "menikah";
export type JenjangPendidikan = "sd" | "smp" | "sma" | "smk" | "d3" | "d4" | "s1" | "s2" | "s3" | "lainnya";

export const DAFTAR_GOLONGAN_DARAH: GolonganDarah[] = ["A", "B", "AB", "O"];

export const labelStatusNikah: Record<StatusNikah, string> = {
  belum_menikah: "Belum menikah",
  menikah: "Sudah menikah",
};

export const labelJenjang: Record<JenjangPendidikan, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  smk: "SMK",
  d3: "D3",
  d4: "D4",
  s1: "S1",
  s2: "S2",
  s3: "S3",
  lainnya: "Lainnya",
};

// Semua isian boleh kosong (null), dilengkapi bertahap.
export type Biodata = {
  namaAyah: string | null;
  tempatLahir: string | null;
  anakKe: number | null;
  jumlahSaudara: number | null;
  suku: string | null;
  tinggiCm: number | null;
  beratKg: number | null;
  golonganDarah: GolonganDarah | null;
  statusNikah: StatusNikah | null;
  pendidikanJenjang: JenjangPendidikan | null;
  pendidikanJurusan: string | null;
  skill: string | null;
  pekerjaan: string | null;
  hobi: string | null;
  dapukan: string | null;
};

export const BIODATA_KOSONG: Biodata = {
  namaAyah: null,
  tempatLahir: null,
  anakKe: null,
  jumlahSaudara: null,
  suku: null,
  tinggiCm: null,
  beratKg: null,
  golonganDarah: null,
  statusNikah: null,
  pendidikanJenjang: null,
  pendidikanJurusan: null,
  skill: null,
  pekerjaan: null,
  hobi: null,
  dapukan: null,
};

// Data per kelompok: sama untuk semua peserta di Bendlay 2 atau Bendlay 4.
export type DataKelompok = {
  wilayah: Wilayah;
  desa: string | null;
  daerah: string | null;
  kipok: string | null;
  timPnkbKelompok: string | null;
  timPnkbDesa: string | null;
  timPnkbDaerah: string | null;
};

export function teksPendidikan(b: Pick<Biodata, "pendidikanJenjang" | "pendidikanJurusan">): string | null {
  const isi = [b.pendidikanJenjang ? labelJenjang[b.pendidikanJenjang] : null, b.pendidikanJurusan].filter(Boolean).join(" ");
  return isi || null;
}

// Teks siap kirim (WhatsApp) dengan format yang dipakai Tim PnKB. Isian kosong ditulis "-".
export function teksProfil(
  p: { nama: string; jenisKelamin: JenisKelamin; tanggalLahir: string; wilayah: Wilayah },
  b: Biodata,
  k: DataKelompok | null,
): string {
  const isi = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? "-" : String(v));
  const [th, bln, tgl] = p.tanggalLahir.split("-");
  const binti = p.jenisKelamin === "putra" ? "bin" : "binti";
  const anak = b.anakKe && b.jumlahSaudara ? `Anak ke ${b.anakKe} dari ${b.jumlahSaudara} bersaudara.` : "Anak ke - dari - bersaudara.";

  return [
    "*PROFIL BIODATA MUDA MUDI :*",
    `Nama : ${p.nama}${b.namaAyah ? ` ${binti} ${b.namaAyah}` : ""}`,
    `Lahir : ${isi(b.tempatLahir)}, ${tgl} - ${bln} - ${th}`,
    anak,
    `Suku : ${isi(b.suku)}`,
    `Tinggi / Berat : ${isi(b.tinggiCm)} cm / ${isi(b.beratKg)} kg`,
    `Golongan Darah : ${isi(b.golonganDarah)}`,
    `Status : ${isi(b.statusNikah ? labelStatusNikah[b.statusNikah] : null)}`,
    `Pendidikan : ${isi(teksPendidikan(b))}`,
    `Skill : ${isi(b.skill)}`,
    `Pekerjaan : ${isi(b.pekerjaan)}`,
    `Hobby : ${isi(b.hobi)}`,
    `Dapukan : ${isi(b.dapukan)}`,
    `Sambung : Klp ${p.wilayah} Desa ${isi(k?.desa)} Daerah ${isi(k?.daerah)}`,
    `Kipok : ${isi(k?.kipok)}`,
    `Tim PnKB Daerah : ${isi(k?.timPnkbDaerah)}`,
    `Tim PnKB Ds : ${isi(k?.timPnkbDesa)}`,
    `Tim PnKB Klp : ${isi(k?.timPnkbKelompok)}`,
  ].join("\n");
}
