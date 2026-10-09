"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Dialog gaya Material 3 memakai elemen <dialog> bawaan browser.
// Keuntungannya: tombol Esc, fokus keyboard, dan lapisan gelap di belakang
// sudah diurus browser. Isi dialog hanya dirender saat terbuka, jadi form
// di dalamnya selalu mulai dari keadaan bersih setiap kali dibuka.
export function Dialog({
  terbuka,
  tutup,
  judul,
  keterangan,
  lembarBawah = false,
  children,
}: {
  terbuka: boolean;
  tutup: () => void;
  judul: string;
  keterangan?: string;
  // true: di HP muncul sebagai lembar dari bawah layar (bottom sheet), di layar lebar tetap di tengah.
  lembarBawah?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (terbuka && !dialog.open) dialog.showModal();
    if (!terbuka && dialog.open) dialog.close();
  }, [terbuka]);

  return (
    <dialog
      ref={ref}
      onClose={tutup}
      // Klik di lapisan gelap (di luar kotak isi) menutup dialog.
      onClick={(e) => {
        if (e.target === e.currentTarget) tutup();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] rounded-[28px] bg-surface-high p-0 text-on-surface backdrop:bg-scrim/40 open:muncul ${
        lembarBawah ? "max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none" : ""
      }`}
      style={{ animationDuration: "300ms" }}
    >
      {terbuka && (
        <div className="flex flex-col gap-5 p-6">
          <header className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold">{judul}</h2>
              {keterangan && <p className="text-sm text-on-surface-variant">{keterangan}</p>}
            </div>
            <button
              type="button"
              onClick={tutup}
              aria-label="Tutup"
              className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest"
            >
              <X size={20} />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

// Tampilan setelah isian lolos pemeriksaan. Database belum tersambung,
// jadi pengguna diberi tahu dengan jelas bahwa datanya belum tersimpan.
export function HasilSimpan({ judul, tutup, children }: { judul: string; tutup: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-primary">{judul}</p>
      <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
        Database belum tersambung, jadi data ini <b>belum benar-benar tersimpan</b>. Isian sudah lolos
        pemeriksaan dan siap disimpan begitu database tersambung.
      </p>
      {children}
      <div className="flex justify-end">
        <md-filled-button type="button" onClick={tutup}>
          Tutup
        </md-filled-button>
      </div>
    </div>
  );
}
