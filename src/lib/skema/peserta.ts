// Aturan isian peserta dalam bentuk skema Zod, dipakai Server Action (aturan keamanan no. 2).
// Aturannya sama dengan periksaIsianPeserta() di browser, tapi yang ini tidak bisa dilewati,
// karena berjalan di server.
import { z } from "zod";

export function skemaPeserta(hariIni: string) {
  return z.object({
    nama: z
      .string()
      .trim()
      .min(3, { error: "Nama minimal 3 huruf" })
      .max(100, { error: "Nama terlalu panjang" })
      .transform((s) => s.replace(/\s+/g, " ")),
    jenisKelamin: z.enum(["putra", "putri"], { error: "Pilih putra atau putri" }),
    wilayah: z.enum(["Bendlay 2", "Bendlay 4"], { error: "Pilih wilayah" }),
    tanggalLahir: z.iso
      .date({ error: "Isi tanggal lahir" })
      .refine((t) => t <= hariIni, { error: "Tanggal lahir tidak boleh setelah hari ini" }),
    noHp: z
      .string()
      .transform((s) => s.replace(/[\s-]/g, ""))
      .refine((s) => s === "" || /^(\+62|62|0)8\d{7,11}$/.test(s), { error: "Format no HP belum benar, contoh 081234567890" }),
    status: z.enum(["aktif", "tidak_aktif"], { error: "Pilih status" }).default("aktif"),
  });
}

export type DataPeserta = z.infer<ReturnType<typeof skemaPeserta>>;
