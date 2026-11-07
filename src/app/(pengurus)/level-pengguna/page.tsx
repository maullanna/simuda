import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Pencil, Plus, ShieldCheck } from "lucide-react";
import { TombolHapusLevel } from "@/components/level/TombolHapusLevel";
import { ambilDaftarLevel } from "@/lib/data/level";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Level pengguna · SIMUDA",
};

// Level pengguna (KONSEP 3.1): hanya Administrator. Hak tiap level diatur dengan centang per fitur.
export default async function LevelPenggunaPage() {
  await requireRole("levelPengguna", "jalankan");
  const semua = await ambilDaftarLevel();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Level pengguna</h1>
          <p className="max-w-2xl text-on-surface-variant">
            Setiap pengurus dipilihkan satu level di halaman Kepengurusan. Hak akses level diatur di sini; semua pengurus di level itu ikut berubah.
          </p>
        </div>
        <md-filled-button has-icon href="/level-pengguna/baru">
          <Plus slot="icon" size={18} />
          Tambah level
        </md-filled-button>
      </header>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {semua.map((l, i) => {
          const jumlahHak = Object.values(l.hak).reduce((n, a) => n + (a?.length ?? 0), 0);
          return (
            <li
              key={l.id}
              className={`muncul flex flex-col gap-3 rounded-[28px] p-5 ${l.aksesPenuh ? "bg-primary-container text-on-primary-container" : "bg-surface-low"}`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${l.aksesPenuh ? "bg-surface/60" : "bg-secondary-container text-on-secondary-container"}`}
                >
                  {l.aksesPenuh ? <Lock size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-extrabold">{l.nama}</h2>
                  <p className={`text-sm ${l.aksesPenuh ? "opacity-80" : "text-on-surface-variant"}`}>
                    {l.aksesPenuh ? "Akses penuh · terkunci" : `${jumlahHak} hak dicentang`} · {l.jumlahPengurus} pengurus
                  </p>
                </div>
              </div>
              {l.keterangan && <p className={`text-sm ${l.aksesPenuh ? "opacity-80" : "text-on-surface-variant"}`}>{l.keterangan}</p>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <Link
                  href={`/level-pengguna/${l.id}`}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${
                    l.aksesPenuh ? "hover:bg-surface/40" : "text-primary hover:bg-surface-highest"
                  }`}
                >
                  {l.aksesPenuh ? <Lock size={15} /> : <Pencil size={15} />}
                  {l.aksesPenuh ? "Lihat" : "Atur hak akses"}
                </Link>
                {!l.aksesPenuh && l.kode !== "petugas_scan" && <TombolHapusLevel id={l.id} nama={l.nama} dipakai={l.jumlahPengurus} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
