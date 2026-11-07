"use client";

import { useRef, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { simpanSesi } from "@/app/(pengurus)/jadwal/aksi";
import { PilihanSegmen } from "@/components/PilihanSegmen";
import { periksaIsianSesi, type GalatSesi, type IsianSesi, type Sesi } from "@/lib/sesi";

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
  const [pesanUmum, setPesanUmum] = useState<string>();
  const [proses, setProses] = useState(false);
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

  async function saatSimpan(e: FormEvent<HTMLFormElement>) {
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

    // 1) Pemeriksaan cepat di browser; 2) simpan lewat Server Action yang memeriksa ulang.
    const galatBaru = periksaIsianSesi(isian, hariIni, baru);
    setGalat(galatBaru);
    setPesanUmum(undefined);
    if (Object.keys(galatBaru).length > 0) return;

    setProses(true);
    try {
      const hasil = await simpanSesi(sesi?.id ?? null, data);
      if (!hasil.ok) {
        setGalat(hasil.galat ?? {});
        setPesanUmum(hasil.pesan);
        return;
      }
      selesai(); // halaman ikut diperbarui oleh revalidatePath di server
    } catch {
      setPesanUmum("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(false);
    }
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
          { nilai: "pra-remaja", label: "Pra-remaja" },
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

      {pesanUmum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {pesanUmum}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button has-icon={proses} type="submit" disabled={proses}>
          {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
          {proses ? "Menyimpan..." : baru ? "Tambah sesi" : "Simpan materi"}
        </md-filled-button>
      </div>
    </form>
  );
}
