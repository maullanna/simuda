// Membuat akun login untuk seorang pengurus, lalu menghubungkannya ke data pengurus itu.
// Jalankan: npm run akun
//
// Pendaftaran lewat aplikasi sengaja dimatikan (disableSignUp), jadi akun dibuat dari sini.
// Bisa juga tanpa pertanyaan, lewat variabel: AKUN_PENGURUS, AKUN_EMAIL, AKUN_SANDI.

import "dotenv/config";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }) });

// Instans Better Auth khusus skrip ini: sama dengan src/lib/auth.ts (database & cara hash kata sandi),
// bedanya pendaftaran diizinkan karena yang menjalankan skrip ini sudah punya akses ke database.
const authSkrip = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
});

async function main() {
  const tanya = createInterface({ input: stdin, output: stdout });

  let idPengurus = process.env.AKUN_PENGURUS;
  if (!idPengurus) {
    const belumPunya = await prisma.pengurus.findMany({ where: { userId: null, aktif: true }, orderBy: { nama: "asc" } });
    console.log("\nPengurus yang belum punya akun:");
    belumPunya.forEach((p) => console.log(`  ${p.id.padEnd(8)} ${p.nama} (${p.jabatan}, ${p.wilayah})`));
    idPengurus = (await tanya.question("\nKetik id pengurus (contoh g03): ")).trim();
  }
  const pengurus = await prisma.pengurus.findUnique({ where: { id: idPengurus } });
  if (!pengurus) throw new Error(`Pengurus dengan id "${idPengurus}" tidak ditemukan.`);
  if (pengurus.userId) throw new Error(`${pengurus.nama} sudah punya akun.`);

  const email = (process.env.AKUN_EMAIL ?? (await tanya.question("Email: "))).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Format email belum benar.");

  const sandi = process.env.AKUN_SANDI ?? (await tanya.question("Kata sandi (minimal 8 karakter, akan terlihat saat diketik): "));
  tanya.close();
  if (sandi.length < 8) throw new Error("Kata sandi minimal 8 karakter.");

  // Better Auth yang meng-hash kata sandi dan membuat baris user + account.
  const { user } = await authSkrip.api.signUpEmail({ body: { name: pengurus.nama, email, password: sandi } });
  await prisma.pengurus.update({ where: { id: pengurus.id }, data: { userId: user.id } });
  // signUpEmail otomatis membuat sesi login; tidak dipakai, jadi dihapus.
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log(`\nAkun dibuat: ${email} untuk ${pengurus.nama} (${pengurus.jabatan}, peran ${pengurus.peran}).`);
  console.log("Silakan masuk di http://localhost:3000/masuk");
}

main()
  .catch((e) => {
    console.error("\nGagal:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
