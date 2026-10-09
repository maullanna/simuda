"use client";

import { useState, type FormEvent } from "react";
import { EyeOff, Send, Smartphone } from "lucide-react";
import { PANJANG_MASUKAN, periksaMasukan } from "@/lib/masukan";

// Pratinjau form "Kirim masukan" yang nanti dipakai peserta di HP (tahap 2).
// Di sini bisa dicoba, tapi tidak mengirim apa pun.
export function PratinjauFormMasukan() {
  const [isi, setIsi] = useState("");
  const [tanpaNama, setTanpaNama] = useState(false);
  const [galat, setGalat] = useState<string>();
  const [terkirim, setTerkirim] = useState(false);

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const g = periksaMasukan(isi);
    setGalat(g);
    if (!g) setTerkirim(true);
  }

  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-tertiary-container text-on-tertiary-container">
          <Smartphone size={18} />
        </div>
        <div>
          <h2 className="font-extrabold">Pratinjau form peserta</h2>
          <p className="text-sm text-on-surface-variant">Begini peserta akan mengirim masukan dari HP (tahap 2). Bisa dicoba, tidak terkirim.</p>
        </div>
      </div>

      {/* Bingkai mirip layar HP */}
      <div className="mx-auto w-full max-w-xs rounded-[32px] border-[6px] border-surface-highest bg-surface p-4">
        {terkirim ? (
          <div className="muncul flex flex-col items-center gap-2 py-8 text-center" style={{ animationDuration: "300ms" }}>
            <div className="grid size-14 animate-[letup_600ms_cubic-bezier(0.34,1.56,0.64,1)] place-items-center rounded-full bg-primary-container text-on-primary-container">
              <Send size={24} />
            </div>
            <p className="font-extrabold">Jazakallahu khairan!</p>
            <p className="text-sm text-on-surface-variant">
              Masukanmu sudah diterima pengurus{tanpaNama ? " tanpa nama" : ""}.
            </p>
            <button
              type="button"
              onClick={() => {
                setTerkirim(false);
                setIsi("");
              }}
              className="mt-2 text-sm font-bold text-primary hover:underline"
            >
              Kirim masukan lain
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={kirim} className="flex flex-col gap-3">
            <p className="font-extrabold">Kirim masukan</p>
            <p className="text-xs text-on-surface-variant">Ceritakan apa yang bisa membuat pengajian lebih baik.</p>
            <textarea
              value={isi}
              onChange={(e) => {
                setIsi(e.target.value);
                setGalat(undefined);
              }}
              rows={5}
              maxLength={PANJANG_MASUKAN.maks}
              placeholder="Tulis masukanmu di sini..."
              aria-label="Isi masukan"
              className={`resize-none rounded-2xl border bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-on-surface-variant focus:border-2 focus:border-primary ${galat ? "border-error" : "border-outline"}`}
            />
            <div className="flex justify-between px-1 text-xs">
              <span className="text-error">{galat}</span>
              <span className="text-on-surface-variant">
                {isi.trim().length}/{PANJANG_MASUKAN.maks}
              </span>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-surface-mid p-3 text-sm">
              <input type="checkbox" checked={tanpaNama} onChange={(e) => setTanpaNama(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span>
                <span className="flex items-center gap-1 font-bold">
                  <EyeOff size={14} /> Kirim tanpa nama
                </span>
                <span className="block text-xs text-on-surface-variant">Namamu tidak disimpan sama sekali, pengurus pun tidak tahu.</span>
              </span>
            </label>
            <md-filled-button type="submit">
              <Send slot="icon" size={16} />
              Kirim
            </md-filled-button>
          </form>
        )}
      </div>
    </section>
  );
}
