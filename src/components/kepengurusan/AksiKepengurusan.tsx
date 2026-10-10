"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Pencil, UserPlus } from "lucide-react";
import { simpanPengurus } from "@/app/(pengurus)/kepengurusan/aksi";
import { Dialog } from "@/components/Dialog";
import { PilihanSegmen } from "@/components/PilihanSegmen";
import { PERAN_PENGURUS, labelPeran, periksaPengurus, type GalatPengurus, type Pengurus } from "@/lib/kepengurusan";

// Form tambah/ubah pengurus. Hanya Wakil dan Ketua (+ Administrator) yang boleh; server memeriksa ulang.
function FormPengurus({ pengurus, selesai }: { pengurus?: Pengurus; selesai: () => void }) {
  const [galat, setGalat] = useState<GalatPengurus>({});
  const [pesanUmum, setPesanUmum] = useState<string>();
  const [proses, setProses] = useState(false);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    // 1) Pemeriksaan cepat di browser.
    const g = periksaPengurus({
      nama: String(d.get("nama") ?? ""),
      jabatan: String(d.get("jabatan") ?? ""),
      wilayah: String(d.get("wilayah") ?? ""),
      peran: String(d.get("peran") ?? ""),
    });
    setGalat(g);
    setPesanUmum(undefined);
    if (Object.keys(g).length > 0) return;

    // 2) Simpan lewat Server Action (hak akses & isian diperiksa ulang di server).
    setProses(true);
    try {
      const hasil = await simpanPengurus(pengurus?.id ?? null, d);
      if (!hasil.ok) {
        setGalat((hasil.galat ?? {}) as GalatPengurus);
        setPesanUmum(hasil.galat ? undefined : hasil.pesan);
        return;
      }
      selesai(); // daftar di halaman ikut diperbarui oleh revalidatePath di server
    } catch {
      setPesanUmum("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={simpan}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof GalatPengurus | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined }));
      }}
      className="flex flex-col gap-5"
    >
      {pesanUmum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {pesanUmum}
        </p>
      )}
      <md-outlined-text-field name="nama" label="Nama lengkap" value={pengurus?.nama ?? ""} error={Boolean(galat.nama)} error-text={galat.nama} className="w-full" />
      <md-outlined-text-field
        name="jabatan"
        label="Jabatan"
        value={pengurus?.jabatan ?? ""}
        placeholder="Contoh: Seksi Acara"
        error={Boolean(galat.jabatan)}
        error-text={galat.jabatan}
        className="w-full"
      />
      <PilihanSegmen
        label="Wilayah"
        name="wilayah"
        nilaiAwal={pengurus?.wilayah}
        error={galat.wilayah}
        pilihan={[
          { nilai: "Pimpinan", label: "Pimpinan" },
          { nilai: "Bendlay 2", label: "Bendlay 2" },
          { nilai: "Bendlay 4", label: "Bendlay 4" },
        ]}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-on-surface-variant">Peran di sistem (menentukan hak akses)</span>
        <select
          name="peran"
          defaultValue={pengurus?.peran ?? ""}
          className={`h-14 cursor-pointer rounded-[4px] border bg-transparent px-4 text-on-surface outline-none focus:border-2 focus:border-primary ${galat.peran ? "border-error" : "border-outline"}`}
        >
          <option value="" disabled>
            Pilih peran
          </option>
          {PERAN_PENGURUS.map((p) => (
            <option key={p} value={p}>
              {labelPeran[p]}
            </option>
          ))}
        </select>
        {galat.peran && <span className="px-4 text-xs text-error">{galat.peran}</span>}
      </label>
      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="submit" disabled={proses}>
          {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
          {proses ? "Menyimpan..." : pengurus ? "Simpan perubahan" : "Tambah pengurus"}
        </md-filled-button>
      </div>
    </form>
  );
}

export function TombolTambahPengurus() {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <md-filled-button type="button" onClick={() => setTerbuka(true)}>
        <UserPlus slot="icon" size={18} />
        Tambah pengurus
      </md-filled-button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Tambah pengurus">
        <FormPengurus selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}

export function TombolUbahPengurus({ pengurus }: { pengurus: Pengurus }) {
  const [terbuka, setTerbuka] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        aria-label={`Ubah ${pengurus.nama}`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant opacity-60 transition-all hover:bg-surface-highest hover:text-on-surface hover:opacity-100 group-hover:opacity-100"
      >
        <Pencil size={16} />
      </button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Ubah pengurus" keterangan={`${pengurus.jabatan} · ${pengurus.wilayah}`}>
        <FormPengurus pengurus={pengurus} selesai={() => setTerbuka(false)} />
      </Dialog>
    </>
  );
}
