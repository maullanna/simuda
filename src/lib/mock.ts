// Data contoh selama database belum tersambung.
// Nanti semua ini diganti dengan data dari Prisma.

import type { Peserta } from "./peserta";

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
