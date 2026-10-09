"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, X } from "lucide-react";
import { HasilSimpan } from "@/components/Dialog";
import { formatRupiah, formatUkuran } from "@/lib/format";
import { periksaFileLampiran } from "@/lib/sesi";
import {
  bacaRupiah,
  periksaPemasukan,
  periksaPengeluaran,
  periksaPerubahan,
  type GalatSodaqoh,
  type Transaksi,
} from "@/lib/sodaqoh";

// Tiga form sodaqoh: pemasukan, pengeluaran, dan ubah transaksi.
// Database belum tersambung, jadi setelah lolos pemeriksaan hanya ditampilkan ringkasannya.

const gayaSelect =
  "h-14 w-full cursor-pointer rounded-[4px] border bg-transparent px-4 text-on-surface outline-none transition-colors hover:border-on-surface focus:border-2 focus:border-primary";

// Kolom jumlah rupiah. Pengguna boleh mengetik "150000" atau "150.000";
// di bawahnya selalu tampil hasil bacaannya supaya tidak salah ketik nol.
function KolomJumlah({ nilaiAwal, galat }: { nilaiAwal?: number; galat?: string }) {
  const [teks, setTeks] = useState(nilaiAwal ? String(nilaiAwal) : "");
  const angka = bacaRupiah(teks);
  return (
    <div
      className="flex flex-col gap-1"
      onInput={(e) => {
        const kolom = e.target as HTMLElement & { name?: string; value?: string };
        if (kolom.name === "jumlah") setTeks(kolom.value ?? "");
      }}
    >
      <md-outlined-text-field
        name="jumlah"
        label="Jumlah"
        prefix-text="Rp "
        inputMode="numeric"
        value={nilaiAwal ? String(nilaiAwal) : ""}
        error={Boolean(galat)}
        error-text={galat}
        className="w-full"
      />
      <p className="px-4 text-xs text-on-surface-variant">{angka > 0 ? `Terbaca: ${formatRupiah(angka)}` : "Ketik angka tanpa titik juga boleh"}</p>
    </div>
  );
}

