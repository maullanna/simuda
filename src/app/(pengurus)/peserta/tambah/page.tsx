import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { FormPeserta } from "@/components/FormPeserta";
import { requireRole } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";

export const metadata: Metadata = {
  title: "Tambah peserta · SIMUDA",
};

export default async function TambahPesertaPage() {
  await requireRole("peserta", "tambah");
  // Halaman ini memakai tanggal hari ini (batas tanggal lahir), jadi harus dibuat
  // saat dibuka, bukan sekali saat build. Tanpa ini tanggalnya membeku di hari build.
  await connection();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/peserta"
          className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={16} /> Peserta
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Tambah peserta</h1>
      </header>
      <FormPeserta hariIni={tanggalHariIniWib()} />
    </div>
  );
}
