// Data contoh selama database belum tersambung.
// Nanti semua ini diganti dengan data dari Prisma.

import { formatRupiah } from "./format";
import type { Pengurus } from "./kepengurusan";
import type { Masukan } from "./masukan";
import type { Musyawarah, TindakLanjut } from "./musyawarah";
import type { Peserta } from "./peserta";
import type { RiwayatPerubahan, Transaksi } from "./sodaqoh";
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

const catatanContoh = [
  "Pembahasan berjalan lancar. Peserta aktif bertanya tentang penerapan materi di sekolah dan rumah. Pekan depan dilanjutkan dengan hafalan dalil.",
  "Materi disampaikan dengan contoh sehari-hari. Beberapa peserta minta ringkasan tertulis, sudah dibagikan di grup.",
  "Diskusi kelompok kecil per 5 orang, lalu tiap kelompok menyampaikan kesimpulan. Waktu agak molor 15 menit.",
  "Pemateri memberi tugas membaca satu hadits per hari. Akan dicek di pertemuan berikutnya.",
];

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
  // Riwayat: 20 hari pengajian terakhir (Selasa, Kamis, Sabtu) sebelum hari ini, sekitar 7 pekan.
  const hariPengajian: string[] = [];
  for (let i = 1; hariPengajian.length < 20; i++) {
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
        // Sesi yang sudah lewat punya catatan, kecuali sesi putri terakhir (contoh "belum diisi").
        ...(tanggal !== hariIni &&
          !(i === 1 && jenisKelamin === "putri") && {
            catatan: catatanContoh[(i + (jenisKelamin === "putri" ? 1 : 0)) % catatanContoh.length],
            lampiran:
              i % 3 === 1
                ? [
                    { nama: `foto-pengajian-${tanggal}.jpg`, tipe: "foto" as const },
                    { nama: "ringkasan-materi.pdf", tipe: "pdf" as const },
                  ]
                : i % 3 === 2
                  ? [{ nama: `foto-pengajian-${tanggal}.jpg`, tipe: "foto" as const }]
                  : [],
          }),
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

  // Sesi mendatang: hari pengajian rutin dalam 14 hari ke depan (belum ada kehadiran).
  // Pengajian yang dekat sudah terisi materinya, yang jauh sebagian masih kosong.
  for (let i = 1; i <= 14; i++) {
    const tanggal = geserTanggal(hariIni, i);
    if (![2, 4, 6].includes(hariDalamPekan(tanggal))) continue;
    for (const jenisKelamin of ["putra", "putri"] as const) {
      const r = acakTetap(tanggal + jenisKelamin);
      const terisi = i <= 4 || r < 0.45;
      sesi.push({
        id: `s-${tanggal}-${jenisKelamin}`,
        tanggal,
        jamMulai: "19:30",
        jenisKelamin,
        sasaran: sasaranBergilir[Math.floor(r * sasaranBergilir.length)],
        pemateri: terisi ? (jenisKelamin === "putra" ? (r < 0.5 ? "Ust. Hasan" : "Ust. Mahmud") : "Ustzh. Aminah") : "",
        materi: terisi ? materiContoh[Math.floor(r * materiContoh.length)] : "",
        status: "terjadwal",
      });
    }
  }

  return { sesi, kehadiran };
}

// ---------------------------------------------------------------------------
// Pengurus contoh. Dipakai untuk penghitung sodaqoh, musyawarah, dan kepengurusan.
// peran: kyai / wakil / ketua / sekretaris / bendahara / pengurus (KONSEP bagian 3)

export const daftarPengurus: Pengurus[] = [
  { id: "g01", nama: "KH. Abdullah Faqih", jabatan: "Kyai", wilayah: "Pimpinan", peran: "kyai" },
  { id: "g02", nama: "Ust. Hasan Basri", jabatan: "Wakil", wilayah: "Pimpinan", peran: "wakil" },
  { id: "g03", nama: "Muhammad Iqbal", jabatan: "Ketua", wilayah: "Bendlay 2", peran: "ketua" },
  { id: "g04", nama: "Ahmad Fauzi", jabatan: "Sekretaris", wilayah: "Bendlay 2", peran: "sekretaris" },
  { id: "g05", nama: "Rizal Maulana", jabatan: "Bendahara", wilayah: "Bendlay 2", peran: "bendahara" },
  { id: "g06", nama: "Dewi Lestari", jabatan: "Seksi Acara", wilayah: "Bendlay 2", peran: "pengurus" },
  { id: "g07", nama: "Rahmat Hidayat", jabatan: "Ketua", wilayah: "Bendlay 4", peran: "ketua" },
  { id: "g08", nama: "Nurul Huda", jabatan: "Sekretaris", wilayah: "Bendlay 4", peran: "sekretaris" },
  { id: "g09", nama: "Siti Mariam", jabatan: "Bendahara", wilayah: "Bendlay 4", peran: "bendahara" },
  { id: "g10", nama: "Fajar Nugroho", jabatan: "Seksi Perlengkapan", wilayah: "Bendlay 4", peran: "pengurus" },
];

