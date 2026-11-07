"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, Eye, LoaderCircle, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { hapusPeserta, pulihkanPeserta, suspendPeserta, type HasilStatus } from "@/app/(pengurus)/peserta/aksi";
import { Dialog } from "@/components/Dialog";

type Hak = { ubah: boolean; suspend: boolean; hapus: boolean };
type Mode = "suspend" | "pulihkan" | "hapus" | null;

const ikon =
  "grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface disabled:pointer-events-none disabled:opacity-30";

function KotakGalat({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
      {pesan}
    </p>
  );
}

// Isi dialog suspend / pulihkan / hapus. Tombolnya type="button" (bukan submit form)
// supaya tidak ada pengiriman form dari tombol Material.
function IsiDialog({ mode, id, nama, tutup }: { mode: Exclude<Mode, null>; id: string; nama: string; tutup: () => void }) {
  const [alasan, setAlasan] = useState("");
  const [ketikNama, setKetikNama] = useState("");
  const [samarkan, setSamarkan] = useState(false);
  const [galat, setGalat] = useState<string>();
  const [proses, setProses] = useState(false);

  async function jalankan() {
    if (alasan.trim().length < 5) return setGalat("Tulis alasan minimal 5 karakter.");
    if (mode === "hapus" && ketikNama.trim().toLowerCase() !== nama.toLowerCase()) return setGalat("Nama yang diketik tidak sama.");
    setProses(true);
    setGalat(undefined);
    let hasil: HasilStatus;
    try {
      hasil =
        mode === "suspend"
          ? await suspendPeserta(id, alasan)
          : mode === "pulihkan"
            ? await pulihkanPeserta(id, alasan)
            : await hapusPeserta(id, ketikNama, alasan, samarkan);
    } catch {
      hasil = { ok: false, pesan: "Gagal tersambung ke server. Periksa koneksi internet lalu coba lagi." };
    }
    setProses(false);
    if (!hasil.ok) return setGalat(hasil.pesan);
    tutup();
  }

  const keterangan = {
    suspend: "Peserta tidak muncul di absensi dan kartunya tidak berlaku. Data dan riwayat kehadirannya tetap tersimpan, dan bisa dipulihkan kapan saja.",
    pulihkan: "Peserta aktif lagi dan dibuatkan kartu baru (kartu lama tetap tidak berlaku, cetak ulang kartunya).",
    hapus: "Peserta, kartu, biodata, dan SELURUH riwayat kehadirannya dihapus permanen, sehingga rekap bulan-bulan lalu ikut berubah. Tidak bisa dibatalkan. Salinannya disimpan di riwayat perubahan.",
  }[mode];

  return (
    <div className="flex flex-col gap-4">
      <p className={`rounded-2xl px-4 py-3 text-sm ${mode === "hapus" ? "bg-error-container text-on-error-container" : "bg-surface-mid"}`}>{keterangan}</p>
      {mode === "hapus" && (
        <md-outlined-text-field
          label={`Ketik ulang nama: ${nama}`}
          value={ketikNama}
          autocomplete="off"
          onInput={(e) => setKetikNama((e.target as HTMLInputElement).value)}
          className="w-full"
        />
      )}
      <md-outlined-text-field
        label="Alasan"
        type="textarea"
        rows={3}
        value={alasan}
        placeholder={mode === "suspend" ? "Contoh: pindah domisili, sudah menikah" : mode === "pulihkan" ? "Contoh: kembali aktif mengaji" : "Contoh: data ganda"}
        onInput={(e) => setAlasan((e.target as HTMLInputElement).value)}
        className="w-full"
      />
      {mode === "hapus" && (
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={samarkan} onChange={(e) => setSamarkan(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
          <span>
            <b>Permintaan hapus data pribadi.</b> Salinan di riwayat tidak menyimpan nama, no HP, tanggal lahir, dan biodata.
          </span>
        </label>
      )}
      <KotakGalat pesan={galat} />
      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={tutup}>
          Batal
        </md-text-button>
        {mode === "pulihkan" ? (
          <md-filled-button has-icon type="button" disabled={proses} onClick={jalankan}>
            {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <RotateCcw slot="icon" size={18} />}
            Pulihkan
          </md-filled-button>
        ) : (
          <button
            type="button"
            disabled={proses}
            onClick={jalankan}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-error px-5 text-sm font-semibold text-on-error transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {proses ? <LoaderCircle size={18} className="animate-spin" /> : mode === "hapus" ? <Trash2 size={18} /> : <Ban size={18} />}
            {mode === "hapus" ? "Hapus permanen" : "Suspend"}
          </button>
        )}
      </div>
    </div>
  );
}

// Kolom aksi di tabel peserta: lihat, ubah, suspend/pulihkan, hapus permanen (hanya Administrator).
// Tombol yang tidak boleh tidak ditampilkan; server tetap memeriksa ulang setiap aksi.
export function AksiBarisPeserta({ id, nama, aktif, hak }: { id: string; nama: string; aktif: boolean; hak: Hak }) {
  const [mode, setMode] = useState<Mode>(null);
  const judul = { suspend: `Suspend ${nama}`, pulihkan: `Pulihkan ${nama}`, hapus: `Hapus permanen ${nama}` };

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/peserta/${id}`} aria-label={`Lihat ${nama}`} title="Lihat detail" className={ikon}>
        <Eye size={17} />
      </Link>
      {hak.ubah && (
        <Link href={`/peserta/${id}/ubah`} aria-label={`Ubah ${nama}`} title="Ubah" className={ikon}>
          <Pencil size={16} />
        </Link>
      )}
      {hak.suspend &&
        (aktif ? (
          <button type="button" onClick={() => setMode("suspend")} aria-label={`Suspend ${nama}`} title="Suspend" className={`${ikon} hover:text-error`}>
            <Ban size={16} />
          </button>
        ) : (
          <button type="button" onClick={() => setMode("pulihkan")} aria-label={`Pulihkan ${nama}`} title="Pulihkan" className={`${ikon} hover:text-primary`}>
            <RotateCcw size={16} />
          </button>
        ))}
      {hak.hapus && (
        <button
          type="button"
          onClick={() => setMode("hapus")}
          disabled={aktif}
          aria-label={`Hapus permanen ${nama}`}
          title={aktif ? "Suspend dulu sebelum menghapus permanen" : "Hapus permanen"}
          className={`${ikon} hover:text-error`}
        >
          <Trash2 size={16} />
        </button>
      )}
      <Dialog terbuka={mode !== null} tutup={() => setMode(null)} judul={mode ? judul[mode] : ""}>
        {mode && <IsiDialog mode={mode} id={id} nama={nama} tutup={() => setMode(null)} />}
      </Dialog>
    </div>
  );
}
