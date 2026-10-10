import Link from "next/link";
import { ArrowRight, LayoutDashboard, ScanLine, Smartphone } from "lucide-react";
import { TombolTema } from "@/components/TombolTema";

const pegas = "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

// Halaman depan: dua pintu masuk, untuk pengurus dan untuk peserta.
// Kartunya sendiri diam saat disentuh kursor; yang bergerak hanya ikon dan panahnya.
export default function HalamanDepan() {
  return (
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-6 lg:px-8">
      {/* Hiasan latar */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary-container/60" />
        <div className="absolute -left-16 top-1/2 size-56 rounded-full bg-tertiary-container/50" />
        <div className="absolute bottom-10 right-1/4 h-20 w-56 -rotate-6 rounded-full border-[5px] border-primary/20" />
      </div>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-on-primary">S</div>
          <p className="font-extrabold">SIMUDA</p>
        </div>
        <TombolTema className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high" />
      </header>

      <section className="muncul flex flex-1 flex-col justify-center gap-10 py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">Pengajian Muda/i Bendlay 2 & 4</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Absensi pengajian cukup dengan menunjukkan kartu.</h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            SIMUDA mencatat kehadiran, jadwal, materi, dan rekap pengajian dalam satu aplikasi yang bisa dibuka lewat HP.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/masuk" className="group flex flex-col gap-4 rounded-[28px] bg-primary-container p-6 text-on-primary-container">
            <div className={`grid size-14 place-items-center rounded-2xl bg-surface/60 ${pegas} group-hover:-rotate-6 group-hover:scale-110`}>
              <LayoutDashboard size={26} />
            </div>
            <div>
              <p className="text-xl font-extrabold">Masuk sebagai pengurus</p>
              <p className="mt-1 text-sm opacity-80">Kelola peserta, absensi, jadwal, rekap, dan sodaqoh.</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold">
              Masuk <ArrowRight size={16} className={`${pegas} group-hover:translate-x-1`} />
            </span>
          </Link>

          <Link href="/masuk/peserta" className="group flex flex-col gap-4 rounded-[28px] bg-surface-low p-6">
            <div className={`grid size-14 place-items-center rounded-2xl bg-tertiary-container text-on-tertiary-container ${pegas} group-hover:-rotate-6 group-hover:scale-110`}>
              <Smartphone size={26} />
            </div>
            <div>
              <p className="text-xl font-extrabold">Masuk sebagai peserta</p>
              <p className="mt-1 text-sm text-on-surface-variant">Lihat jadwal, materi, kartu, dan kabari izin.</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Masuk dengan WhatsApp <ArrowRight size={16} className={`${pegas} group-hover:translate-x-1`} />
            </span>
          </Link>
        </div>

        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <ScanLine size={16} className="text-primary" /> Petugas scan masuk lewat pintu pengurus dengan akun yang diberikan Ketua.
        </p>
      </section>

      <footer className="text-xs text-on-surface-variant">SIMUDA · Sistem Informasi Muda/i Bendlay 2 & Bendlay 4</footer>
    </main>
  );
}
