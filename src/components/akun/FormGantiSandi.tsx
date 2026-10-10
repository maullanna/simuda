"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, KeyRound, LoaderCircle } from "lucide-react";
import { KolomKataSandi } from "@/components/KolomKataSandi";
import { authClient } from "@/lib/auth-client";

type Galat = { sekarang?: string; baru?: string; ulangi?: string; umum?: string };

// Ganti kata sandi sendiri. Kata sandi lama diperiksa Better Auth di server; setelah berhasil
// semua perangkat lain dikeluarkan, perangkat ini tetap masuk.
export function FormGantiSandi() {
  const [sekarang, setSekarang] = useState("");
  const [baru, setBaru] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [galat, setGalat] = useState<Galat>({});
  const [proses, setProses] = useState(false);
  const [berhasil, setBerhasil] = useState(false);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const g: Galat = {};
    if (!sekarang) g.sekarang = "Isi kata sandi yang sekarang";
    if (baru.length < 8) g.baru = "Kata sandi baru minimal 8 karakter";
    else if (baru.length > 128) g.baru = "Kata sandi terlalu panjang";
    else if (baru === sekarang) g.baru = "Pilih kata sandi yang berbeda dari sekarang";
    if (!g.baru && ulangi !== baru) g.ulangi = "Belum sama dengan kata sandi baru";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setProses(true);
    try {
      const { error } = await authClient.changePassword({ currentPassword: sekarang, newPassword: baru, revokeOtherSessions: true });
      if (error) {
        if (error.code === "INVALID_PASSWORD") setGalat({ sekarang: "Kata sandi sekarang salah" });
        else if (error.status === 429) setGalat({ umum: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi." });
        else setGalat({ umum: "Gagal mengganti kata sandi. Coba lagi sebentar lagi." });
        return;
      }
      setBerhasil(true);
    } catch {
      setGalat({ umum: "Gagal tersambung ke server. Periksa koneksi internet lalu coba lagi." });
    } finally {
      setProses(false);
    }
  }

  if (berhasil) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-mid p-5 text-center">
        <CircleCheck size={32} className="text-primary" />
        <p className="font-bold">Kata sandi berhasil diganti</p>
        <p className="text-sm text-on-surface-variant">Perangkat lain yang memakai akunmu sudah dikeluarkan. Di perangkat ini kamu tetap masuk.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={simpan}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof Galat | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined, umum: undefined }));
      }}
      className="flex flex-col gap-4"
    >
      <h2 className="flex items-center gap-2 font-bold">
        <KeyRound size={18} className="text-primary" /> Ganti kata sandi
      </h2>
      {galat.umum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {galat.umum}
        </p>
      )}
      <KolomKataSandi name="sekarang" label="Kata sandi sekarang" nilai={sekarang} ubah={setSekarang} galat={galat.sekarang} autocomplete="current-password" />
      <KolomKataSandi name="baru" label="Kata sandi baru" nilai={baru} ubah={setBaru} galat={galat.baru} />
      <KolomKataSandi name="ulangi" label="Ulangi kata sandi baru" nilai={ulangi} ubah={setUlangi} galat={galat.ulangi} />
      <p className="text-xs text-on-surface-variant">Minimal 8 karakter. Jangan pakai tanggal lahir atau nama sendiri.</p>
      <md-filled-button type="submit" disabled={proses}>
        {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <KeyRound slot="icon" size={18} />}
        {proses ? "Menyimpan..." : "Simpan kata sandi baru"}
      </md-filled-button>
    </form>
  );
}
