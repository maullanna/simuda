"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LabelMelayang } from "@/components/LabelMelayang";
import { kelompokMenu, menuAktif } from "@/lib/menu";
import { penggunaAktif } from "@/lib/mock";

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

function IsiSidebar({ ciut, saatNavigasi }: { ciut: boolean; saatNavigasi?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="mt-4 flex flex-col gap-4">
        {kelompokMenu.map((kelompok, i) => (
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
        <div className="group relative mx-auto mt-auto grid size-11 place-items-center rounded-full bg-surface-mid text-sm font-bold">
          {penggunaAktif.nama.charAt(0)}
          <LabelMelayang teks={`${penggunaAktif.nama} · ${penggunaAktif.jabatan}`} />
        </div>
      ) : (
        <div className="mt-auto whitespace-nowrap rounded-3xl bg-surface-mid px-4 py-3">
          <p className="text-sm font-bold">{penggunaAktif.nama}</p>
          <p className="text-xs text-on-surface-variant">
            {penggunaAktif.jabatan} · {penggunaAktif.wilayah}
          </p>
        </div>
      )}
    </>
  );
}

export function SidebarPengurus({
  ciut,
  laciTerbuka,
  tutupLaci,
}: {
  ciut: boolean;
  laciTerbuka: boolean;
  tutupLaci: () => void;
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
            <IsiSidebar ciut={false} saatNavigasi={tutupLaci} />
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
        <IsiSidebar ciut={ciut} />
      </aside>
    </>
  );
}
