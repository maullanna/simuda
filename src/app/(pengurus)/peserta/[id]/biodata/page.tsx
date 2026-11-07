import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormBiodata } from "@/components/peserta/FormBiodata";
import { ambilBiodata } from "@/lib/data/biodata";
import { ambilPeserta } from "@/lib/data/peserta";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Ubah biodata · SIMUDA",
};

// Ubah biodata muda/i (KONSEP 5.1b). Di halaman pengurus hanya Administrator; pemiliknya mengisi sendiri dari halamannya.
export default async function UbahBiodataPage(props: PageProps<"/peserta/[id]/biodata">) {
  await requireRole("biodata", "ubah");
  const { id } = await props.params;
  const peserta = await ambilPeserta(id);
  if (!peserta) notFound();
  const biodata = await ambilBiodata(id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href={`/peserta/${id}`} className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Profil {peserta.nama}
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Ubah biodata</h1>
        <p className="max-w-2xl text-on-surface-variant">
          Untuk Tim PnKB. Semua isian boleh kosong dan bisa dilengkapi bertahap. Data ini hanya terlihat oleh pemiliknya sendiri dan Administrator.
        </p>
      </header>
      <FormBiodata pesertaId={id} jenisKelamin={peserta.jenisKelamin} biodata={biodata} />
    </div>
  );
}
