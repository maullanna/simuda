// Tipe data sodaqoh dan fungsi bantunya (KONSEP 5.8).
// Aturan penting: data tidak pernah dihapus, setiap perubahan dicatat beserta alasan.

export type JenisTransaksi = "pemasukan" | "pengeluaran";

export type Transaksi = {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenis: JenisTransaksi;
  jumlah: number; // rupiah, bilangan bulat, selalu positif
  keterangan: string;
  penghitung?: [string, string]; // pemasukan: dua orang yang menghitung
  bukti?: { nama: string; tipe: "foto" | "pdf" }; // pengeluaran: foto nota
  dicatatOleh: string;
  diubah?: boolean; // pernah diubah (lihat riwayat perubahan)
};

// Catatan audit (tabel audit_log di KONSEP): siapa mengubah apa, kapan, dan kenapa.
export type RiwayatPerubahan = {
  id: string;
  waktu: string; // contoh "2026-10-06 21:15"
  oleh: string;
  transaksiId: string;
  perubahan: string; // contoh "Jumlah Rp 150.000 → Rp 175.000"
  alasan: string;
};

export type TransaksiDenganSaldo = Transaksi & { saldo: number };

// Urut dari yang terlama, lalu hitung saldo setelah setiap transaksi.
export function hitungSaldoBerjalan(transaksi: Transaksi[]): TransaksiDenganSaldo[] {
  let saldo = 0;
  return [...transaksi]
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.id.localeCompare(b.id))
    .map((t) => {
      saldo += t.jenis === "pemasukan" ? t.jumlah : -t.jumlah;
      return { ...t, saldo };
    });
}

export function ringkasSodaqoh(transaksi: Transaksi[], dari: string, sampai: string) {
  const dalamPeriode = transaksi.filter((t) => t.tanggal >= dari && t.tanggal <= sampai);
  const jumlah = (jenis: JenisTransaksi) => dalamPeriode.filter((t) => t.jenis === jenis).reduce((n, t) => n + t.jumlah, 0);
  return {
    saldo: transaksi.reduce((n, t) => n + (t.jenis === "pemasukan" ? t.jumlah : -t.jumlah), 0),
    masuk: jumlah("pemasukan"),
    keluar: jumlah("pengeluaran"),
  };
}

// "Rp 1.250.000" atau "1250000" -> 1250000. Selain angka diabaikan.
export function bacaRupiah(teks: string): number {
  const angka = teks.replace(/\D/g, "");
  return angka ? Number(angka) : 0;
}

// ---------------------------------------------------------------------------
// Pemeriksaan isian. Sama seperti form lain: nanti WAJIB diulang di server dengan Zod.

const BATAS_JUMLAH = 100_000_000;

function periksaJumlah(jumlah: number): string | undefined {
  if (jumlah <= 0) return "Isi jumlah lebih dari Rp 0";
  if (jumlah > BATAS_JUMLAH) return "Jumlah terlalu besar, periksa lagi";
  return undefined;
}

export type GalatSodaqoh = Partial<Record<"tanggal" | "jumlah" | "keterangan" | "penghitung" | "bukti" | "alasan", string>>;

export function periksaPemasukan(isian: { tanggal: string; jumlah: number; keterangan: string; penghitung1: string; penghitung2: string }, hariIni: string): GalatSodaqoh {
  const galat: GalatSodaqoh = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isian.tanggal)) galat.tanggal = "Isi tanggal";
  else if (isian.tanggal > hariIni) galat.tanggal = "Tanggal tidak boleh setelah hari ini";
  const j = periksaJumlah(isian.jumlah);
  if (j) galat.jumlah = j;
  if (isian.keterangan.trim().length < 3) galat.keterangan = "Isi keterangan singkat";
  if (!isian.penghitung1 || !isian.penghitung2) galat.penghitung = "Pilih dua orang penghitung";
  else if (isian.penghitung1 === isian.penghitung2) galat.penghitung = "Penghitung harus dua orang yang berbeda";
  return galat;
}

export function periksaPengeluaran(isian: { tanggal: string; jumlah: number; keterangan: string; adaBukti: boolean }, hariIni: string): GalatSodaqoh {
  const galat: GalatSodaqoh = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isian.tanggal)) galat.tanggal = "Isi tanggal";
  else if (isian.tanggal > hariIni) galat.tanggal = "Tanggal tidak boleh setelah hari ini";
  const j = periksaJumlah(isian.jumlah);
  if (j) galat.jumlah = j;
  if (isian.keterangan.trim().length < 3) galat.keterangan = "Isi keperluan pengeluaran";
  if (!isian.adaBukti) galat.bukti = "Foto nota wajib dilampirkan";
  return galat;
}

export function periksaPerubahan(isian: { jumlah: number; keterangan: string; alasan: string }, lama: Transaksi): GalatSodaqoh {
  const galat: GalatSodaqoh = {};
  const j = periksaJumlah(isian.jumlah);
  if (j) galat.jumlah = j;
  if (isian.keterangan.trim().length < 3) galat.keterangan = "Isi keterangan singkat";
  if (isian.jumlah === lama.jumlah && isian.keterangan.trim() === lama.keterangan) galat.jumlah = "Belum ada yang diubah";
  if (isian.alasan.trim().length < 5) galat.alasan = "Tulis alasan perubahan (wajib)";
  return galat;
}
