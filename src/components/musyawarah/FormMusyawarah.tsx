"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { HasilSimpan } from "@/components/Dialog";
import { formatTanggal } from "@/lib/sesi";
import {
  periksaHasilMusyawarah,
  periksaJadwalMusyawarah,
  type BarisTindakLanjut,
  type GalatHasil,
  type GalatJadwal,
  type Musyawarah,
} from "@/lib/musyawarah";

const gayaInput =
  "h-11 w-full rounded-xl border bg-transparent px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-2 focus:border-primary";

function TombolForm({ batal, simpan }: { batal: () => void; simpan: string }) {
  return (
    <div className="flex justify-end gap-2">
      <md-text-button type="button" onClick={batal}>
        Batal
      </md-text-button>
      <md-filled-button type="submit">{simpan}</md-filled-button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jadwalkan musyawarah: tanggal, jam, lokasi, dan daftar agenda (bisa ditambah/dihapus).

export function FormJadwalMusyawarah({ hariIni, selesai }: { hariIni: string; selesai: () => void }) {
  const [agenda, setAgenda] = useState<string[]>([""]);
  const [galat, setGalat] = useState<GalatJadwal>({});
  const [hasil, setHasil] = useState<{ tanggal: string; jam: string; lokasi: string; agenda: string[] } | null>(null);

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const isian = {
      tanggal: String(d.get("tanggal") ?? ""),
      jam: String(d.get("jam") ?? ""),
      lokasi: String(d.get("lokasi") ?? ""),
      agenda,
    };
    const g = periksaJadwalMusyawarah(isian, hariIni);
    setGalat(g);
    if (Object.keys(g).length > 0) return;
    setHasil({ ...isian, lokasi: isian.lokasi.trim(), agenda: agenda.map((a) => a.trim()).filter(Boolean) });
  }

  if (hasil) {
    return (
      <HasilSimpan judul="Musyawarah siap dijadwalkan" tutup={selesai}>
        <p className="text-sm">
          {formatTanggal(hasil.tanggal)}, {hasil.jam} · {hasil.lokasi}
        </p>
        <ol className="list-decimal pl-5 text-sm">
          {hasil.agenda.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <md-outlined-text-field name="tanggal" label="Tanggal" type="date" min={hariIni} error={Boolean(galat.tanggal)} error-text={galat.tanggal} className="w-full" />
        <md-outlined-text-field name="jam" label="Jam" type="time" value="20:00" error={Boolean(galat.jam)} error-text={galat.jam} className="w-full" />
      </div>
      <md-outlined-text-field name="lokasi" label="Lokasi" placeholder="Contoh: Aula masjid Bendlay 2" error={Boolean(galat.lokasi)} error-text={galat.lokasi} className="w-full" />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Agenda</legend>
        {agenda.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 text-right text-sm font-bold text-on-surface-variant">{i + 1}.</span>
            <input
              value={a}
              onChange={(e) => {
                setAgenda((x) => x.map((y, j) => (j === i ? e.target.value : y)));
                setGalat((g) => ({ ...g, agenda: undefined }));
              }}
              placeholder="Tulis agenda"
              aria-label={`Agenda ${i + 1}`}
              className={`${gayaInput} ${galat.agenda && i === 0 ? "border-error" : "border-outline"}`}
            />
            <button
              type="button"
              onClick={() => setAgenda((x) => (x.length > 1 ? x.filter((_, j) => j !== i) : [""]))}
              aria-label={`Hapus agenda ${i + 1}`}
              className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-highest"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {galat.agenda && <p className="px-7 text-xs text-error">{galat.agenda}</p>}
        <button
          type="button"
          onClick={() => setAgenda((x) => [...x, ""])}
          className="ml-7 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary-container"
        >
          <Plus size={16} /> Tambah agenda
        </button>
      </fieldset>

      <TombolForm batal={selesai} simpan="Jadwalkan" />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Tulis hasil musyawarah dan tindak lanjutnya (tugas, penanggung jawab, tenggat).

export function FormHasilMusyawarah({
  musyawarah,
  daftarPengurus,
  selesai,
}: {
  musyawarah: Musyawarah;
  daftarPengurus: string[];
  selesai: () => void;
}) {
  const [hasilTeks, setHasilTeks] = useState(musyawarah.hasil.join("\n"));
  const [baris, setBaris] = useState<BarisTindakLanjut[]>([{ tugas: "", pic: "", tenggat: "" }]);
  const [galat, setGalat] = useState<GalatHasil>({});
  const [tersimpan, setTersimpan] = useState<{ hasil: string[]; tugas: BarisTindakLanjut[] } | null>(null);

  function ubahBaris(i: number, ubah: Partial<BarisTindakLanjut>) {
    setBaris((b) => b.map((x, j) => (j === i ? { ...x, ...ubah } : x)));
    setGalat((g) => ({ ...g, tindakLanjut: undefined }));
  }

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const g = periksaHasilMusyawarah({ hasil: hasilTeks, tindakLanjut: baris }, musyawarah.tanggal);
    setGalat(g);
    if (Object.keys(g).length > 0) return;
    setTersimpan({
      // Setiap baris teks menjadi satu butir hasil.
      hasil: hasilTeks.split("\n").map((h) => h.trim()).filter(Boolean),
      tugas: baris.filter((b) => b.tugas.trim()),
    });
  }

  if (tersimpan) {
    return (
      <HasilSimpan judul="Hasil musyawarah siap disimpan" tutup={selesai}>
        <ul className="list-disc pl-5 text-sm">
          {tersimpan.hasil.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <p className="text-sm text-on-surface-variant">{tersimpan.tugas.length} tindak lanjut akan masuk ke papan.</p>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={simpan} className="flex flex-col gap-5">
      <div className="rounded-2xl bg-surface-mid px-4 py-3 text-sm">
        <p className="font-bold">Agenda</p>
        <ol className="list-decimal pl-5 text-on-surface-variant">
          {musyawarah.agenda.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-on-surface-variant">Hasil musyawarah (satu baris satu poin)</span>
        <textarea
          value={hasilTeks}
          onChange={(e) => {
            setHasilTeks(e.target.value);
            setGalat((g) => ({ ...g, hasil: undefined }));
          }}
          rows={4}
          placeholder={"Contoh:\nAbsensi kartu QR dipakai mulai bulan depan.\nPeringatan Maulid diadakan bersama Bendlay 4."}
          className={`rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-on-surface-variant focus:border-2 focus:border-primary ${galat.hasil ? "border-error" : "border-outline"}`}
        />
        {galat.hasil && <span className="px-1 text-xs text-error">{galat.hasil}</span>}
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold text-on-surface-variant">Tindak lanjut</legend>
        {baris.map((b, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border border-outline-variant p-3">
            <div className="flex items-center gap-2">
              <input
                value={b.tugas}
                onChange={(e) => ubahBaris(i, { tugas: e.target.value })}
                placeholder="Tugas"
                aria-label={`Tugas ${i + 1}`}
                className={`${gayaInput} border-outline`}
              />
              <button
                type="button"
                onClick={() => setBaris((x) => (x.length > 1 ? x.filter((_, j) => j !== i) : [{ tugas: "", pic: "", tenggat: "" }]))}
                aria-label={`Hapus tindak lanjut ${i + 1}`}
                className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-highest"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={b.pic}
                onChange={(e) => ubahBaris(i, { pic: e.target.value })}
                aria-label={`Penanggung jawab ${i + 1}`}
                className={`${gayaInput} cursor-pointer border-outline`}
              >
                <option value="">Penanggung jawab</option>
                {daftarPengurus.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={b.tenggat}
                min={musyawarah.tanggal}
                onChange={(e) => ubahBaris(i, { tenggat: e.target.value })}
                aria-label={`Tenggat ${i + 1}`}
                className={`${gayaInput} border-outline`}
              />
            </div>
            {galat.tindakLanjut?.[i] && <p className="px-1 text-xs text-error">{galat.tindakLanjut[i]}</p>}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setBaris((x) => [...x, { tugas: "", pic: "", tenggat: "" }])}
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary-container"
        >
          <Plus size={16} /> Tambah tindak lanjut
        </button>
      </fieldset>

      <TombolForm batal={selesai} simpan="Simpan hasil" />
    </form>
  );
}
