import type { Metadata } from "next";
import { FormMasukPeserta } from "@/components/masuk/FormMasukPeserta";
import { KerangkaMasuk } from "@/components/masuk/KerangkaMasuk";

export const metadata: Metadata = {
  title: "Masuk peserta · SIMUDA",
};

// Masuk untuk peserta: tanpa kata sandi, cukup kode OTP lewat WhatsApp.
export default function MasukPesertaPage() {
  return (
    <KerangkaMasuk judul="Masuk peserta" keterangan="Tanpa kata sandi, cukup kode dari WhatsApp">
      <FormMasukPeserta />
    </KerangkaMasuk>
  );
}
