-- Aturan KONSEP: maksimal satu kartu AKTIF per peserta.
-- Kartu lama yang sudah dinonaktifkan (hilang/rusak) boleh banyak, jadi indeks unik
-- hanya berlaku untuk baris dengan aktif = true ("partial unique index").
-- Prisma belum bisa menuliskan indeks seperti ini di schema.prisma, jadi ditulis langsung di SQL.
CREATE UNIQUE INDEX "kartu_satu_aktif_per_peserta" ON "kartu" ("peserta_id") WHERE "aktif" = true;
