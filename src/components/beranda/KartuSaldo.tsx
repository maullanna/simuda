import Link from "next/link";
import { Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/format";

// Kartu saldo sodaqoh, bergaya seperti kartu dompet. Seluruh kartu adalah link ke /sodaqoh.
export function KartuSaldo({ saldo, masuk, keluar }: { saldo: number; masuk: number; keluar: number }) {
  return (
    <Link
      href="/sodaqoh"
      className="muncul group relative isolate flex min-h-56 flex-col justify-between overflow-hidden rounded-[28px] bg-linear-to-br from-primary-container to-primary/60 p-5 text-on-primary-container"
      style={{ animationDelay: "240ms" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-surface/20 transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute -bottom-16 -left-10 size-48 rounded-full bg-primary/20 transition-transform duration-700 group-hover:translate-x-6" />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-sm font-extrabold text-on-primary">S</div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold">Sodaqoh</p>
            <p className="text-xs opacity-75">Kas bersama</p>
          </div>
        </div>
        <Wallet size={20} className="opacity-70 transition-transform duration-500 group-hover:-rotate-12" />
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold opacity-75">Saldo saat ini</p>
        <p className="text-3xl font-extrabold tracking-tight">{formatRupiah(saldo)}</p>
      </div>

      <div className="flex items-end justify-between gap-3 text-xs">
        <p className="shrink-0 font-semibold">Bendlay 2 & 4</p>
        <p className="text-right opacity-80">
          +{formatRupiah(masuk)} masuk · {formatRupiah(keluar)} keluar bulan ini
        </p>
      </div>
    </Link>
  );
}
