"use client";

import { useState } from "react";
import { CalendarPlus, NotebookPen } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { FormHasilMusyawarah, FormJadwalMusyawarah } from "@/components/musyawarah/FormMusyawarah";
import type { Musyawarah } from "@/lib/musyawarah";
import { formatTanggal } from "@/lib/sesi";

// Tombol-tombol di halaman Musyawarah yang membuka dialog.

export function TombolJadwalkan({ hariIni }: { hariIni: string }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-filled-button type="button" onClick={() => setTerbuka(true)}>
        <CalendarPlus slot="icon" size={18} />
        Jadwalkan musyawarah
      </md-filled-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Jadwalkan musyawarah">
        <FormJadwalMusyawarah hariIni={hariIni} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolTulisHasil({
  musyawarah,
  daftarPengurus,
  varian = "tonal",
}: {
  musyawarah: Musyawarah;
  daftarPengurus: string[];
  varian?: "tonal" | "teks";
}) {
  const [terbuka, setTerbuka] = useState(false);
  const label = musyawarah.hasil.length ? "Ubah hasil" : "Tulis hasil";
  return (
    <>
      {varian === "tonal" ? (
        <md-filled-tonal-button type="button" onClick={() => setTerbuka(true)}>
          <NotebookPen slot="icon" size={18} />
          {label}
        </md-filled-tonal-button>
      ) : (
        <md-text-button type="button" onClick={() => setTerbuka(true)}>
          <NotebookPen slot="icon" size={16} />
          {label}
        </md-text-button>
      )}
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul={`${label} musyawarah`}
        keterangan={`${formatTanggal(musyawarah.tanggal)} · ${musyawarah.lokasi}`}
      >
        <FormHasilMusyawarah musyawarah={musyawarah} daftarPengurus={daftarPengurus} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}
