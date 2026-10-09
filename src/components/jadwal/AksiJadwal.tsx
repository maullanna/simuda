"use client";

import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { FormCatatan } from "@/components/jadwal/FormCatatan";
import { FormSesi } from "@/components/jadwal/FormSesi";
import { labelJenisKelamin } from "@/lib/peserta";
import { formatTanggal, type Sesi } from "@/lib/sesi";

// Tombol-tombol di halaman Jadwal yang membuka dialog.
// Dipisah dari halaman karena butuh state (dialog terbuka/tertutup),
// sedangkan halamannya sendiri tetap Server Component.

function keteranganSesi(sesi: Sesi): string {
  return `${labelJenisKelamin[sesi.jenisKelamin]} · ${formatTanggal(sesi.tanggal, { weekday: "long", day: "numeric", month: "long" })}`;
}

export function TombolTambahSesi({ hariIni, daftarPemateri }: { hariIni: string; daftarPemateri: string[] }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-filled-button type="button" onClick={() => setTerbuka(true)}>
        <Plus slot="icon" size={18} />
        Tambah sesi
      </md-filled-button>
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul="Tambah sesi"
        keterangan="Untuk pengajian di luar jadwal rutin, misalnya kajian khusus."
      >
        <FormSesi hariIni={hariIni} daftarPemateri={daftarPemateri} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolIsiMateri({
  sesi,
  hariIni,
  daftarPemateri,
}: {
  sesi: Sesi;
  hariIni: string;
  daftarPemateri: string[];
}) {
  const [terbuka, setTerbuka] = useState(false);
  const lengkap = sesi.materi !== "" && sesi.pemateri !== "";
  return (
    <>
      <md-text-button type="button" onClick={() => setTerbuka(true)}>
        {lengkap ? "Ubah" : "Isi materi"}
      </md-text-button>
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul={lengkap ? "Ubah materi" : "Isi materi"}
        keterangan={keteranganSesi(sesi)}
      >
        <FormSesi sesi={sesi} hariIni={hariIni} daftarPemateri={daftarPemateri} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolCatatan({ sesi }: { sesi: Sesi }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-text-button type="button" onClick={() => setTerbuka(true)}>
        <NotebookPen slot="icon" size={16} />
        {sesi.catatan ? "Ubah catatan" : "Tulis catatan"}
      </md-text-button>
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul={sesi.catatan ? "Ubah catatan" : "Tulis catatan"}
        keterangan={`${sesi.materi} · ${keteranganSesi(sesi)}`}
      >
        <FormCatatan sesi={sesi} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}
