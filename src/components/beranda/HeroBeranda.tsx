import { ScanLine } from "lucide-react";

// Banner sapaan di atas Beranda. Bentuk-bentuk di kanan hanya hiasan:
// saat kursor masuk ke banner (class "group"), masing-masing bergeser sedikit.
export function HeroBeranda({
  namaDepan,
  tanggal,
  hadirHariIni,
  sasaranHariIni,
  adaPengajian,
}: {
  namaDepan: string;
  tanggal: string;
  hadirHariIni: number;
  sasaranHariIni: number;
  adaPengajian: boolean;
}) {
  const pegas = "transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  return (
    <section className="muncul group relative isolate overflow-hidden rounded-[28px] bg-primary-container p-6 text-on-primary-container lg:p-8">
      {/* Hiasan */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
        <div className={`absolute -right-10 -top-16 size-64 rounded-full bg-primary/15 ${pegas} group-hover:-translate-x-4 group-hover:translate-y-3`} />
        <div className={`absolute right-56 top-6 h-20 w-56 -rotate-6 rounded-full border-[5px] border-surface/70 ${pegas} group-hover:rotate-3`} />
        <div className={`absolute right-40 top-4 size-12 rounded-full border-[5px] border-surface/80 ${pegas} group-hover:-translate-y-2 group-hover:scale-110`} />
        <div className={`absolute -bottom-10 right-28 size-40 rounded-full bg-primary/25 ${pegas} group-hover:-translate-y-4`} />
        <div className={`absolute bottom-6 right-[22rem] h-16 w-10 rounded-full bg-primary/20 ${pegas} group-hover:translate-x-3`} />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-70">SIMUDA · Bendlay 2 & 4</p>
      <h1 className="mt-2 text-3xl font-extrabold lg:text-4xl">Assalamu&apos;alaikum, {namaDepan}</h1>
      <p className="mt-2 max-w-xl opacity-80">
        {adaPengajian
          ? `${hadirHariIni} dari ${sasaranHariIni} peserta sudah hadir di pengajian hari ini.`
          : "Tidak ada pengajian hari ini."}{" "}
        · {tanggal}
      </p>

      {adaPengajian && (
        <div className="mt-6 flex flex-wrap gap-2">
          <md-filled-button href="/scan">
            <ScanLine slot="icon" size={18} />
            Buka scanner
          </md-filled-button>
          <md-outlined-button href="/absensi">Lihat absensi</md-outlined-button>
        </div>
      )}
    </section>
  );
}
