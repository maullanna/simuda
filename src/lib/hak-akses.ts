// Hak akses per fitur dan per tindakan (KONSEP bagian 3). Hak yang berlaku diatur per LEVEL dan
// disimpan di database (tabel level_pengguna), dicentang Administrator di halaman Level pengguna.
// File ini berisi daftar fitur, tindakan yang tersedia per fitur, hak AWAL level bawaan (tabel KONSEP 3.2),
// dan fungsi boleh() yang dipakai requireRole() di server dan sidebar di browser.
// Aman dipakai di browser: tidak berisi rahasia, hanya aturan.

// Level bawaan, urutan sama dengan kolom tabel KONSEP 3.2.
export const KODE_BAWAAN = ["admin", "kyai", "wakil", "ketua", "sekretaris", "bendahara", "pengurus", "petugas_scan"] as const;
export type KodeLevel = (typeof KODE_BAWAAN)[number];

export const NAMA_BAWAAN: Record<KodeLevel, string> = {
  admin: "Administrator",
  kyai: "Kyai",
  wakil: "Wakil",
  ketua: "Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  pengurus: "Pengurus",
  petugas_scan: "Petugas scan",
};

// Sel = hak awal tiap level bawaan: L = lihat, T = tambah, U = ubah, S = suspend & pulihkan, Ya = boleh, – = tidak.
type Sel = [string, string, string, string, string, string, string, string];
type InfoFitur = {
  kelompok: string;
  label: string;
  awal: Sel;
  hanyaAdmin?: true; // tidak bisa dicentang untuk level lain
  selalu?: true; // selalu boleh untuk semua yang masuk (tidak perlu dicentang)
};

