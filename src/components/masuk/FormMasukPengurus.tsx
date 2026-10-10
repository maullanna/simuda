"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

type Galat = { email?: string; sandi?: string };

// Form masuk pengurus (email + kata sandi). Nanti memakai Better Auth;
// sekarang hanya memeriksa isian lalu memberi tahu bahwa login belum tersambung.
export function FormMasukPengurus() {
  const [lihatSandi, setLihatSandi] = useState(false);
  const [galat, setGalat] = useState<Galat>({});
  const [berhasil, setBerhasil] = useState(false);

  function masuk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "").trim();
    const sandi = String(d.get("sandi") ?? "");
    const g: Galat = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) g.email = "Format email belum benar";
    if (sandi.length < 8) g.sandi = "Kata sandi minimal 8 karakter";
    setGalat(g);
    if (Object.keys(g).length === 0) setBerhasil(true);
  }

  if (berhasil) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
          Login belum tersambung (Better Auth dipasang bersama database). Untuk sekarang, lanjut ke tampilan pengurus dengan data contoh.
        </p>
        <md-filled-button href="/dashboard">Lanjut ke Beranda</md-filled-button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={masuk}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof Galat | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined }));
      }}
      className="flex flex-col gap-4"
    >
      <md-outlined-text-field
        name="email"
        label="Email"
        type="email"
        autocomplete="username"
        error={Boolean(galat.email)}
        error-text={galat.email}
        className="w-full"
      />
      <div className="relative">
        <md-outlined-text-field
          name="sandi"
          label="Kata sandi"
          type={lihatSandi ? "text" : "password"}
          autocomplete="current-password"
          error={Boolean(galat.sandi)}
          error-text={galat.sandi}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => setLihatSandi((x) => !x)}
          aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-highest"
        >
          {lihatSandi ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <md-filled-button type="submit">
        <LogIn slot="icon" size={18} />
        Masuk
      </md-filled-button>
      <p className="text-center text-xs text-on-surface-variant">Lupa kata sandi atau belum punya akun? Hubungi Ketua Muda/i wilayahmu.</p>
    </form>
  );
}
