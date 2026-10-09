"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import type { PesertaSesi } from "@/lib/sesi";

const labelStatus: Record<PesertaSesi["status"], string> = {
  hadir: "Sudah hadir",
  izin: "Izin",
  alpa: "Alpa",
  belum: "",
};

// Daftar peserta yang bisa dicari lalu dipilih.
// jamak = true: centang banyak (checkbox). jamak = false: pilih satu (radio).
// Peserta yang sudah tercatat (hadir/izin) tampil redup dan tidak bisa dipilih.
// Pilihan dikirim lewat form dengan nama `name`, jadi bisa dibaca dengan FormData.
export function DaftarPilihPeserta({
  name,
  peserta,
  jamak,
  terpilih,
  ubahTerpilih,
  galat,
  labelSudah,
}: {
  name: string;
  peserta: PesertaSesi[];
  jamak: boolean;
  terpilih: string[];
  ubahTerpilih: (id: string[]) => void;
  galat?: string;
  labelSudah?: string; // teks pengganti untuk yang sudah tercatat, misalnya "Sudah petugas"
}) {
  const [cari, setCari] = useState("");
  const kata = cari.trim().toLowerCase();
  const tampil = peserta.filter((p) => !kata || p.nama.toLowerCase().includes(kata));

  function pilih(id: string, centang: boolean) {
    if (!jamak) ubahTerpilih([id]);
    else ubahTerpilih(centang ? [...terpilih, id] : terpilih.filter((x) => x !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex h-11 items-center gap-2 rounded-full bg-surface-mid px-4 focus-within:outline-2 focus-within:outline-primary">
        <Search size={18} className="shrink-0 text-on-surface-variant" />
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari nama peserta"
          aria-label="Cari nama peserta"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-on-surface-variant"
        />
      </label>

      <ul
        className={`flex max-h-64 flex-col gap-1 overflow-y-auto rounded-2xl border p-1 ${galat ? "border-error" : "border-outline-variant"}`}
      >
        {tampil.length === 0 && <li className="px-3 py-6 text-center text-sm text-on-surface-variant">Tidak ada nama yang cocok.</li>}
        {tampil.map((p) => {
          const sudah = p.status === "hadir" || p.status === "izin";
          const dipilih = terpilih.includes(p.id);
          return (
            <li key={p.id}>
              <label
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                  sudah ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-surface-highest"
                } ${dipilih ? "bg-secondary-container text-on-secondary-container" : ""}`}
              >
                <input
                  type={jamak ? "checkbox" : "radio"}
                  name={name}
                  value={p.id}
                  checked={dipilih}
                  disabled={sudah}
                  onChange={(e) => pilih(p.id, e.target.checked)}
                  className="peer sr-only"
                />
                {/* Kotak/bulatan pilihan buatan sendiri, mengikuti input asli yang disembunyikan */}
                <span
                  className={`grid size-5 shrink-0 place-items-center border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-primary ${
                    jamak ? "rounded-md" : "rounded-full"
                  } ${dipilih ? "border-primary bg-primary text-on-primary" : "border-outline"}`}
                >
                  {dipilih && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.nama}</span>
                  <span className="block text-xs opacity-75">
                    {p.wilayah}
                    {p.diLuarSasaran && " · di luar sasaran"}
                  </span>
                </span>
                {sudah && <span className="shrink-0 text-xs font-bold">{labelSudah ?? labelStatus[p.status]}</span>}
              </label>
            </li>
          );
        })}
      </ul>
      {galat && <p className="px-4 text-xs text-error">{galat}</p>}
    </div>
  );
}
