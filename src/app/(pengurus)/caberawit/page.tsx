import type { Metadata } from "next";
import { HalamanDisiapkan } from "@/components/HalamanDisiapkan";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Caberawit · SIMUDA",
};

// Master data Caberawit: anak-anak PAUD sampai kelas 6. Menu sudah ada (label "Segera"); isinya dibangun setelah kolom datanya disepakati.
export default async function CaberawitPage() {
  await requireRole("caberawit", "lihat");
  return (
    <HalamanDisiapkan
      judul="Caberawit"
      keterangan="Data caberawit, anak-anak PAUD sampai kelas 6, sedang disiapkan."
    />
  );
}
