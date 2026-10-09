"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Menyalin ringkasan rekap untuk dibagikan ke grup WhatsApp.
// Isinya hanya angka positif, tanpa nama yang absen (KONSEP bagian 6).
export function TombolSalinRingkasan({ teks }: { teks: string }) {
  const [tersalin, setTersalin] = useState(false);

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Clipboard bisa ditolak browser (misalnya bukan HTTPS); tampilkan teksnya agar bisa disalin manual.
      window.prompt("Salin ringkasan ini:", teks);
    }
  }

  return (
    <md-filled-tonal-button type="button" onClick={salin}>
      {tersalin ? <Check slot="icon" size={18} /> : <Copy slot="icon" size={18} />}
      {tersalin ? "Tersalin" : "Salin ringkasan untuk grup"}
    </md-filled-tonal-button>
  );
}
