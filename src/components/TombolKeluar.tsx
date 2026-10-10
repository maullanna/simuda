"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { LabelMelayang } from "@/components/LabelMelayang";
import { authClient } from "@/lib/auth-client";

// Tombol keluar: menghapus sesi di server (cookie ikut dihapus), lalu kembali ke halaman masuk.
export function TombolKeluar({ posisiLabel = "kanan" }: { posisiLabel?: "kanan" | "bawah" }) {
  const router = useRouter();
  const [proses, setProses] = useState(false);

  async function keluar() {
    setProses(true);
    await authClient.signOut();
    router.replace("/masuk");
    router.refresh(); // buang tampilan halaman pengurus yang tersimpan di browser
  }

  return (
    <button
      type="button"
      onClick={keluar}
      disabled={proses}
      aria-label="Keluar"
      className="group relative grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
    >
      {proses ? <LoaderCircle size={17} className="animate-spin" /> : <LogOut size={17} />}
      <LabelMelayang teks="Keluar" posisi={posisiLabel} />
    </button>
  );
}
