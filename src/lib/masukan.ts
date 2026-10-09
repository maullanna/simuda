// Masukan peserta tentang pengajian (KONSEP 5.10).
// Masukan tanpa nama benar-benar tidak menyimpan identitas: pesertaId kosong,
// jadi pengurus pun tidak bisa mengetahui pengirimnya.

export type Masukan = {
  id: string;
  dibuat: string; // "YYYY-MM-DD HH:MM"
  isi: string;
  pesertaId: string | null; // null = tanpa nama
  sesiId: string | null; // sesi pengajian yang dibahas, kalau ada
};

export const PANJANG_MASUKAN = { min: 10, maks: 500 };

export function periksaMasukan(isi: string): string | undefined {
  const t = isi.trim();
  if (t.length < PANJANG_MASUKAN.min) return `Tulis minimal ${PANJANG_MASUKAN.min} huruf`;
  if (t.length > PANJANG_MASUKAN.maks) return `Maksimal ${PANJANG_MASUKAN.maks} huruf`;
  return undefined;
}
