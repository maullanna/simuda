// Pagination untuk tabel data. Nomor halaman dan jumlah baris disimpan di URL,
// misalnya /peserta?halaman=2&per=10, jadi halaman tetap bisa dirender di server.

export const PILIHAN_PER_HALAMAN = [5, 10, 25, 50];
export const BAWAAN_PER_HALAMAN = 10;

function bacaAngka(nilai: string | string[] | undefined): number | undefined {
  const n = typeof nilai === "string" ? Number(nilai) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

// Mengambil sebagian data untuk satu halaman. Nomor halaman di luar jangkauan
// (misalnya halaman 9 padahal hanya ada 3) otomatis dibatasi ke halaman terakhir.
export function potongHalaman<T>(
  data: T[],
  halamanDiminta: string | string[] | undefined,
  perDiminta: string | string[] | undefined,
) {
  const perAngka = bacaAngka(perDiminta);
  const per = perAngka && PILIHAN_PER_HALAMAN.includes(perAngka) ? perAngka : BAWAAN_PER_HALAMAN;
  const jumlahHalaman = Math.max(1, Math.ceil(data.length / per));
  const halaman = Math.min(bacaAngka(halamanDiminta) ?? 1, jumlahHalaman);
  const awal = (halaman - 1) * per;

  return {
    isi: data.slice(awal, awal + per),
    halaman,
    per,
    total: data.length,
    nomorAwal: data.length === 0 ? 0 : awal + 1, // nomor baris pertama di halaman ini, untuk kolom "No"
  };
}
