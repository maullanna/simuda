import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { TombolAkun } from "@/components/kepengurusan/AksiAkun";
import { TombolTambahPengurus, TombolUbahPengurus } from "@/components/kepengurusan/AksiKepengurusan";
import { DataKelompok } from "@/components/kepengurusan/DataKelompok";
import { DiagramKepengurusan, type HakDiagram } from "@/components/kepengurusan/DiagramKepengurusan";
import { PetugasScan } from "@/components/kepengurusan/PetugasScan";
import { ambilSemuaDataKelompok } from "@/lib/data/biodata";
import { ambilSemuaLevel, ambilSemuaPengurus, type PengurusTampil } from "@/lib/data/pengurus";
import { ambilSemuaPeserta } from "@/lib/data/peserta";
import { boleh } from "@/lib/hak-akses";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Kepengurusan · SIMUDA",
};

type Hak = HakDiagram;

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
        {p.level.nama}
      </span>
      {hak.bolehKelola && <TombolUbahPengurus pengurus={p} pilihanLevel={hak.pilihanLevel} />}
    </li>
  );
}

// Kepengurusan (KONSEP 5.11): pimpinan, struktur pengurus per wilayah, petugas scan, akun login, dan hak akses.
// Dibuka oleh Kyai (lihat), Wakil dan Ketua (kelola), serta Administrator.
export default async function KepengurusanPage() {
  const pengguna = await requireRole("pengurus", "lihat");
  const [semua, semuaPeserta, dataKelompok, semuaLevel] = await Promise.all([
    ambilSemuaPengurus(),
    ambilSemuaPeserta(),
    ambilSemuaDataKelompok(),
    ambilSemuaLevel(),
  ]);
  const hak: Hak = {
    bolehKelola: boleh(pengguna, "pengurus", "ubah"),
    bolehAkun: boleh(pengguna, "akunLogin", "jalankan"),
    pengurusIdSaya: pengguna.pengurusId,
    // Level Administrator hanya bisa dipilih Administrator. Petugas scan diatur di bagiannya sendiri.
    pilihanLevel: semuaLevel.filter((l) => (pengguna.aksesPenuh || !l.aksesPenuh) && l.kode !== "petugas_scan"),
  };

  // Baris Administrator hanya terlihat oleh Administrator (dan hanya bisa diubah olehnya, dicek di server).
  const admin = pengguna.aksesPenuh ? semua.filter((p) => p.level.aksesPenuh) : [];
  const daftarPengurus = semua.filter((p) => !p.level.aksesPenuh && !p.pesertaId);
  const pimpinan = daftarPengurus.filter((p) => p.wilayah === "Pimpinan");
  const perWilayah = ["Bendlay 2", "Bendlay 4"].map((w) => ({ wilayah: w, pengurus: daftarPengurus.filter((p) => p.wilayah === w) }));
  // Petugas yang dicabut tidak ditampilkan; mereka bisa dipilih lagi lewat "Tambah petugas".
  const petugas = semua
    .filter((p) => p.aktif && p.pesertaId)
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
            {daftarPengurus.length} pengurus · penanggung jawab: Ketua Muda/i. Level tiap pengurus menentukan apa yang boleh dibuka.
          </p>
        </div>
        {hak.bolehKelola && <TombolTambahPengurus pilihanLevel={hak.pilihanLevel} />}
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

      {/* Bagan: pimpinan di puncak, bercabang ke kelompok Bendlay 2 dan Bendlay 4 */}
      <DiagramKepengurusan pimpinan={pimpinan} kelompok={perWilayah} hak={hak} />

      <PetugasScan peserta={calonPetugas} petugas={petugas} bolehKelola={boleh(pengguna, "petugasScan", "jalankan")} />

      <DataKelompok semua={dataKelompok} bolehUbah={boleh(pengguna, "dataKelompok", "ubah")} />

      {/* Hak akses diatur per level di halaman Level pengguna (hanya Administrator, KONSEP 3.1) */}
      {boleh(pengguna, "levelPengguna", "jalankan") && (
        <Link
          href="/level-pengguna"
          className="group flex items-center gap-4 rounded-[28px] bg-surface-low p-5 transition-colors hover:bg-surface-mid"
        >
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-container text-on-primary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold">Level pengguna dan hak akses</h2>
            <p className="text-sm text-on-surface-variant">{semuaLevel.length} level. Atur apa saja yang boleh dibuka dan diubah tiap level.</p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
