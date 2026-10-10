import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormMasukPengurus } from "@/components/masuk/FormMasukPengurus";
import { KerangkaMasuk } from "@/components/masuk/KerangkaMasuk";
import { ambilPenggunaMasuk } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Masuk pengurus · SIMUDA",
};

// Hanya alamat di dalam SIMUDA yang boleh jadi tujuan setelah masuk.
// "//situs-lain.com" ditolak, supaya link masuk tidak bisa dipakai untuk mengarahkan ke situs palsu.
function tujuanAman(ke: string | string[] | undefined): string {
  return typeof ke === "string" && ke.startsWith("/") && !ke.startsWith("//") ? ke : "/dashboard";
}

// Masuk untuk pengurus dan petugas scan. Akun dibuat oleh Wakil/Ketua (KONSEP bagian 3).
export default async function MasukPengurusPage(props: PageProps<"/masuk">) {
  const { ke } = await props.searchParams;
  const tujuan = tujuanAman(ke);

  // Sudah masuk: tidak perlu login lagi.
  const pengguna = await ambilPenggunaMasuk();
  if (pengguna) redirect(pengguna.peran === "petugas_scan" ? "/scan" : tujuan);

  return (
    <KerangkaMasuk judul="Masuk pengurus" keterangan="Untuk pengurus dan petugas scan">
      <FormMasukPengurus tujuan={tujuan} />
    </KerangkaMasuk>
  );
}
