// Periode tanggal untuk filter di navbar. Disimpan di URL: ?dari=YYYY-MM-DD&sampai=YYYY-MM-DD
// Kalau tidak ada di URL, periode bawaan adalah bulan ini.

import { formatTanggal } from "./sesi";

export type Periode = {
  dari: string;
  sampai: string;
  label: string; // contoh: "Oktober 2026" atau "1 Okt – 9 Okt 2026"
};

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function keTeks(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function awalBulan(tanggal: string): string {
  return tanggal.slice(0, 8) + "01";
}

export function akhirBulan(tanggal: string): string {
  const [tahun, bulan] = tanggal.split("-").map(Number);
  // Hari ke-0 bulan berikutnya = hari terakhir bulan ini.
  return keTeks(new Date(Date.UTC(tahun, bulan, 0)));
}

export function geserBulan(tanggal: string, jumlah: number): string {
  const [tahun, bulan] = tanggal.split("-").map(Number);
  return keTeks(new Date(Date.UTC(tahun, bulan - 1 + jumlah, 1)));
}

export function labelPeriode(dari: string, sampai: string): string {
  if (dari === awalBulan(dari) && sampai === akhirBulan(dari)) {
    return formatTanggal(dari, { month: "long", year: "numeric" });
  }
  const awal = formatTanggal(dari, { day: "numeric", month: "short", ...(dari.slice(0, 4) !== sampai.slice(0, 4) && { year: "numeric" }) });
  return `${awal} – ${formatTanggal(sampai, { day: "numeric", month: "short", year: "numeric" })}`;
}

export function bacaPeriode(
  dari: string | string[] | null | undefined,
  sampai: string | string[] | null | undefined,
  hariIni: string,
): Periode {
  let d = typeof dari === "string" && POLA_TANGGAL.test(dari) ? dari : undefined;
  let s = typeof sampai === "string" && POLA_TANGGAL.test(sampai) ? sampai : undefined;

  if (!d || !s) {
    d = awalBulan(hariIni);
    s = akhirBulan(hariIni);
  }
  // Kalau terbalik (dari setelah sampai), tukar saja daripada menampilkan kosong.
  if (d > s) [d, s] = [s, d];

  return { dari: d, sampai: s, label: labelPeriode(d, s) };
}
