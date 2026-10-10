import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormPeserta } from "@/components/FormPeserta";
import { PanelKartu } from "@/components/peserta/PanelKartu";
import { daftarPeserta, kartuContoh } from "@/lib/mock";
import { tanggalHariIniWib } from "@/lib/peserta";

export const metadata: Metadata = {
  title: "Ubah peserta · SIMUDA",
};

// [id] di nama folder berarti bagian URL itu berubah-ubah:
// /peserta/p03/ubah membuka halaman ini dengan id = "p03".
export default async function UbahPesertaPage(props: PageProps<"/peserta/[id]/ubah">) {
  const { id } = await props.params;
  const peserta = daftarPeserta.find((p) => p.id === id);
  if (!peserta) notFound();
  const hariIni = tanggalHariIniWib();
  const kartu = kartuContoh.find((k) => k.pesertaId === peserta.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/peserta"
          className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={16} /> Peserta
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Ubah peserta</h1>
        <p className="text-on-surface-variant">{peserta.nama}</p>
      </header>
      <FormPeserta peserta={peserta} hariIni={hariIni} />
      {/* Hanya peserta aktif yang punya kartu berlaku */}
      {peserta.status === "aktif" && kartu ? (
        <PanelKartu pesertaId={peserta.id} nama={peserta.nama} dibuat={kartu.dibuat} hariIni={hariIni} />
      ) : (
        <p className="max-w-2xl rounded-3xl bg-surface-low p-6 text-sm text-on-surface-variant">
          Peserta tidak aktif, jadi kartunya tidak berlaku untuk absensi. Aktifkan kembali untuk mencetak kartu.
        </p>
      )}
    </div>
  );
}
