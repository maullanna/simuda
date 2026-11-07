// Penghubung ke database (Prisma 7 + PostgreSQL).
// "server-only": kalau file ini sampai diimpor oleh komponen client, build langsung gagal,
// supaya kode dan alamat database tidak pernah terkirim ke browser.
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function buatPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi. Tambahkan di file .env (lihat langkah menyiapkan Neon).");
  }
  // Prisma 7 tersambung ke PostgreSQL lewat "driver adapter" (paket pg).
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

// Saat `npm run dev`, file ini dimuat ulang setiap kali kode berubah. Tanpa disimpan di
// globalThis, setiap muat ulang membuka koneksi baru sampai database menolak (terlalu banyak koneksi).
// Tapi setelah `prisma generate` (misalnya habis migrasi), kelas PrismaClient-nya baru: klien lama
// tidak mengenal tabel/kolom baru. Jadi simpanan hanya dipakai kalau kelasnya masih sama;
// kalau berbeda, klien lama ditutup dan diganti, tanpa perlu me-restart `npm run dev`.
const simpanan = globalThis as unknown as { prisma?: PrismaClient; kelasPrisma?: typeof PrismaClient };

if (simpanan.prisma && simpanan.kelasPrisma !== PrismaClient) {
  void simpanan.prisma.$disconnect();
  simpanan.prisma = undefined;
}

export const prisma = simpanan.prisma ?? buatPrisma();

if (process.env.NODE_ENV !== "production") {
  simpanan.prisma = prisma;
  simpanan.kelasPrisma = PrismaClient;
}
