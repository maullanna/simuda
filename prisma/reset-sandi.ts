// Mengganti kata sandi sebuah akun dari terminal, untuk keadaan darurat (misalnya Administrator lupa kata sandi).
// Jalankan: npm run reset-sandi
// Bisa juga tanpa pertanyaan, lewat variabel: RESET_EMAIL, RESET_SANDI.
//
// Hanya bisa dijalankan oleh yang memegang .env (akses database). Pengurus lain cukup direset
// dari halaman Kepengurusan oleh Wakil/Ketua/Administrator.

import "dotenv/config";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }) });

// Sama dengan src/lib/auth.ts (database & cara hash kata sandi).
const authSkrip = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
});

async function main() {
  const tanya = createInterface({ input: stdin, output: stdout });

  const email = (process.env.RESET_EMAIL ?? (await tanya.question("Email akun: "))).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, include: { pengurus: true } });
  if (!user) throw new Error(`Akun dengan email ${email} tidak ditemukan.`);

  const sandi = process.env.RESET_SANDI ?? (await tanya.question("Kata sandi baru (minimal 8 karakter, akan terlihat saat diketik): "));
  tanya.close();
  if (sandi.length < 8) throw new Error("Kata sandi minimal 8 karakter.");
  if (sandi.length > 128) throw new Error("Kata sandi terlalu panjang.");

  const ctx = await authSkrip.$context;
  await ctx.internalAdapter.updatePassword(user.id, await ctx.password.hash(sandi));
  // Semua perangkat yang masih masuk dengan kata sandi lama dikeluarkan.
  await ctx.internalAdapter.deleteUserSessions(user.id);
  await prisma.auditLog.create({
    data: { userId: user.id, tabel: "user", recordId: user.id, aksi: "ubah", alasan: "Reset kata sandi lewat skrip (npm run reset-sandi)" },
  });

  console.log(`\nKata sandi ${email}${user.pengurus ? ` (${user.pengurus.nama}, ${user.pengurus.jabatan})` : ""} sudah diganti.`);
  console.log("Semua sesi lama dikeluarkan. Silakan masuk lagi di http://localhost:3000/masuk");
}

main()
  .catch((e) => {
    console.error("\nGagal:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
