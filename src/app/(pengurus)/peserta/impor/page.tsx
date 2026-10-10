import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { ImporPeserta } from "@/components/peserta/ImporPeserta";
import { daftarPeserta } from "@/lib/mock";
import { tanggalHariIniWib } from "@/lib/peserta";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Impor peserta · SIMUDA",
};

// Impor data awal peserta dari Excel (KONSEP 5.1).
export default async function ImporPesertaPage() {
  // Butuh tanggal hari ini untuk memeriksa tanggal lahir, jadi dibuat saat dibuka.
  await requireRole("imporPeserta", "jalankan");
  await connection();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/peserta" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Peserta
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Impor dari Excel</h1>
        <p className="text-on-surface-variant">Tambahkan banyak peserta sekaligus. Setiap baris diperiksa dulu sebelum diimpor.</p>
      </header>
      {/* Daftar nama + tanggal lahir yang sudah ada, untuk mendeteksi peserta ganda */}
      <ImporPeserta
        hariIni={tanggalHariIniWib()}
        sudahAda={daftarPeserta.map((p) => ({ nama: p.nama, tanggalLahir: p.tanggalLahir }))}
      />
    </div>
  );
}
