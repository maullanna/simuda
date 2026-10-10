import type { Metadata } from "next";
import { FormMasukPengurus } from "@/components/masuk/FormMasukPengurus";
import { KerangkaMasuk } from "@/components/masuk/KerangkaMasuk";

export const metadata: Metadata = {
  title: "Masuk pengurus · SIMUDA",
};

// Masuk untuk pengurus dan petugas scan. Akun dibuat oleh Wakil/Ketua (KONSEP bagian 3).
export default function MasukPengurusPage() {
  return (
    <KerangkaMasuk judul="Masuk pengurus" keterangan="Untuk pengurus dan petugas scan">
      <FormMasukPengurus />
    </KerangkaMasuk>
  );
}
