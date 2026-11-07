-- CreateEnum
CREATE TYPE "GolonganDarah" AS ENUM ('A', 'B', 'AB', 'O');

-- CreateEnum
CREATE TYPE "StatusNikah" AS ENUM ('belum_menikah', 'menikah');

-- CreateEnum
CREATE TYPE "JenjangPendidikan" AS ENUM ('sd', 'smp', 'sma', 'smk', 'd3', 'd4', 's1', 's2', 's3', 'lainnya');

-- CreateTable
CREATE TABLE "biodata_peserta" (
    "peserta_id" TEXT NOT NULL,
    "nama_ayah" TEXT,
    "tempat_lahir" TEXT,
    "anak_ke" INTEGER,
    "jumlah_saudara" INTEGER,
    "suku" TEXT,
    "tinggi_cm" INTEGER,
    "berat_kg" INTEGER,
    "golongan_darah" "GolonganDarah",
    "status_nikah" "StatusNikah",
    "pendidikan_jenjang" "JenjangPendidikan",
    "pendidikan_jurusan" TEXT,
    "skill" TEXT,
    "pekerjaan" TEXT,
    "hobi" TEXT,
    "dapukan" TEXT,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biodata_peserta_pkey" PRIMARY KEY ("peserta_id")
);

-- CreateTable
CREATE TABLE "data_kelompok" (
    "wilayah" "Wilayah" NOT NULL,
    "desa" TEXT,
    "daerah" TEXT,
    "kipok" TEXT,
    "tim_pnkb_kelompok" TEXT,
    "tim_pnkb_desa" TEXT,
    "tim_pnkb_daerah" TEXT,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_kelompok_pkey" PRIMARY KEY ("wilayah")
);

-- AddForeignKey
ALTER TABLE "biodata_peserta" ADD CONSTRAINT "biodata_peserta_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
