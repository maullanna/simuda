"use client";

import { useState, type FormEvent } from "react";
import { HasilSimpan } from "@/components/Dialog";
import { DaftarPilihPeserta } from "@/components/absensi/DaftarPilihPeserta";
import { periksaIsianIzin, type GalatIzin, type IsianIzin, type PesertaSesi } from "@/lib/sesi";

export type OpsiSesiIzin = {
  id: string;
  label: string; // contoh "Hari ini · Putra"
  keterangan: string; // contoh "Gabungan · 19:30"
  peserta: PesertaSesi[]; // hanya peserta sasaran sesi itu
};

const ALASAN = ["Sakit", "Acara keluarga", "Lainnya"];

// Catat izin (tahap 1: dicatat pengurus). Izin tidak perlu persetujuan, langsung tercatat (KONSEP 5.4).
export function FormCatatIzin({ opsiSesi, selesai }: { opsiSesi: OpsiSesiIzin[]; selesai: () => void }) {
  const [sesiId, setSesiId] = useState(opsiSesi[0]?.id ?? "");
  const [pesertaId, setPesertaId] = useState<string[]>([]);
  const [alasan, setAlasan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [galat, setGalat] = useState<GalatIzin>({});
  const [hasil, setHasil] = useState<{ nama: string; sesi: string; alasan: string } | null>(null);

  const sesi = opsiSesi.find((s) => s.id === sesiId);

  function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const isian: IsianIzin = { sesiId, pesertaId: pesertaId[0] ?? "", alasan, keterangan };
    const galatBaru = periksaIsianIzin(isian);
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;

    // Database belum tersambung. Di sini nanti memanggil Server Action (status: izin).
    setHasil({
      nama: sesi?.peserta.find((p) => p.id === isian.pesertaId)?.nama ?? "",
      sesi: sesi?.label ?? "",
      alasan: alasan === "Lainnya" ? keterangan.trim() : alasan,
    });
  }

  if (hasil) {
    return (
      <HasilSimpan judul={`Izin ${hasil.nama} siap dicatat`} tutup={selesai}>
        <p className="text-sm">
          {hasil.sesi} · <span className="font-semibold">{hasil.alasan}</span>
        </p>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={saatSimpan} className="flex flex-col gap-5">
      {/* Pilih sesi */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Sesi pengajian</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {opsiSesi.map((s) => {
            const aktif = s.id === sesiId;
            return (
              <label
                key={s.id}
                className={`flex cursor-pointer flex-col rounded-2xl border px-4 py-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                  aktif
                    ? "border-transparent bg-secondary-container text-on-secondary-container"
                    : "border-outline-variant hover:bg-surface-highest"
                }`}
              >
                <input
                  type="radio"
                  name="sesiId"
                  value={s.id}
                  checked={aktif}
                  onChange={() => {
                    setSesiId(s.id);
                    setPesertaId([]); // daftar peserta berganti, jadi pilihan lama dilepas
                    setGalat({});
                  }}
                  className="sr-only"
                />
                <span className="text-sm font-bold">{s.label}</span>
                <span className="text-xs opacity-75">{s.keterangan}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Pilih peserta */}
      {sesi && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-on-surface-variant">Peserta yang izin</p>
          <DaftarPilihPeserta
            key={sesi.id}
            name="pesertaId"
            peserta={sesi.peserta}
            jamak={false}
            terpilih={pesertaId}
            ubahTerpilih={(id) => {
              setPesertaId(id);
              setGalat((g) => ({ ...g, pesertaId: undefined }));
            }}
            galat={galat.pesertaId}
          />
        </div>
      )}

      {/* Keterangan */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Keterangan</legend>
        <div className="flex flex-wrap gap-2">
          {ALASAN.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={alasan === a}
              onClick={() => {
                setAlasan(a);
                setGalat((g) => ({ ...g, alasan: undefined, keterangan: undefined }));
              }}
              className={`h-9 rounded-lg border px-3.5 text-sm font-semibold transition-colors ${
                alasan === a
                  ? "border-transparent bg-secondary-container text-on-secondary-container"
                  : `${galat.alasan ? "border-error" : "border-outline-variant"} text-on-surface-variant hover:bg-surface-highest`
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {galat.alasan && <p className="px-1 text-xs text-error">{galat.alasan}</p>}
        {alasan === "Lainnya" && (
          <label className="mt-1 flex flex-col gap-1">
            <input
              type="text"
              value={keterangan}
              onChange={(e) => {
                setKeterangan(e.target.value);
                setGalat((g) => ({ ...g, keterangan: undefined }));
              }}
              maxLength={200}
              placeholder="Contoh: ujian sekolah"
              aria-label="Keterangan izin"
              className={`h-11 rounded-xl border bg-transparent px-4 text-sm outline-none focus:border-primary ${galat.keterangan ? "border-error" : "border-outline"}`}
            />
            {galat.keterangan && <span className="px-1 text-xs text-error">{galat.keterangan}</span>}
          </label>
        )}
      </fieldset>

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="submit">Catat izin</md-filled-button>
      </div>
    </form>
  );
}
