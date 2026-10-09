"use client";

import { useState, type FormEvent } from "react";
import { HeartHandshake, Send } from "lucide-react";
import { Dialog } from "@/components/Dialog";

export type OpsiIzinPeserta = { id: string; label: string; keterangan: string };

const ALASAN = ["Sakit", "Acara keluarga", "Sekolah / kerja", "Lainnya"];

// Peserta mengabari izin sendiri dari HP (tahap 2, KONSEP 5.4).
// Izin tidak perlu persetujuan dan langsung tercatat. Bahasanya dibuat ringan dan tidak menghakimi.
export function TombolKabariIzin({ opsi, varian = "tonal" }: { opsi: OpsiIzinPeserta[]; varian?: "tonal" | "teks" }) {
  const [terbuka, setTerbuka] = useState(false);
  const [sesiId, setSesiId] = useState(opsi[0]?.id ?? "");
  const [alasan, setAlasan] = useState("");
  const [lainnya, setLainnya] = useState("");
  const [galat, setGalat] = useState<string>();
  const [terkirim, setTerkirim] = useState(false);

  function buka() {
    setSesiId(opsi[0]?.id ?? "");
    setAlasan("");
    setLainnya("");
    setGalat(undefined);
    setTerkirim(false);
    setTerbuka(true);
  }

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!alasan) return setGalat("Pilih salah satu keterangan");
    if (alasan === "Lainnya" && lainnya.trim().length < 3) return setGalat("Tulis keterangan singkat");
    // Database belum tersambung. Di sini nanti memanggil Server Action (status: izin).
    setTerkirim(true);
  }

  const terpilih = opsi.find((o) => o.id === sesiId);

  return (
    <>
      {varian === "tonal" ? (
        <md-filled-tonal-button type="button" onClick={buka} disabled={opsi.length === 0}>
          <HeartHandshake slot="icon" size={18} />
          Kabari izin
        </md-filled-tonal-button>
      ) : (
        <md-text-button type="button" onClick={buka} disabled={opsi.length === 0}>
          Kabari izin
        </md-text-button>
      )}

      <Dialog terbuka={terbuka} tutup={() => setTerbuka(false)} judul={terkirim ? "Terima kasih sudah mengabari" : "Kabari izin"} lembarBawah>
        {terkirim ? (
          <div className="flex flex-col items-center gap-3 pb-2 text-center">
            <div className="grid size-16 animate-[letup_600ms_cubic-bezier(0.34,1.56,0.64,1)] place-items-center rounded-full bg-primary-container text-on-primary-container">
              <HeartHandshake size={28} />
            </div>
            <p className="text-sm">
              Izinmu untuk <b>{terpilih?.label}</b> sudah tersampaikan ke pengurus. Semoga urusannya lancar, sampai jumpa di pengajian
              berikutnya.
            </p>
            <p className="rounded-2xl bg-warning-container px-3 py-2 text-xs text-on-warning-container">
              Mode tampilan: belum benar-benar terkirim karena database belum tersambung.
            </p>
            <md-filled-button type="button" onClick={() => setTerbuka(false)}>
              Tutup
            </md-filled-button>
          </div>
        ) : (
          <form noValidate onSubmit={kirim} className="flex flex-col gap-5">
            <p className="text-sm text-on-surface-variant">Tidak perlu menunggu persetujuan. Kabari sebelum pengajian dimulai, ya.</p>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Pengajian</legend>
              {opsi.map((o) => {
                const aktif = o.id === sesiId;
                return (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer flex-col rounded-2xl border px-4 py-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                      aktif ? "border-transparent bg-secondary-container text-on-secondary-container" : "border-outline-variant hover:bg-surface-highest"
                    }`}
                  >
                    <input type="radio" name="sesi" value={o.id} checked={aktif} onChange={() => setSesiId(o.id)} className="sr-only" />
                    <span className="text-sm font-bold">{o.label}</span>
                    <span className="text-xs opacity-75">{o.keterangan}</span>
                  </label>
                );
              })}
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Keterangan</legend>
              <div className="flex flex-wrap gap-2">
                {ALASAN.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={alasan === a}
                    onClick={() => {
                      setAlasan(a);
                      setGalat(undefined);
                    }}
                    className={`h-9 rounded-lg border px-3.5 text-sm font-semibold transition-colors ${
                      alasan === a ? "border-transparent bg-secondary-container text-on-secondary-container" : "border-outline-variant text-on-surface-variant hover:bg-surface-highest"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {alasan === "Lainnya" && (
                <input
                  value={lainnya}
                  onChange={(e) => {
                    setLainnya(e.target.value);
                    setGalat(undefined);
                  }}
                  maxLength={200}
                  placeholder="Contoh: menjenguk saudara"
                  aria-label="Keterangan izin"
                  className="mt-1 h-11 rounded-xl border border-outline bg-transparent px-4 text-sm outline-none focus:border-2 focus:border-primary"
                />
              )}
              {galat && <p className="px-1 text-xs text-error">{galat}</p>}
            </fieldset>

            <md-filled-button type="submit">
              <Send slot="icon" size={16} />
              Kirim
            </md-filled-button>
          </form>
        )}
      </Dialog>
    </>
  );
}
