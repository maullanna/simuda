"use client";

import { useEffect, useState } from "react";
import { NavbarPengurus } from "@/components/NavbarPengurus";
import { SidebarPengurus } from "@/components/SidebarPengurus";

// Kerangka semua halaman pengurus: sidebar di kiri, navbar di atas, isi halaman di tengah.
// State sidebar disimpan di sini karena dipakai dua komponen sekaligus:
// sidebar (menampilkan lebar/ciut) dan navbar (tombol untuk mengubahnya).
export function KerangkaPengurus({
  ciutAwal,
  hariIni,
  children,
}: {
  ciutAwal: boolean;
  hariIni: string;
  children: React.ReactNode;
}) {
  const [ciut, setCiut] = useState(ciutAwal);
  const [laciTerbuka, setLaciTerbuka] = useState(false);

  // Setiap kali ukuran berubah, simpan ke cookie selama setahun.
  // Cookie ikut terkirim ke server saat halaman berikutnya dibuka.
  useEffect(() => {
    document.cookie = `sidebar=${ciut ? "ciut" : "lebar"}; path=/; max-age=31536000; samesite=lax`;
  }, [ciut]);

  // Pintasan keyboard: Ctrl+B (atau Cmd+B di Mac) untuk menciutkan/melebarkan sidebar.
  useEffect(() => {
    function saatTombol(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCiut((c) => !c);
      }
    }
    window.addEventListener("keydown", saatTombol);
    return () => window.removeEventListener("keydown", saatTombol);
  }, []);

  return (
    <div className="min-h-screen lg:flex">
      <SidebarPengurus ciut={ciut} laciTerbuka={laciTerbuka} tutupLaci={() => setLaciTerbuka(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarPengurus
          ciut={ciut}
          gantiCiut={() => setCiut((c) => !c)}
          bukaLaci={() => setLaciTerbuka(true)}
          hariIni={hariIni}
        />
        <main className="px-4 pb-10 pt-2 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
