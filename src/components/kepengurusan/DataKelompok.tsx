"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, MapPinned, Pencil } from "lucide-react";
import { simpanDataKelompok } from "@/app/(pengurus)/kepengurusan/aksi";
import { Dialog } from "@/components/Dialog";
import type { DataKelompok as Data } from "@/lib/biodata";

type Kolom = Exclude<keyof Data, "wilayah">;
const KOLOM: { nama: Kolom; label: string; contoh?: string }[] = [
  { nama: "desa", label: "Desa" },
  { nama: "daerah", label: "Daerah" },
  { nama: "kipok", label: "Kipok (Kyai Kelompok)" },
  { nama: "timPnkbKelompok", label: "Tim PnKB kelompok", contoh: "Nama / nama" },
  { nama: "timPnkbDesa", label: "Tim PnKB desa", contoh: "Nama / nama" },
  { nama: "timPnkbDaerah", label: "Tim PnKB daerah", contoh: "Nama / nama" },
];

function FormKelompok({ data, selesai }: { data: Data; selesai: () => void }) {
  const [galat, setGalat] = useState<Partial<Record<Kolom, string>>>({});
  const [pesan, setPesan] = useState<string>();
  const [proses, setProses] = useState(false);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProses(true);
    setPesan(undefined);
    try {
      const hasil = await simpanDataKelompok(data.wilayah === "Bendlay 4" ? "bendlay_4" : "bendlay_2", new FormData(e.currentTarget));
      if (!hasil.ok) {
        setGalat(hasil.galat ?? {});
        setPesan(hasil.galat ? undefined : hasil.pesan);
        return;
      }
      selesai();
    } catch {
      setPesan("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(false);
    }
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-4">
      {pesan && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {pesan}
        </p>
      )}
      {KOLOM.map((k) => (
        <md-outlined-text-field
          key={k.nama}
          name={k.nama}
          label={k.label}
          placeholder={k.contoh}
          value={data[k.nama] ?? ""}
          autocomplete="off"
          error={Boolean(galat[k.nama])}
          error-text={galat[k.nama]}
          className="w-full"
        />
      ))}
      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button has-icon={proses} type="submit" disabled={proses}>
          {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
          {proses ? "Menyimpan..." : "Simpan"}
        </md-filled-button>
      </div>
    </form>
  );
}

// Data per kelompok (KONSEP 5.1b): desa, daerah, Kipok, Tim PnKB. Diisi sekali,
// lalu otomatis ikut ke profil biodata semua peserta di kelompok itu.
export function DataKelompok({ semua, bolehUbah }: { semua: Data[]; bolehUbah: boolean }) {
  const [dibuka, setDibuka] = useState<Data | null>(null);

  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <MapPinned size={20} className="text-primary" /> Data kelompok
        </h2>
        <p className="text-sm text-on-surface-variant">Sambung, Kipok, dan Tim PnKB. Otomatis ikut ke profil biodata setiap peserta di kelompoknya.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {semua.map((k) => (
          <article key={k.wilayah} className="flex flex-col gap-2 rounded-2xl bg-surface-mid p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold">Kelompok {k.wilayah}</h3>
              {bolehUbah && (
                <button
                  type="button"
                  onClick={() => setDibuka(k)}
                  aria-label={`Ubah data kelompok ${k.wilayah}`}
                  className="grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {KOLOM.map((kol) => (
                <div key={kol.nama} className="contents">
                  <dt className="text-on-surface-variant">{kol.label}</dt>
                  <dd className="min-w-0 break-words font-semibold">{k[kol.nama] ?? <span className="font-normal text-on-surface-variant/70">belum diisi</span>}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <Dialog terbuka={dibuka !== null} tutup={() => setDibuka(null)} judul={`Data kelompok ${dibuka?.wilayah ?? ""}`} keterangan="Berlaku untuk semua peserta di kelompok ini.">
        {dibuka && <FormKelompok data={dibuka} selesai={() => setDibuka(null)} />}
      </Dialog>
    </section>
  );
}
