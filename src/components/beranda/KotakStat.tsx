import type { LucideIcon } from "lucide-react";

// Kotak statistik. Kotaknya sendiri diam saat hover; hanya lingkaran ikonnya
// yang membesar sambil sedikit berputar.
export function KotakStat({
  ikon: Ikon,
  label,
  nilai,
  catatan,
  jeda,
  children,
}: {
  ikon: LucideIcon;
  label: string;
  nilai: React.ReactNode;
  catatan: React.ReactNode;
  jeda: number;
  children?: React.ReactNode;
}) {
  return (
    <article
      className="muncul group flex flex-col gap-3 rounded-[28px] bg-surface-low p-5"
      style={{ animationDelay: `${jeda}ms` }}
    >
      <div className="grid size-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110">
        <Ikon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="text-2xl font-extrabold">{nilai}</p>
      </div>
      {children}
      <p className="mt-auto text-xs text-on-surface-variant">{catatan}</p>
    </article>
  );
}

// Baris statistik kecil untuk tumpukan di samping kalender.
export function BarisStat({
  ikon: Ikon,
  label,
  nilai,
  jeda,
}: {
  ikon: LucideIcon;
  label: string;
  nilai: React.ReactNode;
  jeda: number;
}) {
  return (
    <article
      className="muncul group flex flex-1 items-center gap-4 rounded-3xl bg-surface-low px-5 py-4"
      style={{ animationDelay: `${jeda}ms` }}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-highest transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
        <Ikon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="text-xl font-extrabold">{nilai}</p>
      </div>
    </article>
  );
}