// ---------------------------------------------------------------------------
// Sodaqoh contoh: saldo awal, infaq setiap hari pengajian, dan beberapa pengeluaran.
// Tanggalnya mengikuti hari pengajian di dataAbsensiContoh supaya cocok satu sama lain.

const keperluanContoh = [
  { keterangan: "Konsumsi pengajian (teh dan snack)", jumlah: 85_000 },
  { keterangan: "Fotokopi ringkasan materi", jumlah: 42_000 },
  { keterangan: "Transport pemateri", jumlah: 150_000 },
  { keterangan: "Air mineral galon", jumlah: 38_000 },
  { keterangan: "Laminating kartu peserta", jumlah: 120_000 },
  { keterangan: "Perbaikan kabel mikrofon", jumlah: 65_000 },
];

export function dataSodaqohContoh(hariIni: string): { transaksi: Transaksi[]; riwayat: RiwayatPerubahan[] } {
  const tanggalPengajian = [
    ...new Set(dataAbsensiContoh(hariIni).sesi.filter((s) => s.status === "selesai").map((s) => s.tanggal)),
  ].sort();
  const bendahara = ["Rizal Maulana", "Siti Mariam"];
  const pendamping = ["Dewi Lestari", "Fajar Nugroho", "Muhammad Iqbal", "Nurul Huda"];

  const transaksi: Transaksi[] = [
    {
      id: "t000",
      tanggal: geserTanggal(tanggalPengajian[0], -1),
      jenis: "pemasukan",
      jumlah: 1_500_000,
      keterangan: "Saldo awal (kas sebelum SIMUDA)",
      penghitung: ["Rizal Maulana", "Siti Mariam"],
      dicatatOleh: "Rizal Maulana",
    },
  ];

  tanggalPengajian.forEach((tanggal, i) => {
    const r = acakTetap(`infaq-${tanggal}`);
    transaksi.push({
      id: `t${String(i + 1).padStart(3, "0")}`,
      tanggal,
      jenis: "pemasukan",
      jumlah: Math.round((90_000 + r * 160_000) / 5_000) * 5_000,
      keterangan: "Infaq pengajian putra & putri",
      penghitung: [bendahara[i % 2], pendamping[i % pendamping.length]],
      dicatatOleh: bendahara[i % 2],
    });
    // Kira-kira setiap 3 hari pengajian ada satu pengeluaran.
    if (i % 3 === 1) {
      const k = keperluanContoh[Math.floor(i / 3) % keperluanContoh.length];
      transaksi.push({
        id: `t${String(i + 1).padStart(3, "0")}k`,
        tanggal,
        jenis: "pengeluaran",
        jumlah: k.jumlah,
        keterangan: k.keterangan,
        bukti: { nama: `nota-${tanggal}.jpg`, tipe: "foto" },
        dicatatOleh: bendahara[i % 2],
      });
    }
  });

  // Dua contoh perubahan yang tercatat di riwayat.
  const diubah1 = transaksi.filter((t) => t.jenis === "pemasukan" && t.id !== "t000")[2]; // salah hitung infaq
  const diubah2 = transaksi.find((t) => t.jenis === "pengeluaran");
  const riwayat: RiwayatPerubahan[] = [];
  if (diubah1) {
    diubah1.diubah = true;
    riwayat.push({
      id: "r1",
      waktu: `${diubah1.tanggal} 21:15`,
      oleh: diubah1.dicatatOleh,
      transaksiId: diubah1.id,
      perubahan: `Jumlah ${formatRupiah(diubah1.jumlah - 10_000)} → ${formatRupiah(diubah1.jumlah)}`,
      alasan: "Salah hitung, ada satu lembar Rp 10.000 terselip di kotak",
    });
  }
  if (diubah2) {
    diubah2.diubah = true;
    riwayat.push({
      id: "r2",
      waktu: `${geserTanggal(diubah2.tanggal, 1)} 08:40`,
      oleh: diubah2.dicatatOleh,
      transaksiId: diubah2.id,
      perubahan: `Keterangan "Konsumsi" → "${diubah2.keterangan}"`,
      alasan: "Keterangan diperjelas sesuai nota",
    });
  }

  return { transaksi, riwayat: riwayat.sort((a, b) => b.waktu.localeCompare(a.waktu)) };
}

