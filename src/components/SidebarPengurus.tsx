"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LabelMelayang } from "@/components/LabelMelayang";
import { TombolAkunSaya } from "@/components/TombolAkunSaya";
import { TombolKeluar } from "@/components/TombolKeluar";
import { boleh } from "@/lib/hak-akses";
import type { Peran } from "@/lib/kepengurusan";
import { kelompokMenu, menuAktif } from "@/lib/menu";

// Data pengguna yang sedang masuk, dikirim dari layout (server) yang sudah memeriksa sesinya.
export type InfoPengguna = { nama: string; jabatan: string; wilayah: string; peran: Peran };

// "use client" karena butuh usePathname untuk menandai menu yang sedang dibuka.
// State lebar/ciut dan laci HP disimpan di KerangkaPengurus, karena navbar juga memakainya.

const pegas = "duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

function Logo({ ciut }: { ciut: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${ciut ? "justify-center" : "px-4"}`}>
      <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-extrabold text-on-primary">
        S
      </div>
      {!ciut && (
        <div className="whitespace-nowrap leading-tight">
          <p className="font-extrabold">SIMUDA</p>
          <p className="text-xs text-on-surface-variant">Bendlay 2 & 4</p>
        </div>
      )}
    </div>
  );
}

function IsiSidebar({ ciut, pengguna, saatNavigasi }: { ciut: boolean; pengguna: InfoPengguna; saatNavigasi?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="mt-4 flex flex-col gap-4">
        {/* Hanya menu yang boleh dilihat peran ini (server tetap memeriksa ulang di tiap halaman) */}
        {kelompokMenu
          .map((k) => ({ ...k, item: k.item.filter((m) => boleh(pengguna.peran, m.fitur, "lihat")) }))
          .filter((k) => k.item.length > 0)
          .map((kelompok, i) => (
          <div key={kelompok.judul} className="flex flex-col gap-1">
            {ciut ? (
              i > 0 && <div className="mx-auto mb-2 h-px w-8 bg-outline-variant" />
            ) : (
              <p className="whitespace-nowrap px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                {kelompok.judul}
              </p>
            )}
            {kelompok.item.map((item) => {
              const aktif = menuAktif(pathname, item.href);
              const Ikon = item.ikon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={saatNavigasi}
                  aria-current={aktif ? "page" : undefined}
                  className={`group relative flex h-11 items-center gap-3 rounded-full text-sm font-semibold transition-colors ${
                    ciut ? "mx-auto w-14 justify-center" : "px-4"
                  } ${
                    aktif
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-high"
                  }`}
                >
                  {/* Saat hover, ikon membesar sedikit dengan pantulan pegas */}
                  <Ikon
                    size={20}
                    strokeWidth={aktif ? 2.25 : 1.75}
                    className={`shrink-0 transition-transform ${pegas} group-hover:scale-110 ${ciut ? "" : "group-hover:translate-x-0.5"}`}
                  />
                  {ciut ? <LabelMelayang teks={item.label} /> : <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {ciut ? (
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="group relative grid size-11 place-items-center rounded-full bg-surface-mid text-sm font-bold">
            {pengguna.nama.charAt(0)}
            <LabelMelayang teks={`${pengguna.nama} · ${pengguna.jabatan}`} />
          </div>
          <TombolAkunSaya saatNavigasi={saatNavigasi} />
          <TombolKeluar />
        </div>
      ) : (
        <div className="mt-auto flex items-center gap-2 whitespace-nowrap rounded-3xl bg-surface-mid py-3 pl-4 pr-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{pengguna.nama}</p>
            <p className="truncate text-xs text-on-surface-variant">
              {pengguna.jabatan} · {pengguna.wilayah}
            </p>
          </div>
          <TombolAkunSaya posisiLabel="bawah" saatNavigasi={saatNavigasi} />
          <TombolKeluar posisiLabel="bawah" />
        </div>
      )}
    </>
  );
}

export function SidebarPengurus({
  ciut,
  laciTerbuka,
  tutupLaci,
  pengguna,
}: {
  ciut: boolean;
  laciTerbuka: boolean;
  tutupLaci: () => void;
  pengguna: InfoPengguna;
}) {
  return (
    <>
      {/* HP: laci menu yang muncul dari kiri (selalu lebar), dibuka dari tombol ☰ di navbar */}
      {laciTerbuka && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-scrim/40" onClick={tutupLaci} />
          <aside className="muncul absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto rounded-r-[28px] bg-surface-low p-3">
            <div className="flex items-center justify-between">
              <Logo ciut={false} />
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={tutupLaci}
                className="grid size-12 place-items-center rounded-full hover:bg-surface-high"
              >
                <X size={22} />
              </button>
            </div>
            <IsiSidebar ciut={false} pengguna={pengguna} saatNavigasi={tutupLaci} />
          </aside>
        </div>
      )}

      {/* Laptop: sidebar tetap di kiri, bisa diciutkan jadi ikon saja lewat navbar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-surface-low p-3 transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:flex ${
          ciut ? "w-20" : "w-72 overflow-y-auto overflow-x-hidden"
        }`}
      >
        <Logo ciut={ciut} />
        <IsiSidebar ciut={ciut} pengguna={pengguna} />
      </aside>
    </>
  );
}
