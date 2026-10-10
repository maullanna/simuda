// Konfigurasi login (Better Auth) di sisi server.
// Kunci rahasia dibaca otomatis dari BETTER_AUTH_SECRET dan alamat aplikasi dari BETTER_AUTH_URL (.env).
import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
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
