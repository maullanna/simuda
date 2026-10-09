"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PILIHAN_PER_HALAMAN } from "@/lib/halaman";

// Nomor-nomor halaman yang ditampilkan: selalu halaman pertama, terakhir, dan
// tetangga halaman aktif. Sisanya diringkas jadi "…".
function nomorTampil(aktif: number, jumlah: number): (number | "…")[] {
  const nomor = new Set([1, jumlah, aktif - 1, aktif, aktif + 1].filter((n) => n >= 1 && n <= jumlah));
  const urut = [...nomor].sort((a, b) => a - b);
  const hasil: (number | "…")[] = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("…");
    hasil.push(n);
  });
  return hasil;
}

// Kontrol pagination di bawah tabel: pilih jumlah baris, keterangan "1–10 dari 22",
// dan tombol halaman. Satu halaman bisa punya beberapa tabel berpaginasi, jadi
// nama parameter URL-nya bisa diatur (kunciHalaman, kunciPer).
export function Paginasi({
  total,
  halaman,
  per,
  kunciHalaman = "halaman",
  kunciPer = "per",
  label = "baris",
}: {
  total: number;
  halaman: number;
  per: number;
  kunciHalaman?: string;
  kunciPer?: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jumlahHalaman = Math.max(1, Math.ceil(total / per));

  function pergi(ubah: Record<string, number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(ubah)) {
      // Nilai bawaan (halaman 1) tidak perlu ditulis di URL supaya alamatnya tetap pendek.
      if (v === null || (k === kunciHalaman && v === 1)) params.delete(k);
      else params.set(k, String(v));
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const awal = total === 0 ? 0 : (halaman - 1) * per + 1;
  const akhir = Math.min(halaman * per, total);
  const tombol =
    "grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-35";

  return (
    <nav
      aria-label="Navigasi halaman tabel"
      className="flex flex-col gap-3 border-t border-outline-variant/60 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3 text-on-surface-variant">
        <label className="flex items-center gap-2">
          Tampilkan
          <select
            value={per}
            // Ganti jumlah baris: kembali ke halaman 1 supaya tidak tersesat di halaman kosong.
            onChange={(e) => pergi({ [kunciPer]: Number(e.target.value), [kunciHalaman]: null })}
            className="h-9 cursor-pointer rounded-full border border-outline-variant bg-surface px-3 font-bold text-on-surface outline-none transition-colors hover:bg-surface-high focus-visible:border-primary"
          >
            {PILIHAN_PER_HALAMAN.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {label}
        </label>
        <span aria-live="polite">
          {awal}–{akhir} dari <b className="text-on-surface">{total}</b>
        </span>
      </div>

      {jumlahHalaman > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => pergi({ [kunciHalaman]: halaman - 1 })}
            disabled={halaman <= 1}
            aria-label="Halaman sebelumnya"
            className={`${tombol} hover:bg-surface-highest`}
          >
            <ChevronLeft size={18} />
          </button>
          {nomorTampil(halaman, jumlahHalaman).map((n, i) =>
            n === "…" ? (
              <span key={`jeda-${i}`} className="px-1 text-on-surface-variant">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => pergi({ [kunciHalaman]: n })}
                aria-current={n === halaman ? "page" : undefined}
                className={`${tombol} ${n === halaman ? "bg-secondary-container text-on-secondary-container" : "hover:bg-surface-highest"}`}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => pergi({ [kunciHalaman]: halaman + 1 })}
            disabled={halaman >= jumlahHalaman}
            aria-label="Halaman berikutnya"
            className={`${tombol} hover:bg-surface-highest`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </nav>
  );
}
