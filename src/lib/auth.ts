// Konfigurasi login (Better Auth) di sisi server.
// Kunci rahasia dibaca otomatis dari BETTER_AUTH_SECRET dan alamat aplikasi dari BETTER_AUTH_URL (.env).
import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

// Di Vercel, setiap deploy juga punya alamat sendiri (misalnya simuda-git-xxx.vercel.app).
// Alamat itu ditambahkan sebagai asal yang dipercaya supaya login tetap bisa di alamat pratinjau.
// Alamat utama tetap BETTER_AUTH_URL.
const alamatVercel = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map((h) => `https://${h}`);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: alamatVercel,
  emailAndPassword: {
    enabled: true,
    // Tidak ada pendaftaran mandiri: akun pengurus dibuat oleh Wakil/Ketua (KONSEP bagian 3).
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // tetap masuk selama 30 hari
    updateAge: 60 * 60 * 24, // masa berlaku diperpanjang paling sering sekali sehari
  },
  databaseHooks: {
    session: {
      create: {
        // Akun pengurus yang aksesnya dicabut tidak boleh mendapat sesi baru (tidak bisa masuk).
        before: async (sesi) => {
          const pengurus = await prisma.pengurus.findUnique({ where: { userId: sesi.userId }, select: { aktif: true } });
          if (pengurus && !pengurus.aktif) throw new APIError("FORBIDDEN", { message: "Akses akun ini sedang dicabut", code: "AKSES_DICABUT" });
        },
      },
    },
  },
  // nextCookies: supaya cookie login ikut terpasang saat login dipanggil dari Server Action.
  plugins: [nextCookies()],
});
