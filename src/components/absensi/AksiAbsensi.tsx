"use client";

import { useState } from "react";
import { CalendarX2, PencilLine } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { FormCatatIzin, type OpsiSesiIzin } from "@/components/absensi/FormCatatIzin";
import { FormInputManual } from "@/components/absensi/FormInputManual";
import { KonfirmasiTutupSesi } from "@/components/absensi/KonfirmasiTutupSesi";
import type { PesertaSesi } from "@/lib/sesi";

// Tombol-tombol di halaman Absensi yang membuka dialog.
// Halamannya tetap Server Component; hanya tombol + dialog ini yang berjalan di browser.

export function TombolInputManual({ judulSesi, peserta }: { judulSesi: string; peserta: PesertaSesi[] }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-outlined-button type="button" onClick={() => setTerbuka(true)}>
        <PencilLine slot="icon" size={18} />
        Input manual
      </md-outlined-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Input manual" keterangan={judulSesi}>
        <FormInputManual peserta={peserta} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolTutupSesi({ judulSesi, peserta }: { judulSesi: string; peserta: PesertaSesi[] }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-text-button type="button" onClick={() => setTerbuka(true)}>
        <CalendarX2 slot="icon" size={18} />
        Tutup sesi
      </md-text-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Tutup sesi?" keterangan={judulSesi}>
        <KonfirmasiTutupSesi peserta={peserta} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolCatatIzin({ opsiSesi }: { opsiSesi: OpsiSesiIzin[] }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-outlined-button type="button" onClick={() => setTerbuka(true)}>
        Catat izin
      </md-outlined-button>
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul="Catat izin"
        keterangan="Izin langsung tercatat, tidak perlu persetujuan."
      >
        <FormCatatIzin opsiSesi={opsiSesi} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}
