import Link from "next/link";
import { UserCog } from "lucide-react";
import { LabelMelayang } from "@/components/LabelMelayang";

// Tautan ke halaman Akun saya (ganti kata sandi), bentuknya sama dengan TombolKeluar.
export function TombolAkunSaya({ posisiLabel = "kanan", saatNavigasi }: { posisiLabel?: "kanan" | "bawah"; saatNavigasi?: () => void }) {
  return (
    <Link
      href="/akun"
      onClick={saatNavigasi}
      aria-label="Akun saya"
      className="group relative grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest hover:text-on-surface"
    >
      <UserCog size={17} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-12" />
      <LabelMelayang teks="Akun saya" posisi={posisiLabel} />
    </Link>
  );
}
