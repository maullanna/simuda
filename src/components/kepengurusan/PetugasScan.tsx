"use client";

import { useState } from "react";
import { LoaderCircle, ScanLine, UserMinus, UserPlus } from "lucide-react";
import { cabutPetugasScan, tambahPetugasScan } from "@/app/(pengurus)/kepengurusan/aksi";
import { DaftarPilihPeserta } from "@/components/absensi/DaftarPilihPeserta";
import { Dialog } from "@/components/Dialog";
import { TombolAkun } from "@/components/kepengurusan/AksiAkun";
import type { PesertaSesi } from "@/lib/sesi";

export type CalonPetugas = { id: string; nama: string; wilayah: string; jenisKelamin: "putra" | "putri" };
// id = id baris pengurus (peran petugas_scan), pesertaId = peserta yang bertugas.
export type Petugas = { id: string; pesertaId: string; nama: string; email: string | null; aktif: boolean };

// Petugas scan: muda/i (peserta) yang diberi peran petugas scan secara bergiliran.
// Peran ini bisa diberikan dan dicabut kapan saja (KONSEP bagian 3). Mencabut = menonaktifkan
// baris pengurusnya; kalau dijadikan petugas lagi, akun lamanya ikut aktif kembali.
export function PetugasScan({ peserta, petugas, bolehKelola }: { peserta: CalonPetugas[]; petugas: Petugas[]; bolehKelola: boolean }) {
  const [terbuka, setTerbuka] = useState(false);
  const [pilihan, setPilihan] = useState<string[]>([]);
  const [proses, setProses] = useState<string | null>(null); // "tambah" atau id petugas yang sedang dicabut
  const [akanDicabut, setAkanDicabut] = useState<string | null>(null);
  const [galat, setGalat] = useState<string>();

  const sudahPetugas = new Set(petugas.map((p) => p.pesertaId));
  const dataPeserta = new Map(peserta.map((p) => [p.id, p]));

  // DaftarPilihPeserta menampilkan yang sudah jadi petugas sebagai "sudah" (tidak bisa dipilih lagi).
  const calon: PesertaSesi[] = peserta.map((p) => ({
    id: p.id,
    nama: p.nama,
    wilayah: `${p.jenisKelamin === "putra" ? "Putra" : "Putri"} · ${p.wilayah}`,
    status: sudahPetugas.has(p.id) ? "hadir" : "belum",
    diLuarSasaran: false,
  }));

  async function tambah() {
    setProses("tambah");
    setGalat(undefined);
    try {
      const hasil = await tambahPetugasScan(pilihan);
      if (!hasil.ok) return setGalat(hasil.pesan);
      setPilihan([]);
      setTerbuka(false);
    } catch {
      setGalat("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(null);
    }
  }

  async function cabut(id: string) {
    setProses(id);
    setGalat(undefined);
    try {
      const hasil = await cabutPetugasScan(id);
      if (!hasil.ok) setGalat(hasil.pesan);
    } catch {
      setGalat("Gagal mencabut. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(null);
      setAkanDicabut(null);
    }
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
        {bolehKelola && (
          <md-filled-tonal-button type="button" onClick={() => setTerbuka(true)}>
            <UserPlus slot="icon" size={18} />
            Tambah petugas
          </md-filled-tonal-button>
        )}
      </div>

      {galat && !terbuka && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {galat}
        </p>
      )}

      {petugas.length === 0 ? (
        <p className="py-6 text-center text-sm text-on-surface-variant">Belum ada petugas scan.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {petugas.map((p) => {
            const pst = dataPeserta.get(p.pesertaId);
            const putra = pst?.jenisKelamin !== "putri";
            return (
              <li key={p.id} className="muncul flex items-center gap-3 rounded-2xl bg-surface-mid p-3" style={{ animationDuration: "300ms" }}>
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    putra ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
                  }`}
                >
                  {p.nama.charAt(0)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <p className="max-w-full truncate text-sm font-bold">{p.nama}</p>
                  {pst && (
                    <p className="text-xs text-on-surface-variant">
                      {putra ? "Putra" : "Putri"} · {pst.wilayah}
                    </p>
                  )}
                  <TombolAkun akun={p} bolehKelola={bolehKelola} diriSendiri={false} />
                </div>
                {bolehKelola &&
                  (akanDicabut === p.id ? (
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        disabled={proses === p.id}
                        onClick={() => cabut(p.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-full bg-error px-3 text-xs font-bold text-on-error transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {proses === p.id ? <LoaderCircle size={14} className="animate-spin" /> : <UserMinus size={14} />} Ya, cabut
                      </button>
                      <button type="button" onClick={() => setAkanDicabut(null)} className="px-3 text-xs font-semibold text-on-surface-variant hover:text-on-surface">
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAkanDicabut(p.id)}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
                    >
                      <UserMinus size={14} /> Cabut
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        terbuka={terbuka}
        tutup={() => setTerbuka(false)}
        judul="Tambah petugas scan"
        keterangan="Pilih muda/i yang bertugas. Yang sudah jadi petugas tampil redup."
      >
        <div className="flex flex-col gap-4">
          {galat && (
            <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {galat}
            </p>
          )}
          <DaftarPilihPeserta name="petugas" peserta={calon} jamak terpilih={pilihan} ubahTerpilih={setPilihan} labelSudah="Sudah petugas" />
          <p className="text-xs text-on-surface-variant">Setelah ditambahkan, buatkan akunnya lewat chip “Belum punya akun” di kartunya.</p>
          <div className="flex justify-end gap-2">
            <md-text-button type="button" onClick={() => setTerbuka(false)}>
              Batal
            </md-text-button>
            <md-filled-button type="button" disabled={pilihan.length === 0 || proses === "tambah"} onClick={tambah}>
              {proses === "tambah" && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
              Jadikan petugas{pilihan.length ? ` (${pilihan.length})` : ""}
            </md-filled-button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
