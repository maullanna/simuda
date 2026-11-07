"use client";

import { useState } from "react";
import { Ban, CalendarPlus, LoaderCircle, NotebookPen, Plus, RotateCcw } from "lucide-react";
import { batalkanSesi, buatJadwalRutin, pulihkanSesi } from "@/app/(pengurus)/jadwal/aksi";
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
      <md-filled-button has-icon type="button" onClick={() => setTerbuka(true)}>
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
      <md-text-button has-icon type="button" onClick={() => setTerbuka(true)}>
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

// Buat sesi rutin (putra & putri) untuk 2 pekan ke depan. Aman diklik berkali-kali: yang sudah ada dilewati.
export function TombolBuatRutin() {
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState<string>();
  return (
    <div className="flex flex-col items-end gap-1">
      <md-filled-tonal-button
        has-icon
        type="button"
        disabled={proses}
        onClick={async () => {
          setProses(true);
          setPesan(undefined);
          try {
            setPesan((await buatJadwalRutin()).pesan);
          } catch {
            setPesan("Gagal tersambung ke server.");
          } finally {
            setProses(false);
          }
        }}
      >
        {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <CalendarPlus slot="icon" size={18} />}
        Buat jadwal rutin 2 pekan
      </md-filled-tonal-button>
      {pesan && <p className="text-xs text-on-surface-variant">{pesan}</p>}
    </div>
  );
}

// Batalkan sesi yang belum dimulai, atau pulihkan sesi yang dibatalkan. Wajib alasan (KONSEP 3.3).
export function TombolBatalSesi({ sesi }: { sesi: Sesi }) {
  const batal = sesi.status === "batal";
  const [terbuka, setTerbuka] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState<string>();
  const [proses, setProses] = useState(false);

  async function jalankan() {
    if (alasan.trim().length < 5) return setGalat("Tulis alasan minimal 5 karakter.");
    setProses(true);
    setGalat(undefined);
    try {
      const hasil = batal ? await pulihkanSesi(sesi.id, alasan) : await batalkanSesi(sesi.id, alasan);
      if (!hasil.ok) return setGalat(hasil.pesan);
      setTerbuka(false);
      setAlasan("");
    } catch {
      setGalat("Gagal tersambung ke server.");
    } finally {
      setProses(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        aria-label={batal ? "Pulihkan sesi" : "Batalkan sesi"}
        title={batal ? "Pulihkan sesi" : "Batalkan sesi"}
        className={`grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest ${batal ? "hover:text-primary" : "hover:text-error"}`}
      >
        {batal ? <RotateCcw size={16} /> : <Ban size={16} />}
      </button>
      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul={batal ? "Pulihkan sesi" : "Batalkan sesi"} keterangan={keteranganSesi(sesi)}>
        <div className="flex flex-col gap-4">
          <p className="rounded-2xl bg-surface-mid px-4 py-3 text-sm">
            {batal
              ? "Sesi kembali terjadwal dan muncul lagi di absensi."
              : "Sesi tidak muncul di absensi dan tidak dihitung di rekap. Datanya tetap tersimpan dan bisa dipulihkan."}
          </p>
          <md-outlined-text-field
            label="Alasan"
            type="textarea"
            rows={2}
            value={alasan}
            placeholder={batal ? "Contoh: jadi diadakan" : "Contoh: bertepatan dengan pengajian gabungan"}
            onInput={(e) => setAlasan((e.target as HTMLInputElement).value)}
            className="w-full"
          />
          {galat && (
            <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {galat}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <md-text-button type="button" onClick={() => setTerbuka(false)}>
              Batal
            </md-text-button>
            <md-filled-button has-icon={proses} type="button" disabled={proses} onClick={jalankan}>
              {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
              {batal ? "Pulihkan sesi" : "Batalkan sesi"}
            </md-filled-button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
