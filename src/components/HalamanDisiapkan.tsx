import { Construction } from "lucide-react";

// Halaman untuk menu yang sudah ada di sidebar tapi isinya belum dibuat (label "Segera").
export function HalamanDisiapkan({ judul, keterangan }: { judul: string; keterangan: string }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
      <h1 className="sr-only">{judul}</h1>
      <section className="muncul flex max-w-xl flex-col items-center gap-4 rounded-[28px] bg-surface-low p-8 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-warning-container text-on-warning-container">
          <Construction size={26} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Segera hadir</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{keterangan}</p>
        </div>
      </section>
    </div>
  );
}
