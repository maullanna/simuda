// Aturan isian kepengurusan dan akun login, dipakai Server Action (aturan keamanan no. 2).
import { z } from "zod";

export const skemaPengurus = z.object({
  nama: z.string().trim().min(3, { error: "Nama minimal 3 huruf" }).max(100, { error: "Nama terlalu panjang" }),
  jabatan: z.string().trim().min(3, { error: "Isi jabatan, contoh: Seksi Acara" }).max(60, { error: "Jabatan terlalu panjang" }),
  wilayah: z.enum(["Pimpinan", "Bendlay 2", "Bendlay 4"], { error: "Pilih wilayah" }),
  // Admin dan petugas scan sengaja tidak bisa dipilih dari form ini.
  peran: z.enum(["kyai", "wakil", "ketua", "sekretaris", "bendahara", "pengurus"], { error: "Pilih peran di sistem" }),
});

export const skemaKataSandi = z
  .string()
  .min(8, { error: "Kata sandi minimal 8 karakter" })
  .max(128, { error: "Kata sandi terlalu panjang" });

export const skemaAkunBaru = z.object({
  // Rapikan dulu (spasi, huruf besar), baru periksa formatnya.
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Format email belum benar" })),
  kataSandi: skemaKataSandi,
});