// ---------------------------------------------------------------------------
// Kartu peserta contoh: satu token QR per peserta.
// Token ASLI nanti dibuat acak di server dengan crypto.randomBytes(16) (128 bit) dan
// tidak berisi data pribadi (aturan keamanan no. 4). Di sini token dibuat tetap dari id
// hanya supaya data contoh tidak berubah-ubah.
function tokenContoh(id: string): string {
  return [0, 1, 2, 3].map((i) => Math.floor(acakTetap(`${id}-${i}`) * 2 ** 32).toString(16).padStart(8, "0")).join("");
}

// dibuat: tanggal kartu dicetak (contoh: semua dicetak bersamaan saat SIMUDA mulai dipakai).
export const kartuContoh = daftarPeserta.map((p) => ({ token: tokenContoh(p.id), pesertaId: p.id, dibuat: "2026-09-24" }));

// Kontak yang dicetak di belakang kartu ("kartu hilang? hubungi...").
// Masih contoh: siapa dan nomor mana yang dipakai perlu diputuskan pengurus.
export const kontakKartuHilang = [
  { wilayah: "Bendlay 2", nama: "Ahmad Fauzi", noHp: "0812-3456-0001" },
  { wilayah: "Bendlay 4", nama: "Rahmat Hidayat", noHp: "0812-3456-0002" },
];

// ---------------------------------------------------------------------------
// Musyawarah contoh: satu yang akan datang dan tiga yang sudah lewat, beserta tindak lanjutnya.

export function dataMusyawarahContoh(hariIni: string): { musyawarah: Musyawarah[]; tindakLanjut: TindakLanjut[] } {
  const t = (hari: number) => geserTanggal(hariIni, hari);

  const musyawarah: Musyawarah[] = [
    {
      id: "m4",
      tanggal: t(6),
      jam: "20:00",
      lokasi: "Aula masjid Bendlay 2",
      agenda: ["Evaluasi absensi dengan kartu QR", "Persiapan peringatan Maulid", "Pembagian petugas scan bulan depan"],
      hasil: [],
      notulis: "Ahmad Fauzi",
      status: "terjadwal",
    },
    {
      id: "m3",
      tanggal: t(-5),
      jam: "20:00",
      lokasi: "Rumah Ketua Bendlay 4",
      agenda: ["Persiapan go-live SIMUDA", "Pencetakan kartu peserta", "Jadwal pemateri sebulan ke depan"],
      hasil: [
        "SIMUDA mulai dipakai untuk absensi bulan depan, didahului uji coba dua pekan.",
        "Kartu dicetak dan dilaminating sekaligus untuk semua peserta aktif.",
        "Pemateri bergilir antara Ust. Hasan, Ust. Mahmud, dan Ustzh. Aminah.",
      ],
      notulis: "Nurul Huda",
      status: "selesai",
    },
    {
      id: "m2",
      tanggal: t(-33),
      jam: "19:45",
      lokasi: "Aula masjid Bendlay 2",
      agenda: ["Pencatatan sodaqoh yang lebih rapi", "Konsumsi pengajian"],
      hasil: [
        "Setiap pemasukan dihitung oleh dua orang dan dicatat hari itu juga.",
        "Setiap pengeluaran wajib ada nota yang difoto.",
        "Konsumsi cukup teh dan snack ringan, maksimal Rp 100.000 per pengajian.",
      ],
      notulis: "Ahmad Fauzi",
      status: "selesai",
    },
    {
      id: "m1",
      tanggal: t(-61),
      jam: "20:00",
      lokasi: "Rumah Kyai",
      agenda: ["Pendataan ulang muda/i", "Kepengurusan periode baru"],
      hasil: ["Data muda/i dikumpulkan per wilayah oleh sekretaris masing-masing.", "Susunan pengurus periode baru disahkan Kyai."],
      notulis: "Nurul Huda",
      status: "selesai",
    },
  ];

  const tindakLanjut: TindakLanjut[] = [
    { id: "a1", musyawarahId: "m3", tugas: "Uji coba scan kartu di dua pengajian", pic: "Ahmad Fauzi", tenggat: t(7), status: "berjalan" },
    { id: "a2", musyawarahId: "m3", tugas: "Cetak dan laminating kartu semua peserta", pic: "Fajar Nugroho", tenggat: t(3), status: "berjalan" },
    { id: "a3", musyawarahId: "m3", tugas: "Kumpulkan foto peserta yang belum ada", pic: "Nurul Huda", tenggat: t(-1), status: "belum" },
    { id: "a4", musyawarahId: "m3", tugas: "Susun jadwal pemateri sebulan", pic: "Muhammad Iqbal", tenggat: t(10), status: "belum" },
    { id: "a5", musyawarahId: "m2", tugas: "Siapkan buku kas dan kotak infaq baru", pic: "Rizal Maulana", tenggat: t(-26), status: "selesai" },
    { id: "a6", musyawarahId: "m2", tugas: "Sosialisasi aturan nota ke pengurus", pic: "Siti Mariam", tenggat: t(-19), status: "selesai" },
    { id: "a7", musyawarahId: "m2", tugas: "Cari penyedia snack langganan", pic: "Dewi Lestari", tenggat: t(-12), status: "berjalan" },
    { id: "a8", musyawarahId: "m1", tugas: "Rekap data muda/i Bendlay 2", pic: "Ahmad Fauzi", tenggat: t(-47), status: "selesai" },
    { id: "a9", musyawarahId: "m1", tugas: "Rekap data muda/i Bendlay 4", pic: "Nurul Huda", tenggat: t(-47), status: "selesai" },
    { id: "a10", musyawarahId: "m1", tugas: "Umumkan susunan pengurus baru", pic: "Muhammad Iqbal", tenggat: t(-54), status: "selesai" },
  ];

  return { musyawarah, tindakLanjut };
}

