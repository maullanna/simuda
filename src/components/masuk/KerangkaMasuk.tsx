import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TombolTema } from "@/components/TombolTema";

// Kerangka halaman masuk: kartu di tengah layar dengan logo, judul, dan tombol kembali.
// Dipakai juga oleh halaman Akun saya, dengan tombol kembali ke Beranda/Scanner.
export function KerangkaMasuk({
  judul,
  keterangan,
  kembali = { href: "/", label: "Kembali ke halaman depan" },
  children,
}: {
  judul: string;
  keterangan: string;
  kembali?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary-container/60" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-tertiary-container/50" />
      </div>
      <header className="flex items-center justify-between">
        <Link href={kembali.href} aria-label={kembali.label} className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high">
          <ArrowLeft size={20} />
        </Link>
        <TombolTema className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high" />
      </header>
      <section className="muncul my-auto flex flex-col gap-6 rounded-[28px] bg-surface-low p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-2xl font-extrabold text-on-primary">S</div>
          <div>
            <h1 className="text-2xl font-extrabold">{judul}</h1>
            <p className="text-sm text-on-surface-variant">{keterangan}</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
