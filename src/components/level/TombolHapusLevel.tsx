"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { hapusLevel } from "@/app/(pengurus)/level-pengguna/aksi";

// Hapus level yang tidak dipakai. Dua kali klik: pertama minta konfirmasi, kedua menghapus.
export function TombolHapusLevel({ id, nama, dipakai }: { id: string; nama: string; dipakai: number }) {
  const [yakin, setYakin] = useState(false);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string>();

  if (dipakai > 0) {
    return <span className="text-xs text-on-surface-variant">Dipakai {dipakai} pengurus, tidak bisa dihapus</span>;
  }

  async function hapus() {
    setProses(true);
    try {
      const hasil = await hapusLevel(id);
      if (!hasil.ok) setGalat(hasil.pesan);
    } catch {
      setGalat("Gagal tersambung ke server.");
    } finally {
      setProses(false);
      setYakin(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {galat && <span className="text-xs text-error">{galat}</span>}
      {yakin ? (
        <>
          <button type="button" onClick={() => setYakin(false)} className="h-9 rounded-full px-3 text-xs font-bold text-on-surface-variant hover:bg-surface-highest">
            Batal
          </button>
          <button
            type="button"
            onClick={hapus}
            disabled={proses}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-error px-3 text-xs font-bold text-on-error hover:opacity-90 disabled:opacity-50"
          >
            {proses ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Ya, hapus {nama}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setYakin(true)}
          aria-label={`Hapus level ${nama}`}
          title="Hapus level"
          className="grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-error"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
