"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { simpanBiodata } from "@/app/(pengurus)/peserta/aksi";
import { IsianBiodata, type GalatBiodata as Galat } from "@/components/peserta/IsianBiodata";
import type { Biodata } from "@/lib/biodata";
import { PESAN_ADA_GALAT, gulirKeGalatPertama } from "@/lib/galat-form";

// Form biodata muda/i untuk Tim PnKB (KONSEP 5.1b). Semua isian boleh kosong, dilengkapi bertahap.
// Pemeriksaan sesungguhnya (Zod + hak akses) ada di server: simpanBiodata().
export function FormBiodata({ pesertaId, jenisKelamin, biodata }: { pesertaId: string; jenisKelamin: "putra" | "putri"; biodata: Biodata }) {
  const router = useRouter();
  const [galat, setGalat] = useState<Galat>({});
  const [pesanUmum, setPesanUmum] = useState<string>();
  const [proses, setProses] = useState(false);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setProses(true);
    setPesanUmum(undefined);
    try {
      const hasil = await simpanBiodata(pesertaId, new FormData(form));
      if (!hasil.ok) {
        setGalat(hasil.galat as Galat);
        setPesanUmum(Object.keys(hasil.galat).length ? PESAN_ADA_GALAT : hasil.pesan);
        gulirKeGalatPertama(form, hasil.galat);
        return;
      }
      router.push(`/peserta/${pesertaId}`);
    } catch {
      setPesanUmum("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={simpan}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof Galat | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined }));
      }}
      className="grid max-w-6xl gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start"
    >
      <IsianBiodata biodata={biodata} galat={galat} jenisKelamin={jenisKelamin} />

      {pesanUmum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container lg:col-span-2">
          {pesanUmum}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
        <md-text-button href={`/peserta/${pesertaId}`}>Batal</md-text-button>
        <md-filled-button has-icon type="submit" disabled={proses}>
          {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <Save slot="icon" size={18} />}
          {proses ? "Menyimpan..." : "Simpan biodata"}
        </md-filled-button>
      </div>
    </form>
  );
}
