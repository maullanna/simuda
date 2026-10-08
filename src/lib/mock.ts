// Data contoh selama database belum tersambung.
// Nanti semua ini diganti dengan data dari Prisma.

import type { Peserta } from "./peserta";
import {
  geserTanggal,
  hariDalamPekan,
  pesertaSasaran,
  type Kehadiran,
  type Sasaran,
  type Sesi,
} from "./sesi";

export const penggunaAktif = {
  nama: "Ahmad Fauzi",
  jabatan: "Sekretaris",
  wilayah: "Bendlay 2",
};

export const daftarPeserta: Peserta[] = [
  { id: "p01", nama: "Muhammad Rizki Pratama", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2009-03-14", noHp: "081234560101", status: "aktif", tanggalBergabung: "2024-07-01" },
  { id: "p02", nama: "Ahmad Fauzan Hakim", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2004-11-02", noHp: "081234560102", status: "aktif", tanggalBergabung: "2022-01-10" },
  { id: "p03", nama: "Siti Nur Aisyah", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2008-06-21", noHp: "081234560103", status: "aktif", tanggalBergabung: "2023-08-15" },
  { id: "p04", nama: "Fatimah Azzahra", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2003-01-30", noHp: "081234560104", status: "aktif", tanggalBergabung: "2021-05-02" },
  { id: "p05", nama: "Dimas Arya Saputra", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2007-10-20", noHp: "081234560105", status: "aktif", tanggalBergabung: "2023-02-11" },
  { id: "p06", nama: "Nabila Khairunnisa", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2010-04-08", noHp: "081234560106", status: "aktif", tanggalBergabung: "2025-01-05" },
  { id: "p07", nama: "Yusuf Maulana Ibrahim", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2002-08-17", noHp: "081234560107", status: "aktif", tanggalBergabung: "2020-09-20" },
  { id: "p08", nama: "Aulia Rahmawati", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2006-12-12", noHp: "081234560108", status: "aktif", tanggalBergabung: "2022-11-30" },
  { id: "p09", nama: "Hafidz Al Farisi", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2011-02-25", noHp: "081234560109", status: "aktif", tanggalBergabung: "2025-07-14" },
  { id: "p10", nama: "Zahra Putri Ramadhani", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2005-09-09", noHp: "081234560110", status: "aktif", tanggalBergabung: "2021-03-21" },
  { id: "p11", nama: "Ilham Nur Hidayat", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2008-01-19", noHp: "081234560111", status: "aktif", tanggalBergabung: "2024-01-08" },
  { id: "p12", nama: "Khadijah Salsabila", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2009-07-03", noHp: "081234560112", status: "aktif", tanggalBergabung: "2024-07-01" },
  { id: "p13", nama: "Rafi Akbar Maulana", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2001-05-27", noHp: "081234560113", status: "tidak_aktif", tanggalBergabung: "2019-06-10" },
  { id: "p14", nama: "Annisa Fitriani", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2004-03-03", noHp: "081234560114", status: "aktif", tanggalBergabung: "2020-12-01" },
  { id: "p15", nama: "Bagas Wicaksono", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2010-10-11", noHp: "081234560115", status: "aktif", tanggalBergabung: "2025-02-17" },
  { id: "p16", nama: "Laila Maghfiroh", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2007-02-14", noHp: "081234560116", status: "aktif", tanggalBergabung: "2022-06-25" },
  { id: "p17", nama: "Fikri Haikal", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2006-07-07", noHp: "081234560117", status: "aktif", tanggalBergabung: "2022-04-04" },
  { id: "p18", nama: "Salma Hanifah", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2002-12-24", noHp: "081234560118", status: "tidak_aktif", tanggalBergabung: "2019-01-15" },
  { id: "p19", nama: "Naufal Abdillah", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2005-04-16", noHp: "081234560119", status: "aktif", tanggalBergabung: "2021-10-09" },
  { id: "p20", nama: "Rania Azizah", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2011-08-29", noHp: "081234560120", status: "aktif", tanggalBergabung: "2025-08-03" },
  { id: "p21", nama: "Arkan Syahputra", jenisKelamin: "putra", wilayah: "Bendlay 2", tanggalLahir: "2003-09-30", noHp: "081234560121", status: "aktif", tanggalBergabung: "2020-02-29" },
  { id: "p22", nama: "Hana Mufidah", jenisKelamin: "putri", wilayah: "Bendlay 2", tanggalLahir: "2009-11-11", noHp: "081234560122", status: "aktif", tanggalBergabung: "2024-09-12" },
  { id: "p23", nama: "Zaki Ramadhan", jenisKelamin: "putra", wilayah: "Bendlay 4", tanggalLahir: "2008-09-01", noHp: "081234560123", status: "aktif", tanggalBergabung: "2023-12-18" },
  { id: "p24", nama: "Intan Permatasari", jenisKelamin: "putri", wilayah: "Bendlay 4", tanggalLahir: "2004-06-06", noHp: "081234560124", status: "aktif", tanggalBergabung: "2021-07-07" },
];

// ---------------------------------------------------------------------------
// Sesi pengajian dan kehadiran contoh.
// Tanggalnya dibuat relatif terhadap hari ini, supaya halaman Absensi
// selalu punya sesi yang sedang berlangsung dan riwayat sebelumnya.

const materiContoh = [
  "Adab menuntut ilmu",
  "Tafsir Surat Al-Fatihah",
  "Fiqih thaharah",
  "Akhlak kepada orang tua",
  "Hadits Arbain no. 1: niat",
  "Sirah: masa kecil Rasulullah",
  "Fiqih shalat berjamaah",
  "Menjaga lisan",
  "Tafsir Surat Al-Ashr",
  "Persiapan menuju pernikahan",
];

const sasaranBergilir: Sasaran[] = ["gabungan", "remaja", "pra-nikah", "gabungan"];

// Angka acak yang selalu sama untuk teks yang sama, supaya data contoh
// tidak berubah-ubah setiap halaman dimuat ulang.
function acakTetap(teks: string): number {
  // Hash FNV-1a, lalu diaduk sekali lagi (fmix32) supaya teks yang hanya
  // beda satu huruf (p01, p02) tetap menghasilkan angka yang berjauhan.
  let h = 2166136261;
  for (const c of teks) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function jam(menitSetelah1915: number): string {
  const total = 19 * 60 + 15 + menitSetelah1915;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function dataAbsensiContoh(hariIni: string): { sesi: Sesi[]; kehadiran: Kehadiran[] } {
  // Riwayat: 4 hari pengajian terakhir (Selasa, Kamis, Sabtu) sebelum hari ini.
  const hariPengajian: string[] = [];
  for (let i = 1; hariPengajian.length < 4; i++) {
    const t = geserTanggal(hariIni, -i);
    if ([2, 4, 6].includes(hariDalamPekan(t))) hariPengajian.push(t);
  }

  const sesi: Sesi[] = [];
  const kehadiran: Kehadiran[] = [];

  const semuaTanggal = [hariIni, ...hariPengajian];
  semuaTanggal.forEach((tanggal, i) => {
    for (const jenisKelamin of ["putra", "putri"] as const) {
      sesi.push({
        id: `s-${tanggal}-${jenisKelamin}`,
        tanggal,
        jamMulai: "19:30",
        jenisKelamin,
        sasaran: sasaranBergilir[i % sasaranBergilir.length],
        pemateri: jenisKelamin === "putra" ? (i % 2 ? "Ust. Mahmud" : "Ust. Hasan") : "Ustzh. Aminah",
        materi: materiContoh[(i * 2 + (jenisKelamin === "putri" ? 1 : 0)) % materiContoh.length],
        status: tanggal === hariIni ? "berlangsung" : "selesai",
      });
    }
  });

  for (const s of sesi) {
    const sesiHariIni = s.tanggal === hariIni;
    for (const p of pesertaSasaran(s, daftarPeserta)) {
      const r = acakTetap(s.id + p.id);
      const dasar = { sesiId: s.id, pesertaId: p.id, dicatatOleh: penggunaAktif.nama };

      if (r < 0.1) {
        kehadiran.push({ ...dasar, status: "izin", metode: "izin", keterangan: r < 0.05 ? "Sakit" : "Acara keluarga", waktu: "16:10" });
      } else if (r < (sesiHariIni ? 0.6 : 0.85)) {
        kehadiran.push({ ...dasar, status: "hadir", metode: r < 0.15 ? "manual" : "qr", waktu: jam(Math.floor(r * 25)) });
      } else if (!sesiHariIni) {
        // Sesi yang sudah ditutup: yang tidak hadir dan tidak izin tercatat alpa.
        kehadiran.push({ ...dasar, status: "alpa", metode: "manual", waktu: "21:00" });
      }
      // Sesi hari ini: sisanya "belum" (belum discan), tidak ada catatan.
    }
  }

  return { sesi, kehadiran };
}
