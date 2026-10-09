"use client";

import { useRef, useState, type FormEvent } from "react";
import { HasilSimpan } from "@/components/Dialog";
import { PilihanSegmen } from "@/components/PilihanSegmen";
import { labelJenisKelamin } from "@/lib/peserta";
import { formatTanggal, labelSasaran, periksaIsianSesi, type GalatSesi, type IsianSesi, type Sesi } from "@/lib/sesi";

// Satu form untuk dua keperluan:
// - tanpa `sesi`: tambah sesi baru (pilih tanggal dan putra/putri, materi boleh menyusul)
// - dengan `sesi`: isi/ubah materi dan pemateri sesi yang sudah terjadwal
export function FormSesi({
  sesi,
  hariIni,
  daftarPemateri,
  selesai,
}: {
  sesi?: Sesi;
  hariIni: string;
  daftarPemateri: string[];
  selesai: () => void;
}) {
  const baru = sesi === undefined;
  const [galat, setGalat] = useState<GalatSesi>({});
  const [hasil, setHasil] = useState<IsianSesi | null>(null);
  const kolomPemateri = useRef<HTMLElement & { value: string }>(null);

  function saatMengisi(e: FormEvent<HTMLFormElement>) {
    const nama = (e.target as HTMLElement & { name?: string }).name as keyof IsianSesi | undefined;
    if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined }));
  }

  // Pilihan cepat pemateri: mengisi kolom tanpa mengetik ulang nama yang sering dipakai.
  function pilihPemateri(nama: string) {
    if (kolomPemateri.current) kolomPemateri.current.value = nama;
    setGalat((g) => ({ ...g, pemateri: undefined }));
  }

  function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const isian: IsianSesi = {
      tanggal: baru ? String(data.get("tanggal") ?? "") : sesi.tanggal,
      jenisKelamin: baru ? String(data.get("jenisKelamin") ?? "") : sesi.jenisKelamin,
      jamMulai: String(data.get("jamMulai") ?? ""),
      sasaran: String(data.get("sasaran") ?? ""),
      materi: String(data.get("materi") ?? ""),
      pemateri: String(data.get("pemateri") ?? ""),
    };

    const galatBaru = periksaIsianSesi(isian, hariIni, baru);
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;

    // Database belum tersambung. Di sini nanti memanggil Server Action untuk menyimpan.
    setHasil(isian);
  }

  if (hasil) {
    return (
      <HasilSimpan judul={baru ? "Sesi baru siap ditambahkan" : "Materi siap disimpan"} tutup={selesai}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-on-surface-variant">Tanggal</dt>
          <dd className="font-semibold">
            {formatTanggal(hasil.tanggal)}, {hasil.jamMulai}
          </dd>
          <dt className="text-on-surface-variant">Kelompok</dt>
          <dd className="font-semibold">
            {labelJenisKelamin[hasil.jenisKelamin as "putra" | "putri"]} ·{" "}
            {labelSasaran[hasil.sasaran as keyof typeof labelSasaran]}
          </dd>
          <dt className="text-on-surface-variant">Materi</dt>
          <dd className="font-semibold">{hasil.materi.trim() || "Diisi nanti"}</dd>
          <dt className="text-on-surface-variant">Pemateri</dt>
          <dd className="font-semibold">{hasil.pemateri.trim() || "Diisi nanti"}</dd>
        </dl>
      </HasilSimpan>
    );
  }

  return (
    <form noValidate onSubmit={saatSimpan} onInput={saatMengisi} className="flex flex-col gap-5">
      {baru && (
        <>
          <md-outlined-text-field
            name="tanggal"
            label="Tanggal"
            type="date"
            min={hariIni}
            error={Boolean(galat.tanggal)}
            error-text={galat.tanggal}
            className="w-full"
          />
          <PilihanSegmen
            label="Kelompok"
            name="jenisKelamin"
            error={galat.jenisKelamin}
            pilihan={[
              { nilai: "putra", label: "Putra" },
              { nilai: "putri", label: "Putri" },
            ]}
          />
        </>
      )}

      <PilihanSegmen
        label="Sasaran"
        name="sasaran"
        nilaiAwal={sesi?.sasaran ?? "gabungan"}
        error={galat.sasaran}
        pilihan={[
          { nilai: "remaja", label: "Remaja" },
          { nilai: "pra-nikah", label: "Pra-nikah" },
          { nilai: "gabungan", label: "Gabungan" },
        ]}
      />

      <md-outlined-text-field
        name="materi"
        label={baru ? "Judul materi (boleh diisi nanti)" : "Judul materi"}
        value={sesi?.materi ?? ""}
        maxlength={150}
        error={Boolean(galat.materi)}
        error-text={galat.materi}
        className="w-full"
      />

      <div className="flex flex-col gap-2">
        <md-outlined-text-field
          ref={kolomPemateri}
          name="pemateri"
          label={baru ? "Pemateri (boleh diisi nanti)" : "Pemateri"}
          value={sesi?.pemateri ?? ""}
          maxlength={80}
          error={Boolean(galat.pemateri)}
          error-text={galat.pemateri}
          className="w-full"
        />
        {daftarPemateri.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <span className="text-xs text-on-surface-variant">Pilih cepat:</span>
            {daftarPemateri.map((nama) => (
              <button
                key={nama}
                type="button"
                onClick={() => pilihPemateri(nama)}
                className="h-7 rounded-lg border border-outline-variant px-2.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-highest"
              >
                {nama}
              </button>
            ))}
          </div>
        )}
      </div>

      <md-outlined-text-field
        name="jamMulai"
        label="Jam mulai"
        type="time"
        value={sesi?.jamMulai ?? "19:30"}
        error={Boolean(galat.jamMulai)}
        error-text={galat.jamMulai}
        className="w-full sm:max-w-48"
      />

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="submit">{baru ? "Tambah sesi" : "Simpan materi"}</md-filled-button>
      </div>
    </form>
  );
}
