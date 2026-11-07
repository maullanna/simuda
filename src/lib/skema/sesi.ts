// Aturan isian sesi pengajian dan catatan, dipakai Server Action (aturan keamanan no. 2).
// Sama dengan periksaIsianSesi() di browser, tapi yang ini tidak bisa dilewati.
import { z } from "zod";
import { PANJANG_CATATAN } from "@/lib/sesi";

// baru = tambah sesi (tanggal & putra/putri wajib, materi boleh menyusul).
// Bukan baru = isi/ubah materi sesi yang ada (materi & pemateri wajib).
export function skemaSesi(hariIni: string, baru: boolean) {
  const wajibSaatUbah = (maks: number, pesanKosong: string, pesanPanjang: string) =>
    z
      .string()
      .trim()
      .max(maks, { error: pesanPanjang })
      .refine((s) => baru || s.length > 0, { error: pesanKosong });

  return z.object({
    tanggal: baru
      ? z.iso.date({ error: "Pilih tanggal" }).refine((t) => t >= hariIni, { error: "Tanggal tidak boleh sebelum hari ini" })
      : z.string().optional(),
    jenisKelamin: baru ? z.enum(["putra", "putri"], { error: "Pilih putra atau putri" }) : z.string().optional(),
    jamMulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Isi jam mulai" }),
    sasaran: z.enum(["pra-remaja", "remaja", "pra-nikah", "gabungan"], { error: "Pilih sasaran" }),
    materi: wajibSaatUbah(150, "Isi judul materi", "Judul materi terlalu panjang (maks. 150 huruf)"),
    pemateri: wajibSaatUbah(80, "Isi nama pemateri", "Nama pemateri terlalu panjang"),
  });
}

export const skemaCatatan = z
  .string()
  .trim()
  .min(PANJANG_CATATAN.min, { error: `Catatan minimal ${PANJANG_CATATAN.min} huruf` })
  .max(PANJANG_CATATAN.maks, { error: `Catatan maksimal ${PANJANG_CATATAN.maks} huruf` });

export const skemaAlasan = z.string().trim().min(5, { error: "Tulis alasan minimal 5 karakter" }).max(300, { error: "Alasan terlalu panjang" });
