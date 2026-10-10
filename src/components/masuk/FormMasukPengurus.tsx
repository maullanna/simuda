"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Galat = { email?: string; sandi?: string; umum?: string };

// Form masuk pengurus: email + kata sandi, diperiksa oleh Better Auth di server.
export function FormMasukPengurus({ tujuan }: { tujuan: string }) {
  const router = useRouter();
  const [lihatSandi, setLihatSandi] = useState(false);
  const [galat, setGalat] = useState<Galat>({});
  const [proses, setProses] = useState(false);

  async function masuk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "").trim().toLowerCase();
    const sandi = String(d.get("sandi") ?? "");

    // Pemeriksaan cepat di browser; pemeriksaan sesungguhnya tetap di server.
    const g: Galat = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) g.email = "Format email belum benar";
    if (sandi.length < 8) g.sandi = "Kata sandi minimal 8 karakter";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setProses(true);
    const { error } = await authClient.signIn.email({ email, password: sandi });
    if (error) {
      setProses(false);
      // Pesan sengaja sama untuk email tidak terdaftar dan kata sandi salah,
      // supaya orang lain tidak bisa menebak email mana yang terdaftar.
      setGalat({
        umum:
          error.status === 429
            ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
            : error.status === 403
              ? "Akses akunmu sedang dicabut. Hubungi Ketua Muda/i wilayahmu."
              : "Email atau kata sandi salah.",
      });
      return;
    }
    // Berhasil: cookie sesi sudah terpasang. Layout akan mengarahkan petugas scan ke /scan.
    router.replace(tujuan);
    router.refresh();
  }

  return (
    <form
      noValidate
      onSubmit={masuk}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof Galat | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined, umum: undefined }));
      }}
      className="flex flex-col gap-4"
    >
      {galat.umum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {galat.umum}
        </p>
      )}
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
      <md-filled-button type="submit" disabled={proses}>
        {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <LogIn slot="icon" size={18} />}
        {proses ? "Memeriksa..." : "Masuk"}
      </md-filled-button>
      <p className="text-center text-xs text-on-surface-variant">Lupa kata sandi atau belum punya akun? Hubungi Ketua Muda/i wilayahmu.</p>
    </form>
  );
}
