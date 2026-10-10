"use client"; // Penangkap error wajib Client Component

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

// Ditampilkan kalau terjadi error tak terduga saat halaman dibuat.
// Next 16: tombol "Coba lagi" memanggil retry(), yang mengambil ulang dan merender ulang halaman.
export default function TerjadiKendala({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Nanti bisa dikirim ke layanan pencatat error. Sekarang cukup tampil di console browser.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <div className="grid size-20 place-items-center rounded-[28px] bg-warning-container text-on-warning-container">
        <TriangleAlert size={34} />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold">Terjadi kendala</h1>
        <p className="mt-2 text-on-surface-variant">Halaman ini gagal dimuat. Coba lagi sebentar. Kalau masih gagal, laporkan ke pengurus.</p>
        {/* Kode ini mencocokkan error dengan catatan di server, tanpa membuka detail yang sensitif */}
        {error.digest && <p className="mt-3 text-xs text-on-surface-variant">Kode kendala: {error.digest}</p>}
      </div>
      <md-filled-button type="button" onClick={() => retry()}>
        <RotateCcw slot="icon" size={18} />
        Coba lagi
      </md-filled-button>
    </main>
  );
}
