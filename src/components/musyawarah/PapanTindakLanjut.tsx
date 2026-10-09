"use client";

import { useState } from "react";
import { ArrowRight, CalendarClock, Check, RotateCcw } from "lucide-react";
import { formatTanggal } from "@/lib/sesi";
import { labelStatusTindakLanjut, lewatTenggat, type StatusTindakLanjut, type TindakLanjut } from "@/lib/musyawarah";

export type ItemPapan = TindakLanjut & { asal: string }; // asal: musyawarah tempat tugas ini diputuskan

const KOLOM: { status: StatusTindakLanjut; titik: string }[] = [
  { status: "belum", titik: "bg-outline" },
  { status: "berjalan", titik: "bg-grafik-2" },
  { status: "selesai", titik: "bg-primary" },
];

// Langkah berikutnya untuk setiap status: belum -> berjalan -> selesai, dan selesai bisa dibuka lagi.
const AKSI: Record<StatusTindakLanjut, { ke: StatusTindakLanjut; label: string; ikon: typeof ArrowRight }> = {
  belum: { ke: "berjalan", label: "Mulai", ikon: ArrowRight },
  berjalan: { ke: "selesai", label: "Selesai", ikon: Check },
  selesai: { ke: "berjalan", label: "Buka lagi", ikon: RotateCcw },
};

// Papan tindak lanjut tiga kolom. "use client" karena status bisa dipindah langsung di layar.
export function PapanTindakLanjut({ item, hariIni }: { item: ItemPapan[]; hariIni: string }) {
  const [daftar, setDaftar] = useState(item);
  const [diubah, setDiubah] = useState(false);

  function pindah(id: string, ke: StatusTindakLanjut) {
    setDaftar((d) => d.map((t) => (t.id === id ? { ...t, status: ke } : t)));
    setDiubah(true);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold">Papan tindak lanjut</h2>
          <p className="text-sm text-on-surface-variant">Semua tugas dari hasil musyawarah, beserta penanggung jawab dan tenggatnya.</p>
        </div>
        {diubah && (
          <p className="rounded-xl bg-warning-container px-3 py-1.5 text-xs text-on-warning-container">
            Perubahan status belum tersimpan (database belum tersambung).
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {KOLOM.map((k) => {
          const isi = daftar
            .filter((t) => t.status === k.status)
            .sort((a, b) => a.tenggat.localeCompare(b.tenggat));
          return (
            <div key={k.status} className="flex flex-col gap-2 rounded-[28px] bg-surface-low p-3">
              <div className="flex items-center gap-2 px-2 py-1">
                <span className={`size-2.5 rounded-full ${k.titik}`} />
                <p className="font-extrabold">{labelStatusTindakLanjut[k.status]}</p>
                <span className="ml-auto rounded-full bg-surface-highest px-2 py-0.5 text-xs font-bold">{isi.length}</span>
              </div>

              {isi.length === 0 && <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Kosong</p>}

              {isi.map((t) => {
                const telat = lewatTenggat(t, hariIni);
                const aksi = AKSI[t.status];
                const Ikon = aksi.ikon;
                return (
                  <article key={t.id} className="muncul flex flex-col gap-2 rounded-2xl bg-surface p-3.5" style={{ animationDuration: "300ms" }}>
                    <p className={`text-sm font-bold ${t.status === "selesai" ? "text-on-surface-variant line-through decoration-1" : ""}`}>{t.tugas}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-mid px-2 py-1 font-semibold">
                        <span className="grid size-4 place-items-center rounded-full bg-primary-container text-[9px] font-bold text-on-primary-container">
                          {t.pic.charAt(0)}
                        </span>
                        {t.pic}
                      </span>
                      {/* Lewat tenggat diberi kuning, bukan merah: pengingat, bukan teguran */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold ${
                          telat ? "bg-warning-container text-on-warning-container" : "bg-surface-mid text-on-surface-variant"
                        }`}
                      >
                        <CalendarClock size={12} />
                        {telat ? "Lewat tenggat · " : ""}
                        {formatTanggal(t.tenggat, { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-on-surface-variant">{t.asal}</p>
                      <button
                        type="button"
                        onClick={() => pindah(t.id, aksi.ke)}
                        className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
                      >
                        {aksi.label}
                        <Ikon size={14} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
