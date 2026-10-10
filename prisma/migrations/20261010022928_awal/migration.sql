-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('putra', 'putri');

-- CreateEnum
CREATE TYPE "Wilayah" AS ENUM ('bendlay_2', 'bendlay_4');

-- CreateEnum
CREATE TYPE "WilayahPengurus" AS ENUM ('pimpinan', 'bendlay_2', 'bendlay_4');

-- CreateEnum
CREATE TYPE "StatusPeserta" AS ENUM ('aktif', 'tidak_aktif');

-- CreateEnum
CREATE TYPE "Sasaran" AS ENUM ('remaja', 'pra_nikah', 'gabungan');

-- CreateEnum
CREATE TYPE "StatusSesi" AS ENUM ('terjadwal', 'berlangsung', 'selesai', 'batal');

-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('hadir', 'izin', 'alpa');

-- CreateEnum
CREATE TYPE "MetodeKehadiran" AS ENUM ('qr', 'manual', 'izin');

-- CreateEnum
CREATE TYPE "TipeLampiran" AS ENUM ('foto', 'pdf');

-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('kyai', 'wakil', 'ketua', 'sekretaris', 'bendahara', 'pengurus', 'petugas_scan');

-- CreateEnum
CREATE TYPE "JenisSodaqoh" AS ENUM ('pemasukan', 'pengeluaran');

-- CreateEnum
CREATE TYPE "StatusMusyawarah" AS ENUM ('terjadwal', 'selesai');

-- CreateEnum
CREATE TYPE "StatusTindakLanjut" AS ENUM ('belum', 'berjalan', 'selesai');

-- CreateTable
CREATE TABLE "peserta" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "wilayah" "Wilayah" NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "no_hp" TEXT,
    "foto_url" TEXT,
    "status" "StatusPeserta" NOT NULL DEFAULT 'aktif',
    "tanggal_bergabung" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kartu" (
    "id" TEXT NOT NULL,
    "peserta_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "alasan_nonaktif" TEXT,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dinonaktifkan_at" TIMESTAMP(3),

    CONSTRAINT "kartu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemateri" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "pemateri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesi_pengajian" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "sasaran" "Sasaran" NOT NULL,
    "pemateri_id" TEXT,
    "materi" TEXT,
    "catatan" TEXT,
    "status" "StatusSesi" NOT NULL DEFAULT 'terjadwal',
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesi_pengajian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kehadiran" (
    "id" TEXT NOT NULL,
    "sesi_id" TEXT NOT NULL,
    "peserta_id" TEXT NOT NULL,
    "status" "StatusKehadiran" NOT NULL,
    "metode" "MetodeKehadiran" NOT NULL,
    "keterangan" TEXT,
    "dicatat_oleh" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kehadiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lampiran" (
    "id" TEXT NOT NULL,
    "sesi_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nama_file" TEXT NOT NULL,
    "tipe" "TipeLampiran" NOT NULL,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lampiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengurus" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "peserta_id" TEXT,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "wilayah" "WilayahPengurus" NOT NULL,
    "peran" "Peran" NOT NULL,
    "no_hp" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengurus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sodaqoh" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "sesi_id" TEXT,
    "jenis" "JenisSodaqoh" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "penghitung_1_id" TEXT,
    "penghitung_2_id" TEXT,
    "bukti_url" TEXT,
    "dicatat_oleh" TEXT NOT NULL,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubah_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sodaqoh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tabel" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "data_lama" JSONB,
    "data_baru" JSONB,
    "alasan" TEXT,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musyawarah" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "agenda" TEXT[],
    "hasil" TEXT[],
    "notulis_id" TEXT,
    "status" "StatusMusyawarah" NOT NULL DEFAULT 'terjadwal',
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "musyawarah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tindak_lanjut" (
    "id" TEXT NOT NULL,
    "musyawarah_id" TEXT NOT NULL,
    "tugas" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "tenggat" DATE NOT NULL,
    "status" "StatusTindakLanjut" NOT NULL DEFAULT 'belum',

    CONSTRAINT "tindak_lanjut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masukan" (
    "id" TEXT NOT NULL,
    "sesi_id" TEXT,
    "peserta_id" TEXT,
    "isi" TEXT NOT NULL,
    "dibuat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "masukan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi_log" (
    "id" TEXT NOT NULL,
    "penerima" TEXT NOT NULL,
    "kanal" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dikirim_at" TIMESTAMP(3),

    CONSTRAINT "notifikasi_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "peserta_user_id_key" ON "peserta"("user_id");

-- CreateIndex
CREATE INDEX "peserta_status_jenis_kelamin_idx" ON "peserta"("status", "jenis_kelamin");

-- CreateIndex
CREATE UNIQUE INDEX "kartu_token_key" ON "kartu"("token");

-- CreateIndex
CREATE INDEX "kartu_peserta_id_aktif_idx" ON "kartu"("peserta_id", "aktif");

-- CreateIndex
CREATE INDEX "sesi_pengajian_tanggal_idx" ON "sesi_pengajian"("tanggal");

-- CreateIndex
CREATE INDEX "kehadiran_peserta_id_idx" ON "kehadiran"("peserta_id");

-- CreateIndex
CREATE UNIQUE INDEX "kehadiran_sesi_id_peserta_id_key" ON "kehadiran"("sesi_id", "peserta_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengurus_user_id_key" ON "pengurus"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengurus_peserta_id_key" ON "pengurus"("peserta_id");

-- CreateIndex
CREATE INDEX "sodaqoh_tanggal_idx" ON "sodaqoh"("tanggal");

-- CreateIndex
CREATE INDEX "audit_log_tabel_record_id_idx" ON "audit_log"("tabel", "record_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");

-- AddForeignKey
ALTER TABLE "kartu" ADD CONSTRAINT "kartu_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi_pengajian" ADD CONSTRAINT "sesi_pengajian_pemateri_id_fkey" FOREIGN KEY ("pemateri_id") REFERENCES "pemateri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kehadiran" ADD CONSTRAINT "kehadiran_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi_pengajian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kehadiran" ADD CONSTRAINT "kehadiran_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi_pengajian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengurus" ADD CONSTRAINT "pengurus_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sodaqoh" ADD CONSTRAINT "sodaqoh_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi_pengajian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sodaqoh" ADD CONSTRAINT "sodaqoh_penghitung_1_id_fkey" FOREIGN KEY ("penghitung_1_id") REFERENCES "pengurus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sodaqoh" ADD CONSTRAINT "sodaqoh_penghitung_2_id_fkey" FOREIGN KEY ("penghitung_2_id") REFERENCES "pengurus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musyawarah" ADD CONSTRAINT "musyawarah_notulis_id_fkey" FOREIGN KEY ("notulis_id") REFERENCES "pengurus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_musyawarah_id_fkey" FOREIGN KEY ("musyawarah_id") REFERENCES "musyawarah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "pengurus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masukan" ADD CONSTRAINT "masukan_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi_pengajian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masukan" ADD CONSTRAINT "masukan_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
