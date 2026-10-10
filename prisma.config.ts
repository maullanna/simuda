// Konfigurasi Prisma 7. File ini dibaca oleh perintah `npx prisma ...`.
// Prisma 7 tidak lagi membaca .env sendiri, jadi dotenv dimuat di baris pertama.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Alamat database diambil dari file .env, tidak pernah ditulis di kode.
  // Migrasi memakai koneksi langsung (DIRECT_URL); aplikasi memakai DATABASE_URL (pooled) di src/lib/db.ts.
  // Sengaja tidak memakai env() dari prisma/config: env() menolak kalau .env belum ada,
  // padahal `prisma generate` tetap perlu bisa jalan sebelum database disiapkan.
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