// ---------------------------------------------------------------------------
// Masukan contoh dari peserta, sebagian tanpa nama, sebagian terkait sesi tertentu.

const isiMasukanContoh = [
  { isi: "Materi adab menuntut ilmu sangat bermanfaat. Kalau bisa ada ringkasan tertulis yang dibagikan di grup.", anonim: false },
  { isi: "Suara pemateri kadang kurang terdengar di barisan belakang. Mungkin mikrofonnya bisa ditambah satu.", anonim: true },
  { isi: "Senang dengan sesi tanya jawab di akhir. Waktunya kalau bisa ditambah sedikit.", anonim: false },
  { isi: "Pengajian selesai agak malam, untuk yang rumahnya jauh mohon bisa dimulai tepat waktu.", anonim: true },
  { isi: "Usul ada kajian khusus tentang persiapan pernikahan untuk kelompok pra-nikah.", anonim: false },
  { isi: "Absen pakai kartu jadi lebih cepat, tidak perlu antre tanda tangan lagi.", anonim: false },
  { isi: "Kadang saya malu bertanya langsung. Apakah bisa ada kotak pertanyaan tertulis?", anonim: true },
  { isi: "Konsumsinya cukup, tapi mohon disediakan air minum yang lebih banyak saat cuaca panas.", anonim: true },
  { isi: "Terima kasih untuk pengurus yang sudah mengingatkan jadwal lewat grup.", anonim: false },
  { isi: "Materi fiqih thaharah perlu praktik langsung supaya lebih paham.", anonim: false },
  { isi: "Tempat duduk putri agak sempit kalau pesertanya ramai.", anonim: true },
  { isi: "Mohon pemateri tamu sesekali, supaya suasananya lebih segar.", anonim: false },
];

export function dataMasukanContoh(hariIni: string): Masukan[] {
  const sesiSelesai = dataAbsensiContoh(hariIni)
    .sesi.filter((s) => s.status === "selesai")
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const aktif = daftarPeserta.filter((p) => p.status === "aktif");

  return isiMasukanContoh.map((m, i) => {
    const sesi = sesiSelesai[i * 2 + (i % 2)];
    const r = acakTetap(`masukan-${i}`);
    const pengirim = aktif.find((p) => p.jenisKelamin === sesi?.jenisKelamin && acakTetap(p.id + i) > 0.5) ?? aktif[i % aktif.length];
    return {
      id: `k${i + 1}`,
      dibuat: `${sesi ? geserTanggal(sesi.tanggal, 1) : hariIni} ${String(7 + Math.floor(r * 14)).padStart(2, "0")}:${String(Math.floor(r * 60)).padStart(2, "0")}`,
      isi: m.isi,
      pesertaId: m.anonim ? null : pengirim.id,
      // Setiap masukan ketiga bersifat umum, tidak terkait sesi tertentu.
      sesiId: i % 3 === 2 ? null : (sesi?.id ?? null),
    };
  });
}

// Petugas scan saat ini: muda/i yang juga peserta, digilir (KONSEP bagian 3).
export const petugasScanContoh = ["p17", "p03", "p21", "p16"];

// Peserta yang sedang "login" di tampilan HP peserta (data contoh, sebelum ada login OTP).
export const pesertaMasukContoh = "p03";
