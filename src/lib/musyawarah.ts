// Tipe data musyawarah dan tindak lanjutnya (KONSEP 5.9), beserta pemeriksaan isian form.

export type Musyawarah = {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jam: string; // HH:MM
  lokasi: string;
  agenda: string[];
  hasil: string[]; // kosong = belum ditulis
  notulis: string;
  status: "terjadwal" | "selesai";
};

export type StatusTindakLanjut = "belum" | "berjalan" | "selesai";

export type TindakLanjut = {
  id: string;
  musyawarahId: string;
  tugas: string;
  pic: string; // penanggung jawab
  tenggat: string; // YYYY-MM-DD
  status: StatusTindakLanjut;
};

export const labelStatusTindakLanjut: Record<StatusTindakLanjut, string> = {
  belum: "Belum",
  berjalan: "Berjalan",
  selesai: "Selesai",
};

export function lewatTenggat(t: TindakLanjut, hariIni: string): boolean {
  return t.status !== "selesai" && t.tenggat < hariIni;
}

// ---------------------------------------------------------------------------
// Pemeriksaan isian. Nanti WAJIB diulang di server dengan Zod.

export type GalatJadwal = Partial<Record<"tanggal" | "jam" | "lokasi" | "agenda", string>>;

export function periksaJadwalMusyawarah(
  isian: { tanggal: string; jam: string; lokasi: string; agenda: string[] },
  hariIni: string,
): GalatJadwal {
  const galat: GalatJadwal = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isian.tanggal)) galat.tanggal = "Pilih tanggal";
  else if (isian.tanggal < hariIni) galat.tanggal = "Tanggal tidak boleh sebelum hari ini";
  if (!/^\d{2}:\d{2}$/.test(isian.jam)) galat.jam = "Isi jam";
  if (isian.lokasi.trim().length < 3) galat.lokasi = "Isi lokasi";
  if (isian.agenda.filter((a) => a.trim()).length === 0) galat.agenda = "Tulis minimal satu agenda";
  return galat;
}

export type BarisTindakLanjut = { tugas: string; pic: string; tenggat: string };

export type GalatHasil = { hasil?: string; tindakLanjut?: string[] };

export function periksaHasilMusyawarah(
  isian: { hasil: string; tindakLanjut: BarisTindakLanjut[] },
  tanggalMusyawarah: string,
): GalatHasil {
  const galat: GalatHasil = {};
  if (isian.hasil.trim().length < 10) galat.hasil = "Tulis hasil musyawarah (minimal 10 huruf)";

  const galatBaris = isian.tindakLanjut.map((b) => {
    const kosong = !b.tugas.trim() && !b.pic && !b.tenggat;
    if (kosong) return ""; // baris kosong diabaikan
    if (b.tugas.trim().length < 3) return "Tulis tugasnya";
    if (!b.pic) return "Pilih penanggung jawab";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.tenggat)) return "Pilih tenggat";
    if (b.tenggat < tanggalMusyawarah) return "Tenggat tidak boleh sebelum tanggal musyawarah";
    return "";
  });
  if (galatBaris.some(Boolean)) galat.tindakLanjut = galatBaris;
  return galat;
}
