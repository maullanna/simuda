import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { PilihCetakKartu, type PesertaKartu } from "@/components/kartu/PilihCetakKartu";
import { daftarPeserta, kartuContoh, kontakKartuHilang } from "@/lib/mock";
import { tanggalHariIniWib } from "@/lib/peserta";

export const metadata: Metadata = {
  title: "Cetak kartu · SIMUDA",
};

// Cetak kartu peserta (KONSEP 5.2 dan 8.1). Hanya peserta aktif yang bisa dicetak.
// /peserta/kartu?id=p03 langsung memilih satu peserta (misalnya untuk cetak ulang kartu hilang).
export default async function CetakKartuPage(props: PageProps<"/peserta/kartu">) {
  await connection();
  const { id } = await props.searchParams;

  // SEMENTARA (data contoh): token dikirim ke browser untuk dibuat QR-nya.
  // Saat database tersambung, PDF dibuat di Route Handler yang dicek requireRole().
  const peserta: PesertaKartu[] = daftarPeserta
    .filter((p) => p.status === "aktif")
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
    .map((p) => ({
      id: p.id,
      nama: p.nama,
      jenisKelamin: p.jenisKelamin,
      wilayah: p.wilayah,
      token: kartuContoh.find((k) => k.pesertaId === p.id)?.token ?? "",
    }));

  const satuPeserta = typeof id === "string" && peserta.some((p) => p.id === id);
  const awalTerpilih = satuPeserta ? [id] : peserta.map((p) => p.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/peserta"
          className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={16} /> Peserta
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Cetak kartu</h1>
        <p className="text-on-surface-variant">Pilih peserta, buat PDF, lalu cetak di kertas A4 dan laminating.</p>
      </header>
      <PilihCetakKartu
        peserta={peserta}
        awalTerpilih={awalTerpilih}
        kontak={kontakKartuHilang}
        namaFile={`kartu-simuda-${tanggalHariIniWib()}.pdf`}
      />
    </div>
  );
}