function TombolForm({ batal, simpan }: { batal: () => void; simpan: string }) {
  return (
    <div className="flex justify-end gap-2">
      <md-text-button type="button" onClick={batal}>
        Batal
      </md-text-button>
      <md-filled-button type="submit">{simpan}</md-filled-button>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function FormPemasukan({
  hariIni,
  daftarPengurus,
  selesai,
}: {
  hariIni: string;
  daftarPengurus: string[];
  selesai: () => void;
}) {
  const [galat, setGalat] = useState<GalatSodaqoh>({});
  const [hasil, setHasil] = useState<{ jumlah: number; keterangan: string; penghitung: string } | null>(null);

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const isian = {
      tanggal: String(d.get("tanggal") ?? ""),
      jumlah: bacaRupiah(String(d.get("jumlah") ?? "")),
      keterangan: String(d.get("keterangan") ?? ""),
      penghitung1: String(d.get("penghitung1") ?? ""),
      penghitung2: String(d.get("penghitung2") ?? ""),
    };
    const g = periksaPemasukan(isian, hariIni);
    setGalat(g);
    if (Object.keys(g).length > 0) return;
    setHasil({ jumlah: isian.jumlah, keterangan: isian.keterangan.trim(), penghitung: `${isian.penghitung1} & ${isian.penghitung2}` });
  }

  if (hasil) {
    return (
      <HasilSimpan judul={`Pemasukan ${formatRupiah(hasil.jumlah)} siap dicatat`} tutup={selesai}>
        <p className="text-sm">
          {hasil.keterangan} · dihitung oleh <b>{hasil.penghitung}</b>
        </p>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-5">
      <md-outlined-text-field name="tanggal" label="Tanggal" type="date" value={hariIni} max={hariIni} error={Boolean(galat.tanggal)} error-text={galat.tanggal} className="w-full" />
      <KolomJumlah galat={galat.jumlah} />
      <md-outlined-text-field name="keterangan" label="Keterangan" value="Infaq pengajian putra & putri" error={Boolean(galat.keterangan)} error-text={galat.keterangan} className="w-full" />

      {/* Dua penghitung supaya uang selalu dihitung bersama, tidak oleh satu orang saja */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Dihitung oleh dua orang</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {["penghitung1", "penghitung2"].map((nama, i) => (
            <select key={nama} name={nama} defaultValue="" aria-label={`Penghitung ${i + 1}`} className={`${gayaSelect} ${galat.penghitung ? "border-error" : "border-outline"}`}>
              <option value="" disabled>
                Penghitung {i + 1}
              </option>
              {daftarPengurus.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ))}
        </div>
        {galat.penghitung && <p className="px-4 text-xs text-error">{galat.penghitung}</p>}
      </fieldset>

      <TombolForm batal={selesai} simpan="Catat pemasukan" />
    </form>
  );
}

// ---------------------------------------------------------------------------

export function FormPengeluaran({ hariIni, selesai }: { hariIni: string; selesai: () => void }) {
  const [galat, setGalat] = useState<GalatSodaqoh>({});
  const [nota, setNota] = useState<{ file: File; pratinjau: string | null } | null>(null);
  const [hasil, setHasil] = useState<{ jumlah: number; keterangan: string } | null>(null);
  const inputNota = useRef<HTMLInputElement>(null);

  // Pratinjau foto nota disimpan di memori browser; dilepas saat diganti atau form ditutup.
  useEffect(() => {
    return () => {
      if (nota?.pratinjau) URL.revokeObjectURL(nota.pratinjau);
    };
  }, [nota]);

  function pilihNota(file: File | undefined) {
    if (!file) return;
    const salah = periksaFileLampiran(file);
    if (salah) {
      setGalat((g) => ({ ...g, bukti: salah }));
      return;
    }
    setNota({ file, pratinjau: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
    setGalat((g) => ({ ...g, bukti: undefined }));
  }

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const isian = {
      tanggal: String(d.get("tanggal") ?? ""),
      jumlah: bacaRupiah(String(d.get("jumlah") ?? "")),
      keterangan: String(d.get("keterangan") ?? ""),
      adaBukti: nota !== null,
    };
    const g = periksaPengeluaran(isian, hariIni);
    setGalat(g);
    if (Object.keys(g).length > 0) return;
    // Database dan storage belum tersambung. Di sini nanti nota diunggah lalu transaksi disimpan.
    setHasil({ jumlah: isian.jumlah, keterangan: isian.keterangan.trim() });
  }

  if (hasil) {
    return (
      <HasilSimpan judul={`Pengeluaran ${formatRupiah(hasil.jumlah)} siap dicatat`} tutup={selesai}>
        <p className="text-sm">
          {hasil.keterangan} · nota: <b>{nota?.file.name}</b>
        </p>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-5">
      <md-outlined-text-field name="tanggal" label="Tanggal" type="date" value={hariIni} max={hariIni} error={Boolean(galat.tanggal)} error-text={galat.tanggal} className="w-full" />
      <KolomJumlah galat={galat.jumlah} />
      <md-outlined-text-field name="keterangan" label="Keperluan" placeholder="Contoh: konsumsi pengajian" error={Boolean(galat.keterangan)} error-text={galat.keterangan} className="w-full" />

      {/* Foto nota wajib untuk setiap pengeluaran (KONSEP 5.8) */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-on-surface-variant">Foto nota (wajib)</p>
        {nota ? (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-mid p-2 pr-1">
            <div
              className="grid size-14 shrink-0 place-items-center rounded-xl bg-surface-highest bg-cover bg-center text-xs font-bold text-on-surface-variant"
              style={nota.pratinjau ? { backgroundImage: `url(${nota.pratinjau})` } : undefined}
            >
              {!nota.pratinjau && "PDF"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{nota.file.name}</p>
              <p className="text-xs text-on-surface-variant">{formatUkuran(nota.file.size)}</p>
            </div>
            <button type="button" onClick={() => setNota(null)} aria-label="Hapus nota" className="grid size-9 place-items-center rounded-full hover:bg-surface-highest">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputNota.current?.click()}
            className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-sm font-bold transition-colors hover:bg-surface-highest ${
              galat.bukti ? "border-error" : "border-outline-variant"
            }`}
          >
            <Camera size={18} className="text-primary" /> Ambil atau pilih foto nota
          </button>
        )}
        {/* capture: di HP langsung membuka kamera belakang */}
        <input
          ref={inputNota}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={(e) => {
            pilihNota(e.target.files?.[0]);
            e.target.value = "";
          }}
          className="hidden"
        />
        {galat.bukti && <p className="px-4 text-xs text-error">{galat.bukti}</p>}
      </div>

      <TombolForm batal={selesai} simpan="Catat pengeluaran" />
    </form>
  );
}

// ---------------------------------------------------------------------------

export function FormUbahTransaksi({ transaksi, selesai }: { transaksi: Transaksi; selesai: () => void }) {
  const [galat, setGalat] = useState<GalatSodaqoh>({});
  const [hasil, setHasil] = useState<string | null>(null);

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const isian = {
      jumlah: bacaRupiah(String(d.get("jumlah") ?? "")),
      keterangan: String(d.get("keterangan") ?? ""),
      alasan: String(d.get("alasan") ?? ""),
    };
    const g = periksaPerubahan(isian, transaksi);
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    // Ringkasan perubahan yang nanti disimpan di audit_log bersama alasannya.
    const bagian = [
      isian.jumlah !== transaksi.jumlah ? `Jumlah ${formatRupiah(transaksi.jumlah)} → ${formatRupiah(isian.jumlah)}` : null,
      isian.keterangan.trim() !== transaksi.keterangan ? `Keterangan "${transaksi.keterangan}" → "${isian.keterangan.trim()}"` : null,
    ].filter(Boolean);
    setHasil(`${bagian.join(" · ")}. Alasan: ${isian.alasan.trim()}`);
  }

  if (hasil) {
    return (
      <HasilSimpan judul="Perubahan siap dicatat di riwayat" tutup={selesai}>
        <p className="text-sm">{hasil}</p>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-5">
      <p className="rounded-2xl bg-surface-mid px-4 py-3 text-sm text-on-surface-variant">
        Data sodaqoh tidak bisa dihapus. Perubahan ini akan tercatat di <b className="text-on-surface">riwayat perubahan</b> beserta
        nama kamu dan alasannya.
      </p>
      <KolomJumlah nilaiAwal={transaksi.jumlah} galat={galat.jumlah} />
      <md-outlined-text-field name="keterangan" label="Keterangan" value={transaksi.keterangan} error={Boolean(galat.keterangan)} error-text={galat.keterangan} className="w-full" />
      <md-outlined-text-field
        name="alasan"
        label="Alasan perubahan (wajib)"
        type="textarea"
        rows={2}
        placeholder="Contoh: salah hitung, ada uang terselip"
        error={Boolean(galat.alasan)}
        error-text={galat.alasan}
        className="w-full"
      />
      <TombolForm batal={selesai} simpan="Simpan perubahan" />
    </form>
  );
}
