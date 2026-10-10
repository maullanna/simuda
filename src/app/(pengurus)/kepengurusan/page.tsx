import type { Metadata } from "next";
import { Fragment } from "react";
import { Crown, ShieldCheck } from "lucide-react";
import { TombolAkun } from "@/components/kepengurusan/AksiAkun";
import { TombolTambahPengurus, TombolUbahPengurus } from "@/components/kepengurusan/AksiKepengurusan";
import { PetugasScan } from "@/components/kepengurusan/PetugasScan";
import { ambilSemuaPengurus, type PengurusTampil } from "@/lib/data/pengurus";
import { ambilSemuaPeserta } from "@/lib/data/peserta";
import { DAFTAR_FITUR, KOLOM_PERAN, boleh } from "@/lib/hak-akses";
import { labelPeran } from "@/lib/kepengurusan";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Kepengurusan · SIMUDA",
};

type Hak = { bolehKelola: boolean; bolehAkun: boolean; pengurusIdSaya: string };

function KartuPengurus({ p, hak }: { p: PengurusTampil; hak: Hak }) {
  return (
    <li className={`group flex items-center gap-3 rounded-2xl bg-surface-mid p-3 ${p.aktif ? "" : "opacity-70"}`}>
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
        {p.nama.replace(/^(KH|Ust|Ustzh)\.\s*/, "").charAt(0)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="max-w-full truncate font-bold">{p.nama}</p>
        <p className="text-xs text-on-surface-variant">{p.jabatan}</p>
        <TombolAkun akun={p} bolehKelola={hak.bolehAkun} diriSendiri={p.id === hak.pengurusIdSaya} />
      </div>
      <span className="shrink-0 rounded-lg bg-secondary-container px-2 py-1 text-[11px] font-bold text-on-secondary-container">
        {labelPeran[p.peran]}
      </span>
      {hak.bolehKelola && <TombolUbahPengurus pengurus={p} />}
    </li>
  );
}

// Kepengurusan (KONSEP 5.11): pimpinan, struktur pengurus per wilayah, petugas scan, akun login, dan hak akses.
// Dibuka oleh Kyai (lihat), Wakil dan Ketua (kelola), serta Administrator.
export default async function KepengurusanPage() {
  const pengguna = await requireRole("pengurus", "lihat");
  const hak: Hak = {
    bolehKelola: boleh(pengguna.peran, "pengurus", "ubah"),
    bolehAkun: boleh(pengguna.peran, "akunLogin", "jalankan"),
    pengurusIdSaya: pengguna.pengurusId,
  };
  const [semua, semuaPeserta] = await Promise.all([ambilSemuaPengurus(), ambilSemuaPeserta()]);

  // Baris Administrator hanya terlihat oleh Administrator (dan hanya bisa diubah olehnya, dicek di server).
  const admin = pengguna.peran === "admin" ? semua.filter((p) => p.peran === "admin") : [];
  const daftarPengurus = semua.filter((p) => p.peran !== "admin" && p.peran !== "petugas_scan");
  const pimpinan = daftarPengurus.filter((p) => p.wilayah === "Pimpinan");
  const perWilayah = ["Bendlay 2", "Bendlay 4"].map((w) => ({ wilayah: w, pengurus: daftarPengurus.filter((p) => p.wilayah === w) }));
  // Petugas yang dicabut tidak ditampilkan; mereka bisa dipilih lagi lewat "Tambah petugas".
  const petugas = semua
    .filter((p) => p.peran === "petugas_scan" && p.aktif && p.pesertaId)
    .map((p) => ({ id: p.id, pesertaId: p.pesertaId!, nama: p.nama, email: p.email, aktif: p.aktif }));
  const calonPetugas = semuaPeserta
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
        {hak.bolehKelola && <TombolTambahPengurus />}
      </header>

      {/* Administrator (hanya terlihat oleh Administrator) */}
      {admin.length > 0 && (
        <section className="muncul flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ShieldCheck size={20} className="text-primary" /> Administrator
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {admin.map((p) => (
              <KartuPengurus key={p.id} p={p} hak={hak} />
            ))}
          </ul>
        </section>
      )}

      {/* Pimpinan */}
      <section className="muncul grid gap-4 sm:grid-cols-2">
        {pimpinan.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center gap-4 rounded-[28px] bg-primary-container p-5 text-on-primary-container ${p.aktif ? "" : "opacity-70"}`}
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface/60 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
              <Crown size={24} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">{p.jabatan}</p>
              <p className="max-w-full truncate text-lg font-extrabold">{p.nama}</p>
              <TombolAkun akun={p} bolehKelola={hak.bolehAkun} diriSendiri={p.id === hak.pengurusIdSaya} />
            </div>
            {hak.bolehKelola && <TombolUbahPengurus pengurus={p} />}
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
                <KartuPengurus key={p.id} p={p} hak={hak} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <PetugasScan peserta={calonPetugas} petugas={petugas} bolehKelola={boleh(pengguna.peran, "petugasScan", "jalankan")} />

      {/* Hak akses per fitur (KONSEP bagian 3.2), dibaca dari lib/hak-akses.ts yang juga dipakai server */}
      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ShieldCheck size={20} className="text-primary" /> Hak akses per fitur
          </h2>
          <p className="text-sm text-on-surface-variant">
            L = lihat · T = tambah · U = ubah · S = suspend & pulihkan · Ya = boleh. Administrator juga bisa hapus permanen.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="py-2 pr-3">Fitur</th>
                {KOLOM_PERAN.map((p) => (
                  <th key={p} className="px-2 py-2 text-center">
                    {p === "peserta" ? "Peserta" : labelPeran[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(DAFTAR_FITUR).map((f, i, semua) => (
                <Fragment key={f.label}>
                  {f.kelompok !== semua[i - 1]?.kelompok && (
                    <tr className="border-t border-outline-variant/60">
                      <td colSpan={KOLOM_PERAN.length + 1} className="pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-primary">
                        {f.kelompok}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-outline-variant/30">
                    <td className="py-2 pr-3 font-semibold">{f.label}</td>
                    {f.hak.map((a, j) => (
                      <td key={KOLOM_PERAN[j]} className="px-2 py-2 text-center">
                        {a === "–" ? (
                          <span className="text-on-surface-variant/60">–</span>
                        ) : (
                          <span
                            className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold ${
                              /^(Ya|[LTUS]*[TUS][LTUS]*)( |$)/.test(a)
                                ? "bg-primary-container text-on-primary-container"
                                : "bg-surface-highest text-on-surface-variant"
                            }`}
                          >
                            {a}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
