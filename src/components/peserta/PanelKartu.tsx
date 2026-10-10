"use client";

import { useState } from "react";
import { CreditCard, LoaderCircle, Printer, RefreshCw } from "lucide-react";
import { gantiKartu } from "@/app/(pengurus)/peserta/aksi";
import { Dialog } from "@/components/Dialog";
import { formatTanggal } from "@/lib/sesi";

const ALASAN = ["Hilang", "Rusak", "Lainnya"];

// Panel kartu peserta di halaman Ubah peserta, termasuk alur kartu hilang (KONSEP 8.5):
// 1) kartu lama dinonaktifkan, 2) token baru dibuat, 3) kartu baru dicetak.
export function PanelKartu({
  pesertaId,
  nama,
  dibuat,
  hariIni,
}: {
  pesertaId: string;
  nama: string;
  dibuat: string;
  hariIni: string;
}) {
  const [terbuka, setTerbuka] = useState(false);
  const [alasan, setAlasan] = useState("Hilang");
  const [diganti, setDiganti] = useState<string | null>(null); // alasan, setelah kartu diganti
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string>();

  // Memanggil Server Action: kartu lama dinonaktifkan dan kartu baru dibuat di database.
  async function ganti() {
    setProses(true);
    setGalat(undefined);
    try {
      const hasil = await gantiKartu(pesertaId, alasan);
      if (!hasil.ok) {
        setGalat(hasil.pesan);
        return;
      }
      setDiganti(alasan);
      setTerbuka(false);
    } catch {
      setGalat("Gagal mengganti kartu. Periksa koneksi lalu coba lagi.");
    } finally {
      setProses(false);
    }
  }

  const urlCetak = `/peserta/kartu?id=${pesertaId}`;

  return (
    <section className="flex max-w-2xl flex-col gap-4 rounded-3xl bg-surface-low p-6">
      <h2 className="font-extrabold">Kartu peserta</h2>

      <div className="flex items-center gap-4 rounded-2xl bg-surface-mid p-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
          <CreditCard size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{diganti ? "Kartu baru siap dicetak" : "Kartu aktif"}</p>
          <p className="text-sm text-on-surface-variant">
            {diganti
              ? `Kartu lama dinonaktifkan hari ini (${diganti.toLowerCase()}).`
              : `Dicetak ${formatTanggal(dibuat, { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <md-filled-tonal-button href={urlCetak}>
          <Printer slot="icon" size={18} />
          {diganti ? "Cetak kartu baru" : "Cetak ulang kartu"}
        </md-filled-tonal-button>
        {!diganti && (
          <md-outlined-button type="button" onClick={() => setTerbuka(true)}>
            <RefreshCw slot="icon" size={18} />
            Kartu hilang / rusak
          </md-outlined-button>
        )}
      </div>
      <p className="text-xs text-on-surface-variant">
        Cetak ulang memakai QR yang sama. Kalau kartu hilang, pakai &quot;Kartu hilang / rusak&quot; supaya kartu lama tidak bisa dipakai orang lain.
      </p>

      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul="Ganti kartu" keterangan={nama}>
        <div className="flex flex-col gap-5">
          <ol className="flex flex-col gap-2 text-sm">
            {[
              "Kartu lama langsung tidak berlaku. Kalau dipindai, muncul \"Kartu tidak dikenal\".",
              "Kartu baru dibuat dengan kode QR baru.",
              "Cetak kartu baru, laminating, lalu berikan ke peserta.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Alasan</legend>
            <div className="flex flex-wrap gap-2">
              {ALASAN.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={alasan === a}
                  onClick={() => setAlasan(a)}
                  className={`h-9 rounded-lg border px-3.5 text-sm font-semibold transition-colors ${
                    alasan === a ? "border-transparent bg-secondary-container text-on-secondary-container" : "border-outline-variant text-on-surface-variant hover:bg-surface-highest"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <md-text-button type="button" onClick={() => setTerbuka(false)}>
              Batal
            </md-text-button>
            <md-filled-button type="button" onClick={ganti} disabled={proses}>
              {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
              {proses ? "Memproses..." : "Nonaktifkan & buat kartu baru"}
            </md-filled-button>
          </div>
          {galat && <p className="text-sm text-error">{galat}</p>}
          <p className="text-xs text-on-surface-variant">Tanggal hari ini ({formatTanggal(hariIni, { day: "numeric", month: "long" })}) dicatat sebagai tanggal kartu lama dinonaktifkan.</p>
        </div>
      </Dialog>
    </section>
  );
}