export const DAFTAR_FITUR = {
  beranda: { kelompok: "Beranda", label: "Beranda pengurus", awal: ["L", "L", "L", "L", "L", "L", "L", "–"] },
  peserta: { kelompok: "Peserta", label: "Data peserta", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–"] },
  imporPeserta: { kelompok: "Peserta", label: "Impor peserta dari Excel", awal: ["Ya", "–", "Ya", "Ya", "Ya", "–", "–", "–"] },
  kartu: { kelompok: "Peserta", label: "Kartu: cetak, ganti kartu hilang", awal: ["LTS", "L", "LTS", "LTS", "LTS", "–", "–", "–"] },
  biodata: { kelompok: "Peserta", label: "Biodata muda/i (profil untuk Tim PnKB)", awal: ["LU", "–", "–", "–", "–", "–", "–", "–"] },
  daftarHadir: { kelompok: "Absensi", label: "Daftar hadir per sesi", awal: ["L", "L", "L", "L", "L", "L", "L", "L"] },
  bukaTutupSesi: { kelompok: "Absensi", label: "Buka dan tutup sesi", awal: ["Ya", "–", "Ya", "Ya", "Ya", "–", "Ya", "–"] },
  scan: { kelompok: "Absensi", label: "Scan kehadiran", awal: ["Ya", "–", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya"] },
  inputManual: { kelompok: "Absensi", label: "Input manual dan catat izin", awal: ["T", "–", "T", "T", "T", "–", "T", "–"] },
  koreksiKehadiran: { kelompok: "Absensi", label: "Koreksi kehadiran", awal: ["US", "–", "US", "US", "US", "–", "–", "–"] },
  sesi: { kelompok: "Jadwal dan materi", label: "Sesi pengajian", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–"] },
  materi: { kelompok: "Jadwal dan materi", label: "Materi dan lampiran", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–"] },
  pemateri: { kelompok: "Jadwal dan materi", label: "Pemateri", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–"] },
  rekap: { kelompok: "Rekap", label: "Rekap dan grafik kehadiran", awal: ["L", "L", "L", "L", "L", "L", "L", "–"] },
  unduhRekap: { kelompok: "Rekap", label: "Unduh rekap Excel/PDF", awal: ["Ya", "Ya", "Ya", "Ya", "Ya", "–", "–", "–"] },
  perluDihubungi: { kelompok: "Rekap", label: "Perlu dihubungi", awal: ["LU", "L", "LU", "LU", "LU", "–", "LU", "–"] },
  sodaqohMasuk: { kelompok: "Sodaqoh", label: "Pemasukan per pengajian", awal: ["LTUS", "L", "L", "L", "–", "LTUS", "–", "–"] },
  sodaqohKeluar: { kelompok: "Sodaqoh", label: "Pengeluaran (wajib foto nota)", awal: ["LTUS", "L", "L", "L", "–", "LTUS", "–", "–"] },
  riwayatSodaqoh: { kelompok: "Sodaqoh", label: "Riwayat perubahan sodaqoh", awal: ["L", "L", "L", "L", "–", "L", "–", "–"] },
  musyawarah: { kelompok: "Musyawarah", label: "Jadwal, agenda, hasil", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "L", "L", "–"] },
  tindakLanjut: { kelompok: "Musyawarah", label: "Tindak lanjut", awal: ["LTUS", "L", "LTUS", "LTUS", "LTUS", "LU", "LU", "–"] },
  masukan: { kelompok: "Masukan", label: "Masukan peserta", awal: ["LS", "L", "LS", "LS", "L", "–", "–", "–"] },
  pengurus: { kelompok: "Kepengurusan", label: "Data pengurus", awal: ["LTUS", "L", "LTUS", "LTUS", "–", "–", "–", "–"] },
  akunLogin: { kelompok: "Kepengurusan", label: "Akun login: buat, reset, suspend", awal: ["Ya", "–", "Ya", "Ya", "–", "–", "–", "–"] },
  petugasScan: { kelompok: "Kepengurusan", label: "Petugas scan: tunjuk dan cabut", awal: ["Ya", "–", "Ya", "Ya", "–", "–", "–", "–"] },
  dataKelompok: { kelompok: "Kepengurusan", label: "Data kelompok: desa, daerah, Kipok, Tim PnKB", awal: ["LU", "L", "LU", "LU", "L", "–", "–", "–"] },
  akunSaya: { kelompok: "Kepengurusan", label: "Akun saya: ganti kata sandi", awal: ["Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya"], selalu: true },
  riwayat: { kelompok: "Sistem", label: "Riwayat perubahan semua modul", awal: ["L", "L", "L", "L", "–", "–", "–", "–"] },
  levelPengguna: { kelompok: "Sistem", label: "Level pengguna dan hak akses", awal: ["Ya", "–", "–", "–", "–", "–", "–", "–"], hanyaAdmin: true },
  pengaturan: { kelompok: "Sistem", label: "Pengaturan (WhatsApp, notifikasi, backup)", awal: ["Ya", "–", "–", "–", "–", "–", "–", "–"], hanyaAdmin: true },
} satisfies Record<string, InfoFitur>;

export type Fitur = keyof typeof DAFTAR_FITUR;
// "jalankan" untuk fitur bertanda Ya (scan, impor, kelola akun, ...). "hapus" = hapus permanen, hanya Administrator (KONSEP 3.4).
export type Aksi = "lihat" | "tambah" | "ubah" | "suspend" | "jalankan" | "hapus";
export type AksiCentang = Exclude<Aksi, "hapus">;
// Hasil centang satu level: tindakan yang boleh per fitur.
export type HakLevel = Partial<Record<Fitur, AksiCentang[]>>;
// Yang dibutuhkan boleh(): level Administrator (akses penuh) atau daftar hak hasil centang.
export type HakPengguna = { aksesPenuh: boolean; hak: HakLevel };

export const URUTAN_AKSI: AksiCentang[] = ["lihat", "tambah", "ubah", "suspend", "jalankan"];
export const labelAksi: Record<AksiCentang, string> = { lihat: "Lihat", tambah: "Tambah", ubah: "Ubah", suspend: "Suspend", jalankan: "Boleh" };

const info = (f: Fitur): InfoFitur => DAFTAR_FITUR[f];
export const SEMUA_FITUR = Object.keys(DAFTAR_FITUR) as Fitur[];

function bacaSel(sel: string): AksiCentang[] {
  if (sel === "Ya") return ["jalankan"];
  const huruf: Record<string, AksiCentang> = { L: "lihat", T: "tambah", U: "ubah", S: "suspend" };
  return [...sel].flatMap((h) => (huruf[h] ? [huruf[h]] : []));
}

// Tindakan yang bisa dicentang untuk sebuah fitur (dari tabel hak awal).
export function aksiTersedia(fitur: Fitur): AksiCentang[] {
  const ada = new Set(info(fitur).awal.flatMap(bacaSel));
  return URUTAN_AKSI.filter((a) => ada.has(a));
}

// Fitur yang bisa dicentang Administrator untuk level lain.
export function bisaDicentang(fitur: Fitur): boolean {
  return !info(fitur).hanyaAdmin && !info(fitur).selalu;
}

// Hak awal level bawaan (tabel KONSEP 3.2).
export function hakAwal(kode: KodeLevel): HakLevel {
  const i = KODE_BAWAAN.indexOf(kode);
  return Object.fromEntries(
    SEMUA_FITUR.filter(bisaDicentang)
      .map((f) => [f, bacaSel(info(f).awal[i])] as const)
      .filter(([, a]) => a.length > 0),
  );
}

// Rapikan hak dari database/form: hanya fitur dan tindakan yang dikenal dan boleh dicentang.
export function rapikanHak(mentah: unknown): HakLevel {
  if (!mentah || typeof mentah !== "object") return {};
  const hasil: HakLevel = {};
  for (const f of SEMUA_FITUR.filter(bisaDicentang)) {
    const isi = (mentah as Record<string, unknown>)[f];
    if (!Array.isArray(isi)) continue;
    const tersedia = aksiTersedia(f);
    const aksi = tersedia.filter((a) => isi.includes(a));
    if (aksi.length) hasil[f] = aksi;
  }
  return hasil;
}

export function boleh(p: HakPengguna, fitur: Fitur, aksi: Aksi): boolean {
  // Level Administrator selalu boleh semua. Satu-satunya tempat pengecualian ini ditulis.
  if (p.aksesPenuh) return true;
  if (aksi === "hapus" || info(fitur).hanyaAdmin) return false;
  if (info(fitur).selalu) return true;
  const hak = p.hak[fitur] ?? [];
  // Fitur bertanda "Ya" hanya punya satu tindakan: kalau boleh menjalankan, berarti boleh membuka.
  if (aksi === "lihat" && hak.includes("jalankan")) return true;
  return hak.includes(aksi);
}
