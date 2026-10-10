// Kerangka loading tampilan peserta di HP. Navigasi bawah tetap tampil karena ada di layout.
export default function MemuatPeserta() {
  return (
    <div role="status" aria-label="Memuat halaman" className="flex animate-pulse flex-col gap-5 px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-surface-high" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-40 rounded-full bg-surface-high" />
          <div className="h-3 w-28 rounded-full bg-surface-high" />
        </div>
      </div>
      <div className="h-44 rounded-[28px] bg-surface-low" />
      <div className="h-36 rounded-[28px] bg-surface-low" />
      <div className="h-16 rounded-2xl bg-surface-low" />
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
