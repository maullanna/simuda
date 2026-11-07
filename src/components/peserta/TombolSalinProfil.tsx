"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Menyalin teks "PROFIL BIODATA MUDA MUDI" untuk dikirim ke Tim PnKB lewat chat pribadi.
export function TombolSalinProfil({ teks }: { teks: string }) {
  const [tersalin, setTersalin] = useState(false);
  return (
    <md-filled-tonal-button
      has-icon
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(teks);
          setTersalin(true);
          setTimeout(() => setTersalin(false), 2500);
        } catch {
          setTersalin(false);
        }
      }}
    >
      {tersalin ? <Check slot="icon" size={18} /> : <Copy slot="icon" size={18} />}
      {tersalin ? "Tersalin" : "Salin profil"}
    </md-filled-tonal-button>
  );
}
