"use client";

import { useState, type FormEvent } from "react";
import { HasilSimpan } from "@/components/Dialog";
import { DaftarPilihPeserta } from "@/components/absensi/DaftarPilihPeserta";
import type { PesertaSesi } from "@/lib/sesi";

// Input manual untuk peserta yang lupa membawa kartu (KONSEP 5.3).
// Bisa mencentang beberapa nama sekaligus.
export function FormInputManual({ peserta, selesai }: { peserta: PesertaSesi[]; selesai: () => void }) {
  const [terpilih, setTerpilih] = useState<string[]>([]);
  const [luarSasaran, setLuarSasaran] = useState(false);
  const [galat, setGalat] = useState<string>();
  const [hasil, setHasil] = useState<PesertaSesi[] | null>(null);

  const daftar = peserta.filter((p) => luarSasaran || !p.diLuarSasaran);
  const jumlahLuar = peserta.filter((p) => p.diLuarSasaran).length;
  const belum = peserta.filter((p) => !p.diLuarSasaran && p.status === "belum").length;

  function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (terpilih.length === 0) {
      setGalat("Centang minimal satu peserta");
      return;
    }
    // Database belum tersambung. Di sini nanti memanggil Server Action (metode: manual).
    setHasil(peserta.filter((p) => terpilih.includes(p.id)));
  }

  if (hasil) {
    return (
      <HasilSimpan judul={`${hasil.length} peserta siap dicatat hadir`} tutup={selesai}>
        <ul className="flex flex-wrap gap-1.5">
          {hasil.map((p) => (
            <li key={p.id} className="rounded-lg bg-secondary-container px-2.5 py-1 text-xs font-semibold text-on-secondary-container">
              {p.nama}
            </li>
          ))}
        </ul>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={saatSimpan} className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-variant">
        {belum} peserta sasaran belum tercatat. Centang yang hadir tanpa membawa kartu.
      </p>

      <DaftarPilihPeserta
        name="pesertaId"
        peserta={daftar}
        jamak
        terpilih={terpilih}
        ubahTerpilih={(id) => {
          setTerpilih(id);
          setGalat(undefined);
        }}
        galat={galat}
      />

      {jumlahLuar > 0 && (
        <label className="flex cursor-pointer items-center gap-2 px-1 text-sm">
          <input
            type="checkbox"
            checked={luarSasaran}
            onChange={(e) => {
              setLuarSasaran(e.target.checked);
              // Kalau disembunyikan lagi, pilihan peserta di luar sasaran ikut dilepas.
              if (!e.target.checked) setTerpilih((t) => t.filter((id) => !peserta.find((p) => p.id === id)?.diLuarSasaran));
            }}
            className="size-4 accent-primary"
          />
          Tampilkan juga {jumlahLuar} peserta di luar sasaran sesi ini
        </label>
      )}

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="submit">
          Catat hadir{terpilih.length > 0 ? ` (${terpilih.length})` : ""}
        </md-filled-button>
      </div>
    </form>
  );
}
