import { TombolTema } from "@/components/TombolTema";

// Bar judul sederhana untuk halaman Jadwal, Materi, dan Kartu di tampilan peserta.
export function KepalaHalaman({ judul, keterangan }: { judul: string; keterangan?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-surface px-5 pb-3 pt-5">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-extrabold">{judul}</h1>
        {keterangan && <p className="text-sm text-on-surface-variant">{keterangan}</p>}
      </div>
      <TombolTema className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high" />
    </header>
  );
}
