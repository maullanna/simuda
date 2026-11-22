import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormPeserta } from "@/components/FormPeserta";
import { PanelKartu } from "@/components/peserta/PanelKartu";
import { ambilBiodata } from "@/lib/data/biodata";
import { ambilKartuAktif, ambilPeserta, keTeksTanggal } from "@/lib/data/peserta";
import { boleh } from "@/lib/hak-akses";
import { requireRole } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";

export const metadata: Metadata = {
  title: "Ubah pemuda/i · SIMUDA",
};

// [id] di nama folder berarti bagian URL itu berubah-ubah:
// /peserta/p03/ubah membuka halaman ini dengan id = "p03".
export default async function UbahPesertaPage(props: PageProps<"/peserta/[id]/ubah">) {
  const pengguna = await requireRole("peserta", "ubah");
  const { id } = await props.params;
  const peserta = await ambilPeserta(id);
  if (!peserta) notFound();
  const hariIni = tanggalHariIniWib();
  const bolehBiodata = boleh(pengguna, "biodata", "ubah");
  // Biodata sensitif hanya dimuat untuk yang berhak (KONSEP 5.1b).
  const [kartu, biodata] = await Promise.all([ambilKartuAktif(peserta.id), bolehBiodata ? ambilBiodata(peserta.id) : undefined]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/peserta"
          className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={16} /> Pemuda/i
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Ubah peserta</h1>
        <p className="text-on-surface-variant">{peserta.nama}</p>
      </header>
      <FormPeserta peserta={peserta} hariIni={hariIni} bolehBiodata={bolehBiodata} biodata={biodata} />
      {/* Hanya peserta aktif yang punya kartu berlaku */}
      {peserta.status === "aktif" && kartu ? (
        <PanelKartu pesertaId={peserta.id} nama={peserta.nama} dibuat={keTeksTanggal(kartu.dibuatAt)} hariIni={hariIni} />
      ) : (
        <p className="max-w-2xl rounded-3xl bg-surface-low p-6 text-sm text-on-surface-variant">
          Peserta tidak aktif, jadi kartunya tidak berlaku untuk absensi. Aktifkan kembali untuk mencetak kartu.
        </p>
      )}
    </div>
  );
}
