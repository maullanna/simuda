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
const simpanan = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = simpanan.prisma ?? buatPrisma();

if (process.env.NODE_ENV !== "production") simpanan.prisma = prisma;
