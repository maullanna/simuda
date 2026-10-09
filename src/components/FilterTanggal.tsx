"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, SlidersHorizontal } from "lucide-react";
import { akhirBulan, awalBulan, bacaPeriode, geserBulan, labelPeriode } from "@/lib/periode";
import { formatTanggal, geserTanggal, seninPekanIni } from "@/lib/sesi";

// Filter periode di navbar. Hasilnya disimpan di URL (?dari=...&sampai=...),
// jadi halaman server (misalnya Absensi) bisa ikut menyaring datanya.
export function FilterTanggal({ hariIni }: { hariIni: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periode = bacaPeriode(searchParams.get("dari"), searchParams.get("sampai"), hariIni);

  const [terbuka, setTerbuka] = useState(false);
  const [dari, setDari] = useState(periode.dari);
  const [sampai, setSampai] = useState(periode.sampai);
  const wadah = useRef<HTMLDivElement>(null);

  function buka() {
    // Setiap kali dibuka, isian dimulai dari periode yang sedang berlaku.
    setDari(periode.dari);
    setSampai(periode.sampai);
    setTerbuka(true);
  }

  // Tutup panel saat klik di luar atau menekan Esc.
  useEffect(() => {
    if (!terbuka) return;
    function klikLuar(e: MouseEvent) {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setTerbuka(false);
    }
    function tombol(e: KeyboardEvent) {
      if (e.key === "Escape") setTerbuka(false);
    }
    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tombol);
    };
  }, [terbuka]);

  function pakai(d: string, s: string) {
    setDari(d);
    setSampai(s);
  }

  // Event "input" dari kolom tanggal naik sampai ke <form>.
  function saatMengisi(e: FormEvent<HTMLFormElement>) {
    const kolom = e.target as HTMLElement & { name?: string; value?: string };
    if (kolom.name === "dari" && kolom.value) setDari(kolom.value);
    if (kolom.name === "sampai" && kolom.value) setSampai(kolom.value);
  }

  function arahkan(d?: string, s?: string) {
    const params = new URLSearchParams(searchParams.toString());
    // Periode berganti: semua tabel berpaginasi (halaman, hal-peserta, hal-sesi, ...) kembali ke halaman 1.
    for (const kunci of [...params.keys()]) if (kunci.startsWith("hal")) params.delete(kunci);
    if (d && s) {
      params.set("dari", d <= s ? d : s);
      params.set("sampai", d <= s ? s : d);
    } else {
      params.delete("dari");
      params.delete("sampai");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setTerbuka(false);
  }

  function terapkan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    arahkan(dari, sampai);
  }

  const bulanPanel = awalBulan(dari);
  const pilihanCepat = [
    { label: "Pekan ini", dari: seninPekanIni(hariIni), sampai: geserTanggal(seninPekanIni(hariIni), 6) },
    { label: "Bulan ini", dari: awalBulan(hariIni), sampai: akhirBulan(hariIni) },
    { label: "30 hari terakhir", dari: geserTanggal(hariIni, -29), sampai: hariIni },
  ];

  return (
    <div ref={wadah} className="relative">
      <button
        type="button"
        onClick={() => (terbuka ? setTerbuka(false) : buka())}
        aria-expanded={terbuka}
        aria-haspopup="dialog"
        className={`group flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold transition-colors ${
          terbuka ? "bg-secondary-container text-on-secondary-container" : "hover:bg-surface-highest"
        }`}
      >
        <SlidersHorizontal
          size={18}
          className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-90"
        />
        <span className="hidden sm:inline">{periode.label}</span>
      </button>

      {terbuka && (
        <form
          role="dialog"
          aria-label="Filter periode"
          noValidate
          onSubmit={terapkan}
          onInput={saatMengisi}
          className="muncul absolute right-0 top-full z-40 mt-2 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-4 rounded-3xl bg-surface-high p-4"
          style={{ animationDuration: "250ms" }}
        >
          {/* Pilih bulan dengan panah */}
          <div className="flex items-center justify-between rounded-full bg-surface-mid p-1">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              onClick={() => pakai(geserBulan(bulanPanel, -1), akhirBulan(geserBulan(bulanPanel, -1)))}
              className="grid size-9 place-items-center rounded-full hover:bg-surface-highest"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => pakai(bulanPanel, akhirBulan(bulanPanel))}
              className="rounded-full px-3 py-1 text-sm font-bold hover:bg-surface-highest"
            >
              {formatTanggal(bulanPanel, { month: "long", year: "numeric" })}
            </button>
            <button
              type="button"
              aria-label="Bulan berikutnya"
              onClick={() => pakai(geserBulan(bulanPanel, 1), akhirBulan(geserBulan(bulanPanel, 1)))}
              className="grid size-9 place-items-center rounded-full hover:bg-surface-highest"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Pilihan cepat */}
          <div className="flex flex-wrap gap-2">
            {pilihanCepat.map((p) => {
              const aktif = p.dari === dari && p.sampai === sampai;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => pakai(p.dari, p.sampai)}
                  aria-pressed={aktif}
                  className={`h-8 rounded-lg border px-3 text-xs font-bold transition-colors ${
                    aktif
                      ? "border-transparent bg-secondary-container text-on-secondary-container"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-highest"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <md-outlined-text-field name="dari" label="Dari" type="date" value={dari} className="w-full" />
          <md-outlined-text-field name="sampai" label="Sampai" type="date" value={sampai} className="w-full" />

          <p className="-mt-1 px-1 text-xs text-on-surface-variant">Periode: {labelPeriode(dari <= sampai ? dari : sampai, dari <= sampai ? sampai : dari)}</p>

          <div className="flex justify-end gap-2">
            <md-outlined-button type="button" onClick={() => arahkan()}>
              <RotateCcw slot="icon" size={16} />
              Reset
            </md-outlined-button>
            <md-filled-button type="submit">Terapkan</md-filled-button>
          </div>
        </form>
      )}
    </div>
  );
}
