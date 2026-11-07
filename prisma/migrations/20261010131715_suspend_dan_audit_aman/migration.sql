-- AlterTable
ALTER TABLE "kehadiran" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "lampiran" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "masukan" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "musyawarah" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "pemateri" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "sodaqoh" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- AlterTable
ALTER TABLE "tindak_lanjut" ADD COLUMN     "alasan_suspend" TEXT,
ADD COLUMN     "disuspend_at" TIMESTAMP(3),
ADD COLUMN     "disuspend_oleh" TEXT;

-- audit_log hanya boleh DITAMBAH (KONSEP 3.4): ubah, hapus, dan kosongkan ditolak database,
-- walaupun ada kode aplikasi yang keliru. (Ditulis manual: Prisma tidak bisa membuat trigger.)
CREATE FUNCTION "audit_log_hanya_tambah"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log tidak boleh diubah atau dihapus';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "audit_log_tolak_ubah_hapus"
BEFORE UPDATE OR DELETE ON "audit_log"
FOR EACH ROW EXECUTE FUNCTION "audit_log_hanya_tambah"();

CREATE TRIGGER "audit_log_tolak_kosongkan"
BEFORE TRUNCATE ON "audit_log"
FOR EACH STATEMENT EXECUTE FUNCTION "audit_log_hanya_tambah"();
