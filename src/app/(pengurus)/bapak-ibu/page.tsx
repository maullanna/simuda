import type { Metadata } from "next";
import { HalamanDisiapkan } from "@/components/HalamanDisiapkan";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Bapak & Ibu · SIMUDA",
};

// Master data Bapak & Ibu (orang tua). Menu sudah ada (label "Segera"); isinya dibangun setelah kolom datanya disepakati.
export default async function BapakIbuPage() {
  await requireRole("bapakIbu", "lihat");
  return (
    <HalamanDisiapkan
      judul="Bapak & Ibu"
      keterangan="Data Bapak dan Ibu di kelompok Bendlay 2 dan Bendlay 4 sedang disiapkan."
    />
  );
}
