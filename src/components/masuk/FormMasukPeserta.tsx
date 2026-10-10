"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

const JEDA_KIRIM_ULANG = 60; // detik

// Masuk peserta dengan kode OTP lewat WhatsApp (tahap 2, KONSEP 5.12).
// Langkah 1: isi no WhatsApp. Langkah 2: isi kode 6 angka yang dikirim.
export function FormMasukPeserta() {
  const [langkah, setLangkah] = useState<"nomor" | "kode" | "selesai">("nomor");
  const [noHp, setNoHp] = useState("");
  const [kode, setKode] = useState("");
  const [galat, setGalat] = useState<string>();
  const [sisaDetik, setSisaDetik] = useState(0);
  const [fokus, setFokus] = useState(false); // kolom kode sedang aktif, untuk menyorot kotak berikutnya
  const inputKode = useRef<HTMLInputElement>(null);

  // Hitung mundur sebelum boleh minta kode lagi.
  useEffect(() => {
    if (sisaDetik <= 0) return;
    const t = setTimeout(() => setSisaDetik((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sisaDetik]);

  function kirimKode(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const bersih = noHp.replace(/[\s-]/g, "");
    if (!/^(\+62|62|0)8\d{7,11}$/.test(bersih)) {
      setGalat("Format no WhatsApp belum benar, contoh 081234567890");
      return;
    }
    // Database dan WhatsApp (Fonnte) belum tersambung. Nanti: server mengirim kode lewat WhatsApp.
    setGalat(undefined);
    setKode("");
    setLangkah("kode");
    setSisaDetik(JEDA_KIRIM_ULANG);
    setTimeout(() => inputKode.current?.focus(), 50);
  }

  function cekKode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (kode.length !== 6) {
      setGalat("Isi 6 angka kode dari WhatsApp");
      return;
    }
    setLangkah("selesai");
  }

  if (langkah === "selesai") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
          Login peserta belum tersambung (dikerjakan di tahap 2). Untuk sekarang, lanjut ke tampilan peserta dengan data contoh.
        </p>
        <md-filled-button href="/app-peserta">Lanjut ke tampilan peserta</md-filled-button>
      </div>
    );
  }

  if (langkah === "kode") {
    return (
      <form noValidate onSubmit={cekKode} className="flex flex-col gap-4">
        <p className="text-center text-sm">
          Kode 6 angka sudah dikirim ke WhatsApp <b>{noHp}</b>.
        </p>

        {/* Satu kolom isian yang tampil sebagai 6 kotak, supaya kode bisa ditempel atau terisi otomatis */}
        <label className="relative mx-auto block">
          <span className="sr-only">Kode OTP</span>
          <input
            ref={inputKode}
            value={kode}
            onChange={(e) => {
              setKode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setGalat(undefined);
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            onFocus={() => setFokus(true)}
            onBlur={() => setFokus(false)}
            className="absolute inset-0 z-10 opacity-0"
          />
          <span aria-hidden className="flex gap-2">
            {Array.from({ length: 6 }, (_, i) => {
              const aktif = fokus && i === Math.min(kode.length, 5);
              return (
                <span
                  key={i}
                  className={`grid h-14 w-11 place-items-center rounded-xl border-2 text-2xl font-extrabold transition-colors ${
                    galat ? "border-error" : aktif ? "border-primary" : kode[i] ? "border-outline" : "border-outline-variant"
                  } ${kode[i] ? "bg-surface" : ""}`}
                >
                  {kode[i] ?? ""}
                </span>
              );
            })}
          </span>
        </label>
        {galat && <p className="text-center text-xs text-error">{galat}</p>}

        <md-filled-button type="submit">Masuk</md-filled-button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setLangkah("nomor")} className="font-semibold text-on-surface-variant hover:underline">
            Ganti nomor
          </button>
          <button
            type="button"
            disabled={sisaDetik > 0}
            onClick={() => kirimKode()}
            className="font-bold text-primary hover:underline disabled:text-on-surface-variant disabled:no-underline"
          >
            {sisaDetik > 0 ? `Kirim ulang (${sisaDetik})` : "Kirim ulang kode"}
          </button>
        </div>
        <p className="text-center text-xs text-on-surface-variant">Mode tampilan: 6 angka apa pun diterima.</p>
      </form>
    );
  }

  return (
    <form noValidate onSubmit={kirimKode} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-on-surface-variant">No WhatsApp</span>
        <input
          value={noHp}
          onChange={(e) => {
            setNoHp(e.target.value);
            setGalat(undefined);
          }}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="081234567890"
          className={`h-14 rounded-xl border bg-transparent px-4 text-lg outline-none placeholder:text-on-surface-variant/60 focus:border-2 focus:border-primary ${
            galat ? "border-error" : "border-outline"
          }`}
        />
        {galat && <span className="px-1 text-xs text-error">{galat}</span>}
      </label>
      <md-filled-button type="submit">
        <MessageCircle slot="icon" size={18} />
        Kirim kode lewat WhatsApp
      </md-filled-button>
      <p className="text-center text-xs text-on-surface-variant">Pakai nomor yang terdaftar di pengurus. Belum terdaftar? Hubungi pengurus wilayahmu.</p>
    </form>
  );
}
