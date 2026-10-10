"use client";

import { useState } from "react";
import { Dices, Eye, EyeOff } from "lucide-react";

// Kata sandi acak 12 karakter tanpa huruf yang mudah tertukar (l/1, O/0), supaya gampang diketik ulang.
const HURUF = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function kataSandiAcak(panjang = 12): string {
  const hasil: string[] = [];
  const batas = Math.floor(2 ** 32 / HURUF.length) * HURUF.length; // buang angka di atas batas agar tiap huruf sama peluangnya
  while (hasil.length < panjang) {
    for (const n of crypto.getRandomValues(new Uint32Array(panjang))) {
      if (n < batas && hasil.length < panjang) hasil.push(HURUF[n % HURUF.length]);
    }
  }
  return hasil.join("");
}

// Kolom kata sandi dengan tombol tampilkan/sembunyikan, dan (opsional) tombol "Buat acak".
// Nilainya dikontrol dari luar karena tombol acak perlu mengisi kolom ini.
export function KolomKataSandi({
  name,
  label,
  nilai,
  ubah,
  galat,
  autocomplete = "new-password",
  bolehAcak = false,
}: {
  name: string;
  label: string;
  nilai: string;
  ubah: (nilai: string) => void;
  galat?: string;
  autocomplete?: string;
  bolehAcak?: boolean;
}) {
  const [lihat, setLihat] = useState(false);
  return (
    <div className="flex items-start gap-2">
      <div className="relative min-w-0 flex-1">
        <md-outlined-text-field
          name={name}
          label={label}
          type={lihat ? "text" : "password"}
          autocomplete={autocomplete}
          value={nilai}
          onInput={(e) => ubah((e.target as HTMLInputElement).value)}
          error={Boolean(galat)}
          error-text={galat}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => setLihat((x) => !x)}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-highest"
        >
          {lihat ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {bolehAcak && (
        <button
          type="button"
          onClick={() => {
            ubah(kataSandiAcak());
            setLihat(true);
          }}
          className="inline-flex h-14 shrink-0 items-center gap-1.5 rounded-2xl bg-secondary-container px-3 text-sm font-bold text-on-secondary-container transition-colors hover:bg-secondary-container/80"
        >
          <Dices size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-45" />
          Acak
        </button>
      )}
    </div>
  );
}
