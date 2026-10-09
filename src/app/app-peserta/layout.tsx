import type { Metadata } from "next";
import { NavBawah } from "@/components/peserta-app/NavBawah";

export const metadata: Metadata = {
  title: "SIMUDA · Peserta",
};

// Tampilan peserta di HP (KONSEP 4.3). Lebarnya dibatasi seperti layar HP;
// kalau dibuka di laptop, tampil di tengah. pb-28 memberi ruang untuk navigasi bawah.
export default function AppPesertaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-surface pb-28 md:border-x md:border-outline-variant/60">
      {children}
      <NavBawah />
    </div>
  );
}
