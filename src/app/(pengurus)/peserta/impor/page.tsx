import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { ImporPeserta } from "@/components/peserta/ImporPeserta";
import { ambilSemuaPeserta } from "@/lib/data/peserta";
import { boleh } from "@/lib/hak-akses";
import { tanggalHariIniWib } from "@/lib/peserta";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Impor pemuda/i · SIMUDA",
};

// Impor data awal pemuda/i (beserta biodata) dari Excel (KONSEP 5.1 dan 5.1b).
export default async function ImporPesertaPage() {
  // Butuh tanggal hari ini untuk memeriksa tanggal lahir, jadi dibuat saat dibuka.
  const pengguna = await requireRole("imporPeserta", "jalankan");
  await connection();
  const semua = await ambilSemuaPeserta();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/peserta" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Pemuda/i
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Impor dari Excel</h1>
        <p className="text-on-surface-variant">Tambahkan banyak pemuda/i sekaligus, lengkap dengan biodatanya. Setiap baris diperiksa dulu sebelum disimpan.</p>
      </header>
      {/* Daftar nama + tanggal lahir yang sudah ada di database, untuk mendeteksi data ganda */}
      <ImporPeserta
        hariIni={tanggalHariIniWib()}
        sudahAda={semua.map((p) => ({ nama: p.nama, tanggalLahir: p.tanggalLahir }))}
        bolehBiodata={boleh(pengguna, "biodata", "ubah")}
      />
    </div>
  );
}
