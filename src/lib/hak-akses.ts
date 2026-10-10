// Hak akses per fitur dan per tindakan (KONSEP bagian 3.2). SATU-SATUNYA sumber aturan akses:
// dipakai requireRole() di server, sidebar (menu yang tampil), dan tabel di halaman Kepengurusan.
// Kalau tabel di KONSEP berubah, ubah juga di sini dengan urutan baris yang sama.
//
// Isi sel: L = lihat, T = tambah, U = ubah, S = suspend & pulihkan, Ya = boleh menjalankan, – = tidak ada akses.
// Teks dalam kurung hanya keterangan tampilan; batasannya (misalnya "wilayahnya") diperiksa di aksinya.
// File ini aman dipakai di browser: tidak berisi rahasia, hanya aturan.

import type { Peran } from "@/lib/kepengurusan";

// Urutan kolom sama dengan tabel KONSEP 3.2. "peserta" belum menjadi peran login (tahap 2), hanya ditampilkan.
export const KOLOM_PERAN = ["admin", "kyai", "wakil", "ketua", "sekretaris", "bendahara", "pengurus", "petugas_scan", "peserta"] as const;
type Sel = [string, string, string, string, string, string, string, string, string];

export const DAFTAR_FITUR = {
  // Beranda
  beranda: { kelompok: "Beranda", label: "Beranda pengurus", hak: ["L", "L", "L", "L", "L", "L", "L", "–", "Beranda sendiri"] },
  // Peserta
  peserta: { kelompok: "Peserta", label: "Data peserta", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–", "Data sendiri: L, U (no HP, foto)"] },
  imporPeserta: { kelompok: "Peserta", label: "Impor peserta dari Excel", hak: ["Ya", "–", "Ya", "Ya", "Ya", "–", "–", "–", "–"] },
  kartu: { kelompok: "Peserta", label: "Kartu: cetak, ganti kartu hilang", hak: ["LTS", "L", "LTS", "LTS", "LTS", "–", "–", "–", "Kartu sendiri: L"] },
  // Absensi
  daftarHadir: { kelompok: "Absensi", label: "Daftar hadir per sesi", hak: ["L", "L", "L", "L", "L", "L", "L", "L (sesi yang dibuka)", "–"] },
  bukaTutupSesi: { kelompok: "Absensi", label: "Buka dan tutup sesi", hak: ["Ya", "–", "Ya", "Ya", "Ya", "–", "Ya", "–", "–"] },
  scan: { kelompok: "Absensi", label: "Scan kehadiran", hak: ["Ya", "–", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "–"] },
  inputManual: { kelompok: "Absensi", label: "Input manual dan catat izin", hak: ["T", "–", "T", "T", "T", "–", "T", "–", "Tahap 2: ajukan izin sendiri"] },
  koreksiKehadiran: { kelompok: "Absensi", label: "Koreksi kehadiran", hak: ["US", "–", "US", "US", "US", "–", "–", "–", "–"] },
  // Jadwal dan materi
  sesi: { kelompok: "Jadwal dan materi", label: "Sesi pengajian", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–", "L (jadwalnya sendiri)"] },
  materi: { kelompok: "Jadwal dan materi", label: "Materi dan lampiran", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–", "L"] },
  pemateri: { kelompok: "Jadwal dan materi", label: "Pemateri", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–", "–"] },
  // Rekap
  rekap: { kelompok: "Rekap", label: "Rekap dan grafik kehadiran", hak: ["L", "L", "L", "L", "L", "L", "L (wilayahnya)", "–", "–"] },
  unduhRekap: { kelompok: "Rekap", label: "Unduh rekap Excel/PDF", hak: ["Ya", "Ya", "Ya", "Ya", "Ya", "–", "–", "–", "–"] },
  perluDihubungi: { kelompok: "Rekap", label: "Perlu dihubungi", hak: ["LU", "L", "LU", "LU", "LU", "–", "LU (wilayahnya)", "–", "–"] },
  // Sodaqoh
  sodaqohMasuk: { kelompok: "Sodaqoh", label: "Pemasukan per pengajian", hak: ["LTUS", "L", "L", "L", "–", "LTUS", "–", "–", "–"] },
  sodaqohKeluar: { kelompok: "Sodaqoh", label: "Pengeluaran (wajib foto nota)", hak: ["LTUS", "L", "L", "L", "–", "LTUS", "–", "–", "–"] },
  riwayatSodaqoh: { kelompok: "Sodaqoh", label: "Riwayat perubahan sodaqoh", hak: ["L", "L", "L", "L", "–", "L", "–", "–", "–"] },
  // Musyawarah
  musyawarah: { kelompok: "Musyawarah", label: "Jadwal, agenda, hasil", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–", "–"] },
  tindakLanjut: { kelompok: "Musyawarah", label: "Tindak lanjut", hak: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "LU (tugasnya)", "LU (tugasnya)", "–", "–"] },
  // Masukan
  masukan: { kelompok: "Masukan", label: "Masukan peserta", hak: ["LS", "L", "LS", "LS", "L", "–", "–", "–", "T (kirim)"] },
  // Kepengurusan
  pengurus: { kelompok: "Kepengurusan", label: "Data pengurus", hak: ["LTUS", "L", "LTUS", "LTUS", "–", "–", "–", "–", "–"] },
  akunLogin: { kelompok: "Kepengurusan", label: "Akun login: buat, reset, suspend", hak: ["Ya", "–", "Ya", "Ya", "–", "–", "–", "–", "–"] },
  petugasScan: { kelompok: "Kepengurusan", label: "Petugas scan: tunjuk dan cabut", hak: ["Ya", "–", "Ya", "Ya", "–", "–", "–", "–", "–"] },
  akunSaya: { kelompok: "Kepengurusan", label: "Akun saya: ganti kata sandi", hak: ["Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "Tahap 2 (OTP)"] },
  // Sistem
  riwayat: { kelompok: "Sistem", label: "Riwayat perubahan semua modul", hak: ["L", "L", "L", "L", "–", "–", "–", "–", "–"] },
  pengaturan: { kelompok: "Sistem", label: "Pengaturan (WhatsApp, notifikasi, backup)", hak: ["Ya", "–", "–", "–", "–", "–", "–", "–", "–"] },
} satisfies Record<string, { kelompok: string; label: string; hak: Sel }>;

export type Fitur = keyof typeof DAFTAR_FITUR;
// "jalankan" untuk fitur bertanda Ya (scan, impor, kelola akun, ...). "hapus" = hapus permanen, hanya Administrator (KONSEP 3.4).
export type Aksi = "lihat" | "tambah" | "ubah" | "suspend" | "jalankan" | "hapus";

const HURUF: Record<Exclude<Aksi, "jalankan" | "hapus">, string> = { lihat: "L", tambah: "T", ubah: "U", suspend: "S" };

export function boleh(peran: Peran, fitur: Fitur, aksi: Aksi): boolean {
  // Administrator selalu boleh semua. Satu-satunya tempat pengecualian ini ditulis.
  if (peran === "admin") return true;
  if (aksi === "hapus") return false;
  const sel = DAFTAR_FITUR[fitur].hak[KOLOM_PERAN.indexOf(peran)];
  const kode = sel.split(" ")[0]; // buang keterangan dalam kurung
  if (kode === "Ya") return aksi === "jalankan" || aksi === "lihat";
  if (aksi === "jalankan") return false;
  return /^[LTUS]+$/.test(kode) && kode.includes(HURUF[aksi]);
}
