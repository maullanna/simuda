import Link from "next/link";
import { Check } from "lucide-react";

// Chip filter gaya Material 3. Berupa link biasa, jadi filternya tersimpan di URL.
export function FilterChip({ label, href, aktif }: { label: string; href: string; aktif: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-pressed={aktif}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors ${
        aktif
          ? "border-transparent bg-secondary-container text-on-secondary-container"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-high"
      }`}
    >
      {aktif && <Check size={16} />}
      {label}
    </Link>
  );
}
