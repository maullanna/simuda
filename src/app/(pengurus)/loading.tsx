// Kerangka loading halaman pengurus. Tampil di area isi selama halaman baru dimuat;
// sidebar dan navbar tetap bisa dipakai. Bentuknya meniru susunan halaman (judul, kartu, tabel)
// supaya perpindahan ke isi asli tidak terasa melompat.
export default function MemuatPengurus() {
  return (
    <div role="status" aria-label="Memuat halaman" className="flex animate-pulse flex-col gap-6">
      <div className="h-5 w-64 rounded-full bg-surface-high" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex h-36 flex-col gap-3 rounded-[28px] bg-surface-low p-5">
            <div className="size-10 rounded-full bg-surface-high" />
            <div className="h-3 w-24 rounded-full bg-surface-high" />
            <div className="h-6 w-16 rounded-full bg-surface-high" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div className="h-5 w-40 rounded-full bg-surface-high" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-outline-variant/40 pt-3">
            <div className="size-9 rounded-full bg-surface-high" />
            <div className="h-3 flex-1 rounded-full bg-surface-high" />
            <div className="h-3 w-20 rounded-full bg-surface-high" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
