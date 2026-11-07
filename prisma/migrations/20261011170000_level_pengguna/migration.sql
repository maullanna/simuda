-- Level pengguna (KONSEP 3.1). Ditulis manual supaya urutannya aman:
-- buat tabel -> isi level bawaan -> isi level_id dari peran lama -> baru hapus kolom peran.

-- CreateTable
CREATE TABLE "level_pengguna" (
    "id" TEXT NOT NULL,
    "kode" TEXT,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "hak" JSONB NOT NULL DEFAULT '{}',
    "akses_penuh" BOOLEAN NOT NULL DEFAULT false,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "level_pengguna_kode_key" ON "level_pengguna"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "level_pengguna_nama_key" ON "level_pengguna"("nama");

-- Level bawaan dengan hak awal sesuai tabel KONSEP 3.2 (dibuat dari src/lib/hak-akses.ts).
INSERT INTO "level_pengguna" ("id", "kode", "nama", "hak", "akses_penuh", "diubah_at") VALUES
  ('lvl_admin', 'admin', 'Administrator', '{}'::jsonb, true, CURRENT_TIMESTAMP),
  ('lvl_kyai', 'kyai', 'Kyai', '{"beranda":["lihat"],"peserta":["lihat"],"kartu":["lihat"],"daftarHadir":["lihat"],"sesi":["lihat"],"materi":["lihat"],"pemateri":["lihat"],"rekap":["lihat"],"unduhRekap":["jalankan"],"perluDihubungi":["lihat"],"sodaqohMasuk":["lihat"],"sodaqohKeluar":["lihat"],"riwayatSodaqoh":["lihat"],"musyawarah":["lihat"],"tindakLanjut":["lihat"],"masukan":["lihat"],"pengurus":["lihat"],"dataKelompok":["lihat"],"riwayat":["lihat"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_wakil', 'wakil', 'Wakil', '{"beranda":["lihat"],"peserta":["lihat","tambah","ubah","suspend"],"imporPeserta":["jalankan"],"kartu":["lihat","tambah","suspend"],"daftarHadir":["lihat"],"bukaTutupSesi":["jalankan"],"scan":["jalankan"],"inputManual":["tambah"],"koreksiKehadiran":["ubah","suspend"],"sesi":["lihat","tambah","ubah","suspend"],"materi":["lihat","tambah","ubah","suspend"],"pemateri":["lihat","tambah","ubah","suspend"],"rekap":["lihat"],"unduhRekap":["jalankan"],"perluDihubungi":["lihat","ubah"],"sodaqohMasuk":["lihat"],"sodaqohKeluar":["lihat"],"riwayatSodaqoh":["lihat"],"musyawarah":["lihat","tambah","ubah","suspend"],"tindakLanjut":["lihat","tambah","ubah","suspend"],"masukan":["lihat","suspend"],"pengurus":["lihat","tambah","ubah","suspend"],"akunLogin":["jalankan"],"petugasScan":["jalankan"],"dataKelompok":["lihat","ubah"],"riwayat":["lihat"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_ketua', 'ketua', 'Ketua', '{"beranda":["lihat"],"peserta":["lihat","tambah","ubah","suspend"],"imporPeserta":["jalankan"],"kartu":["lihat","tambah","suspend"],"daftarHadir":["lihat"],"bukaTutupSesi":["jalankan"],"scan":["jalankan"],"inputManual":["tambah"],"koreksiKehadiran":["ubah","suspend"],"sesi":["lihat","tambah","ubah","suspend"],"materi":["lihat","tambah","ubah","suspend"],"pemateri":["lihat","tambah","ubah","suspend"],"rekap":["lihat"],"unduhRekap":["jalankan"],"perluDihubungi":["lihat","ubah"],"sodaqohMasuk":["lihat"],"sodaqohKeluar":["lihat"],"riwayatSodaqoh":["lihat"],"musyawarah":["lihat","tambah","ubah","suspend"],"tindakLanjut":["lihat","tambah","ubah","suspend"],"masukan":["lihat","suspend"],"pengurus":["lihat","tambah","ubah","suspend"],"akunLogin":["jalankan"],"petugasScan":["jalankan"],"dataKelompok":["lihat","ubah"],"riwayat":["lihat"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_sekretaris', 'sekretaris', 'Sekretaris', '{"beranda":["lihat"],"peserta":["lihat","tambah","ubah","suspend"],"imporPeserta":["jalankan"],"kartu":["lihat","tambah","suspend"],"daftarHadir":["lihat"],"bukaTutupSesi":["jalankan"],"scan":["jalankan"],"inputManual":["tambah"],"koreksiKehadiran":["ubah","suspend"],"sesi":["lihat","tambah","ubah","suspend"],"materi":["lihat","tambah","ubah","suspend"],"pemateri":["lihat","tambah","ubah","suspend"],"rekap":["lihat"],"unduhRekap":["jalankan"],"perluDihubungi":["lihat","ubah"],"musyawarah":["lihat","tambah","ubah","suspend"],"tindakLanjut":["lihat","tambah","ubah","suspend"],"masukan":["lihat"],"dataKelompok":["lihat"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_bendahara', 'bendahara', 'Bendahara', '{"beranda":["lihat"],"peserta":["lihat"],"daftarHadir":["lihat"],"scan":["jalankan"],"sesi":["lihat"],"materi":["lihat"],"pemateri":["lihat"],"rekap":["lihat"],"sodaqohMasuk":["lihat","tambah","ubah","suspend"],"sodaqohKeluar":["lihat","tambah","ubah","suspend"],"riwayatSodaqoh":["lihat"],"musyawarah":["lihat"],"tindakLanjut":["lihat","ubah"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_pengurus', 'pengurus', 'Pengurus', '{"beranda":["lihat"],"peserta":["lihat"],"daftarHadir":["lihat"],"bukaTutupSesi":["jalankan"],"scan":["jalankan"],"inputManual":["tambah"],"sesi":["lihat"],"materi":["lihat"],"pemateri":["lihat"],"rekap":["lihat"],"perluDihubungi":["lihat","ubah"],"musyawarah":["lihat"],"tindakLanjut":["lihat","ubah"]}'::jsonb, false, CURRENT_TIMESTAMP),
  ('lvl_petugas_scan', 'petugas_scan', 'Petugas scan', '{"daftarHadir":["lihat"],"scan":["jalankan"]}'::jsonb, false, CURRENT_TIMESTAMP);

-- Pengurus: pindahkan peran lama ke level yang sama.
ALTER TABLE "pengurus" ADD COLUMN "level_id" TEXT;
UPDATE "pengurus" SET "level_id" = 'lvl_' || "peran"::text;
ALTER TABLE "pengurus" ALTER COLUMN "level_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "pengurus" ADD CONSTRAINT "pengurus_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level_pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Kolom dan tipe peran lama tidak dipakai lagi.
ALTER TABLE "pengurus" DROP COLUMN "peran";
DROP TYPE "Peran";
