"use client";

import { useState } from "react";
import Link from "next/link";
import { HasilSimpan } from "@/components/Dialog";
import type { PesertaSesi } from "@/lib/sesi";

// Konfirmasi tutup sesi (KONSEP 8.4): peserta sasaran yang belum tercatat hadir
// atau izin akan otomatis tercatat alpa. Karena tidak bisa dibatalkan begitu saja,
// pengurus diperlihatkan dulu siapa saja yang akan tercatat alpa.
export function KonfirmasiTutupSesi({ peserta, selesai }: { peserta: PesertaSesi[]; selesai: () => void }) {
  const [ditutup, setDitutup] = useState(false);

  const sasaran = peserta.filter((p) => !p.diLuarSasaran);
  const hadir = peserta.filter((p) => p.status === "hadir").length; // termasuk yang di luar sasaran
  const izin = sasaran.filter((p) => p.status === "izin").length;
  const akanAlpa = sasaran.filter((p) => p.status === "belum");

  if (ditutup) {
    return (
      <HasilSimpan judul="Sesi siap ditutup" tutup={selesai}>
        <p className="text-sm">
          Langkah berikutnya: isi catatan materi di{" "}
          <Link href="/jadwal" className="font-bold text-primary hover:underline">
            Jadwal & materi
          </Link>
          .
        </p>
      </HasilSimpan>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Hadir", hadir],
          ["Izin", izin],
          ["Akan alpa", akanAlpa.length],
        ].map(([label, nilai]) => (
          // flex-col-reverse: label ditulis dulu (aturan <dl>), tapi angkanya tampil di atas.
          <div key={label} className="flex flex-col-reverse rounded-2xl bg-surface-mid px-2 py-3">
            <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
            <dd className="text-2xl font-extrabold">{nilai}</dd>
          </div>
        ))}
      </dl>

      {akanAlpa.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Peserta berikut belum tercatat dan akan tercatat <b>alpa</b>:</p>
          <ul className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {akanAlpa.map((p) => (
              <li key={p.id} className="rounded-lg bg-surface-highest px-2.5 py-1 text-xs font-semibold">
                {p.nama}
              </li>
            ))}
          </ul>
          <p className="text-xs text-on-surface-variant">
            Kalau ada yang sebenarnya hadir, catat dulu lewat Input manual sebelum menutup sesi.
          </p>
        </div>
      ) : (
        <p className="text-sm">Semua peserta sasaran sudah tercatat hadir atau izin.</p>
      )}

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="button" onClick={() => setDitutup(true)}>
          Tutup sesi
        </md-filled-button>
      </div>
    </div>
  );
}
