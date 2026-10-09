"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { FormPemasukan, FormPengeluaran, FormUbahTransaksi } from "@/components/sodaqoh/FormSodaqoh";
import { formatRupiah } from "@/lib/format";
import type { Transaksi } from "@/lib/sodaqoh";

// Tombol-tombol di halaman Sodaqoh yang membuka dialog.
// Nanti hanya bendahara yang boleh mencatat dan mengubah (dicek requireRole di server).

export function TombolCatatPemasukan({ hariIni, daftarPengurus }: { hariIni: string; daftarPengurus: string[] }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-filled-button type="button" onClick={() => setTerbuka(true)}>
        <ArrowDownLeft slot="icon" size={18} />
        Catat pemasukan
      </md-filled-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Catat pemasukan" keterangan="Infaq dihitung bersama oleh dua orang.">
        <FormPemasukan hariIni={hariIni} daftarPengurus={daftarPengurus} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolCatatPengeluaran({ hariIni }: { hariIni: string }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-filled-tonal-button type="button" onClick={() => setTerbuka(true)}>
        <ArrowUpRight slot="icon" size={18} />
        Catat pengeluaran
      </md-filled-tonal-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Catat pengeluaran" keterangan="Setiap pengeluaran wajib disertai foto nota.">
        <FormPengeluaran hariIni={hariIni} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolUbahTransaksi({ transaksi }: { transaksi: Transaksi }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        aria-label={`Ubah transaksi ${transaksi.keterangan}`}
        className="grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
      >
        <Pencil size={16} />
      </button>
      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul="Ubah transaksi"
        keterangan={`${transaksi.keterangan} · ${formatRupiah(transaksi.jumlah)}`}
      >
        <FormUbahTransaksi transaksi={transaksi} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}
