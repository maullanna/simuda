"use client";

import { useState } from "react";
import { ScanLine, UserMinus, UserPlus } from "lucide-react";
import { DaftarPilihPeserta } from "@/components/absensi/DaftarPilihPeserta";
import { Dialog } from "@/components/Dialog";
import type { PesertaSesi } from "@/lib/sesi";

type CalonPetugas = { id: string; nama: string; wilayah: string; jenisKelamin: "putra" | "putri" };

// Petugas scan: muda/i (peserta) yang diberi peran petugas scan secara bergiliran.
// Peran ini bisa diberikan dan dicabut kapan saja (KONSEP bagian 3).
// "use client" karena daftar berubah langsung di layar saat ditambah/dicabut.
export function PetugasScan({ peserta, awal }: { peserta: CalonPetugas[]; awal: string[] }) {
  const [petugas, setPetugas] = useState<string[]>(awal);
  const [terbuka, setTerbuka] = useState(false);
  const [pilihan, setPilihan] = useState<string[]>([]);
  const [diubah, setDiubah] = useState(false);

  const daftarPetugas = petugas.map((id) => peserta.find((p) => p.id === id)).filter((p): p is CalonPetugas => Boolean(p));

  // DaftarPilihPeserta menampilkan yang sudah jadi petugas sebagai "sudah" (tidak bisa dipilih lagi).
  const calon: PesertaSesi[] = peserta.map((p) => ({
    id: p.id,
    nama: p.nama,
    wilayah: `${p.jenisKelamin === "putra" ? "Putra" : "Putri"} · ${p.wilayah}`,
    status: petugas.includes(p.id) ? "hadir" : "belum",
    diLuarSasaran: false,
  }));

  function tambah() {
    setPetugas((x) => [...x, ...pilihan]);
    setPilihan([]);
    setTerbuka(false);
    setDiubah(true);
  }

  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ScanLine size={20} className="text-primary" /> Petugas scan
          </h2>
          <p className="text-sm text-on-surface-variant">Muda/i yang bertugas memindai kartu, digilir. Hanya bisa membuka layar Scanner.</p>
        </div>
        <md-filled-tonal-button type="button" onClick={() => setTerbuka(true)}>
          <UserPlus slot="icon" size={18} />
          Tambah petugas
        </md-filled-tonal-button>
      </div>

      {diubah && (
        <p className="rounded-xl bg-warning-container px-3 py-1.5 text-xs text-on-warning-container">
          Perubahan petugas belum tersimpan (database belum tersambung).
        </p>
      )}

      {daftarPetugas.length === 0 ? (
        <p className="py-6 text-center text-sm text-on-surface-variant">Belum ada petugas scan.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {daftarPetugas.map((p) => (
            <li key={p.id} className="muncul flex items-center gap-3 rounded-2xl bg-surface-mid p-3" style={{ animationDuration: "300ms" }}>
              <div
                className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  p.jenisKelamin === "putra" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
                }`}
              >
                {p.nama.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.nama}</p>
                <p className="text-xs text-on-surface-variant">
                  {p.jenisKelamin === "putra" ? "Putra" : "Putri"} · {p.wilayah}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPetugas((x) => x.filter((id) => id !== p.id));
                  setDiubah(true);
                }}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
              >
                <UserMinus size={14} /> Cabut
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul="Tambah petugas scan"
        keterangan="Pilih muda/i yang bertugas. Yang sudah jadi petugas tampil redup."
      >
        <div className="flex flex-col gap-4">
          <DaftarPilihPeserta name="petugas" peserta={calon} jamak terpilih={pilihan} ubahTerpilih={setPilihan} labelSudah="Sudah petugas" />
          <div className="flex justify-end gap-2">
            <md-text-button type="button" onClick={() => setTerbuka(false)}>
              Batal
            </md-text-button>
            <md-filled-button type="button" disabled={pilihan.length === 0} onClick={tambah}>
              Jadikan petugas{pilihan.length ? ` (${pilihan.length})` : ""}
            </md-filled-button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
