import type { Metadata } from "next";
import { Crown, ShieldCheck } from "lucide-react";
import { TombolTambahPengurus, TombolUbahPengurus } from "@/components/kepengurusan/AksiKepengurusan";
import { PetugasScan } from "@/components/kepengurusan/PetugasScan";
import { PERAN_TABEL, hakAkses, labelPeran, type Pengurus } from "@/lib/kepengurusan";
import { daftarPeserta, daftarPengurus, petugasScanContoh } from "@/lib/mock";

export const metadata: Metadata = {
  title: "Kepengurusan · SIMUDA",
};

function KartuPengurus({ p }: { p: Pengurus }) {
  return (
    <li className="group flex items-center gap-3 rounded-2xl bg-surface-mid p-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
        {p.nama.replace(/^(KH|Ust|Ustzh)\.\s*/, "").charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{p.nama}</p>
        <p className="text-xs text-on-surface-variant">{p.jabatan}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-secondary-container px-2 py-1 text-[11px] font-bold text-on-secondary-container">
        {labelPeran[p.peran]}
      </span>
      <TombolUbahPengurus pengurus={p} />
    </li>
  );
}

// Kepengurusan (KONSEP 5.11): pimpinan, struktur pengurus per wilayah, petugas scan, dan hak akses.
// Nanti hanya Wakil dan Ketua yang boleh mengubah (dicek requireRole di server).
export default function KepengurusanPage() {
  const pimpinan = daftarPengurus.filter((p) => p.wilayah === "Pimpinan");
  const perWilayah = ["Bendlay 2", "Bendlay 4"].map((w) => ({ wilayah: w, pengurus: daftarPengurus.filter((p) => p.wilayah === w) }));
  const calonPetugas = daftarPeserta
    .filter((p) => p.status === "aktif")
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
    .map((p) => ({ id: p.id, nama: p.nama, wilayah: p.wilayah, jenisKelamin: p.jenisKelamin }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Kepengurusan</h1>
          <p className="text-on-surface-variant">
            {daftarPengurus.length} pengurus · penanggung jawab: Ketua Muda/i. Peran di sistem menentukan apa yang boleh dibuka.
          </p>
        </div>
        <TombolTambahPengurus />
      </header>

      {/* Pimpinan */}
      <section className="muncul grid gap-4 sm:grid-cols-2">
        {pimpinan.map((p) => (
          <div key={p.id} className="group flex items-center gap-4 rounded-[28px] bg-primary-container p-5 text-on-primary-container">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface/60 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
              <Crown size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">{p.jabatan}</p>
              <p className="truncate text-lg font-extrabold">{p.nama}</p>
            </div>
            <TombolUbahPengurus pengurus={p} />
          </div>
        ))}
      </section>

      {/* Struktur per wilayah */}
      <div className="grid gap-4 lg:grid-cols-2">
        {perWilayah.map((g, i) => (
          <section key={g.wilayah} className="muncul flex flex-col gap-3 rounded-[28px] bg-surface-low p-5" style={{ animationDelay: `${80 + i * 60}ms` }}>
            <h2 className="text-lg font-extrabold">Pengurus {g.wilayah}</h2>
            <ul className="flex flex-col gap-2">
              {g.pengurus.map((p) => (
                <KartuPengurus key={p.id} p={p} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <PetugasScan peserta={calonPetugas} awal={petugasScanContoh} />

      {/* Hak akses per peran (acuan dari KONSEP bagian 3) */}
      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ShieldCheck size={20} className="text-primary" /> Hak akses per peran
          </h2>
          <p className="text-sm text-on-surface-variant">Masih draf, perlu dikonfirmasi ke Ketua Muda/i.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="py-2 pr-3">Fitur</th>
                {PERAN_TABEL.map((p) => (
                  <th key={p} className="px-2 py-2 text-center">
                    {labelPeran[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hakAkses.map((baris) => (
                <tr key={baris.fitur} className="border-t border-outline-variant/60">
                  <td className="py-2.5 pr-3 font-semibold">{baris.fitur}</td>
                  {baris.akses.map((a, i) => (
                    <td key={PERAN_TABEL[i]} className="px-2 py-2.5 text-center">
                      {a === "–" ? (
                        <span className="text-on-surface-variant/60">–</span>
                      ) : (
                        <span
                          className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold ${
                            a === "Kelola" ? "bg-primary-container text-on-primary-container" : "bg-surface-highest text-on-surface-variant"
                          }`}
                        >
                          {a}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
