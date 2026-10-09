"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Kolom pencarian yang menyimpan kata kunci di URL (?q=...).
// Dengan begitu halaman server bisa menyaring data, dan hasil pencarian
// tetap ada saat halaman dimuat ulang atau link-nya dibagikan.
export function KolomCari({ label, nilaiAwal }: { label: string; nilaiAwal: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  // Nilai awal hanya dipakai sekali saat pertama tampil. Kalau mengikuti URL terus,
  // huruf yang baru diketik bisa tertimpa saat hasil pencarian datang dari server.
  const [nilaiPertama] = useState(nilaiAwal);

  useEffect(() => {
    const kolom = ref.current as (HTMLElement & { value: string }) | null;
    if (!kolom) return;

    // Tunggu 300 ms setelah berhenti mengetik, supaya URL tidak berubah di setiap huruf.
    let jeda: ReturnType<typeof setTimeout>;
    function saatMengetik() {
      clearTimeout(jeda);
      jeda = setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const kataKunci = kolom!.value.trim();
        if (kataKunci) params.set("q", kataKunci);
        else params.delete("q");
        params.delete("halaman"); // hasil pencarian baru selalu dimulai dari halaman 1
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }, 300);
    }

    // Event dipasang langsung ke elemen <md-...> karena itu web component,
    // bukan elemen bawaan React.
    kolom.addEventListener("input", saatMengetik);
    return () => {
      kolom.removeEventListener("input", saatMengetik);
      clearTimeout(jeda);
    };
  }, [router, pathname]);

  return (
    <md-outlined-text-field
      ref={ref}
      label={label}
      value={nilaiPertama}
      type="search"
      className="w-full sm:max-w-xs"
    />
  );
}
