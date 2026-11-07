"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CircleCheck, LoaderCircle } from "lucide-react";
import { simpanPeserta } from "@/app/(pengurus)/peserta/aksi";
import { IsianBiodata, kotakIsian, type GalatBiodata } from "@/components/peserta/IsianBiodata";
import { PilihanSegmen } from "@/components/PilihanSegmen";
import type { Biodata } from "@/lib/biodata";
import { PESAN_ADA_GALAT, gulirKeGalatPertama } from "@/lib/galat-form";
import {
  hitungUmur,
  kategoriPeserta,
  labelKategori,
  periksaIsianPeserta,
  type GalatIsian,
  type IsianPeserta,
  type Peserta,
} from "@/lib/peserta";

// Form yang sama dipakai untuk tambah peserta (tanpa `peserta`) dan ubah peserta (dengan `peserta`).
// "use client" karena form ini menyimpan state: pesan error, pratinjau foto, dan kategori otomatis.
// bolehBiodata: tampilkan juga isian biodata (KONSEP 5.1b), hanya untuk Administrator.
export function FormPeserta({
  peserta,
  hariIni,
  bolehBiodata = false,
  biodata,
}: {
  peserta?: Peserta;
  hariIni: string;
  bolehBiodata?: boolean;
  biodata?: Biodata;
}) {
  const modeUbah = peserta !== undefined;

  const [galat, setGalat] = useState<GalatIsian & GalatBiodata>({});
  const [tanggalLahir, setTanggalLahir] = useState(peserta?.tanggalLahir ?? "");
  const [nama, setNama] = useState(peserta?.nama ?? "");
  const [foto, setFoto] = useState<string | null>(null);
  const [hasil, setHasil] = useState<{ id: string; nama: string } | null>(null);
  const [proses, setProses] = useState(false);
  const [pesanUmum, setPesanUmum] = useState<string>();
  const inputFoto = useRef<HTMLInputElement>(null);

  // Pratinjau foto memakai URL sementara di memori browser. Saat foto diganti
  // atau halaman ditinggalkan, URL lama dilepas supaya memorinya tidak bocor.
  useEffect(() => {
    return () => {
      if (foto) URL.revokeObjectURL(foto);
    };
  }, [foto]);

  // Event "input" dari semua kolom naik (bubble) sampai ke <form>,
  // jadi cukup satu pendengar di sini untuk semua kolom.
  function saatMengisi(e: FormEvent<HTMLFormElement>) {
    const kolom = e.target as HTMLElement & { name?: string; value?: string };
    const namaKolom = kolom.name as keyof (GalatIsian & GalatBiodata) | undefined;
    if (namaKolom === "tanggalLahir") setTanggalLahir(kolom.value ?? "");
    if (namaKolom === "nama") setNama(kolom.value ?? "");
    if (namaKolom && galat[namaKolom]) setGalat((g) => ({ ...g, [namaKolom]: undefined }));
  }

  function saatPilihFoto() {
    const file = inputFoto.current?.files?.[0];
    if (file) setFoto(URL.createObjectURL(file));
  }

  async function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const isian: IsianPeserta = {
      nama: String(data.get("nama") ?? ""),
      jenisKelamin: String(data.get("jenisKelamin") ?? ""),
      wilayah: String(data.get("wilayah") ?? ""),
      tanggalLahir: String(data.get("tanggalLahir") ?? ""),
      noHp: String(data.get("noHp") ?? ""),
      status: String(data.get("status") ?? "aktif"),
    };

    // 1) Pemeriksaan cepat di browser, supaya pengurus langsung tahu kalau ada yang salah.
    const galatBaru = periksaIsianPeserta(isian, hariIni);
    setGalat(galatBaru);
    setPesanUmum(undefined);
    if (Object.keys(galatBaru).length > 0) {
      setPesanUmum(PESAN_ADA_GALAT);
      gulirKeGalatPertama(form, galatBaru);
      return;
    }

    // 2) Simpan lewat Server Action. Server memeriksa ulang hak akses dan isian (Zod),
    //    karena pemeriksaan di browser bisa dilewati.
    setProses(true);
    try {
      const hasilServer = await simpanPeserta(peserta?.id ?? null, data);
      if (!hasilServer.ok) {
        setGalat(hasilServer.galat as GalatIsian & GalatBiodata);
        setPesanUmum(hasilServer.pesan ?? (Object.keys(hasilServer.galat).length ? PESAN_ADA_GALAT : "Gagal menyimpan."));
        gulirKeGalatPertama(form, hasilServer.galat);
        return;
      }
      setHasil({ id: hasilServer.id, nama: isian.nama.trim() });
    } catch {
      setPesanUmum("Gagal menyimpan. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setProses(false);
    }
  }

  function tambahLagi() {
    setHasil(null);
    setGalat({});
    setTanggalLahir("");
    setNama("");
    setFoto(null);
  }

  if (hasil) {
    return (
      <section className="flex max-w-2xl flex-col gap-5 rounded-3xl bg-surface-low p-6">
        <div className="flex items-center gap-3">
          <CircleCheck size={28} className="text-primary" />
          <h2 className="text-xl font-extrabold">
            {modeUbah ? "Perubahan tersimpan" : `${hasil.nama} berhasil ditambahkan`}
          </h2>
        </div>
        {!modeUbah && (
          <p className="text-sm text-on-surface-variant">Kartu peserta dengan kode QR baru sudah dibuat dan siap dicetak.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <md-filled-button href="/peserta">Kembali ke daftar</md-filled-button>
          {!modeUbah && (
            <>
              <md-filled-tonal-button href={`/peserta/kartu?id=${hasil.id}`}>Cetak kartunya</md-filled-tonal-button>
              <md-outlined-button type="button" onClick={tambahLagi}>
                Tambah lagi
              </md-outlined-button>
            </>
          )}
        </div>
      </section>
    );
  }

  const tanggalValid = /^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir) && tanggalLahir <= hariIni;
  const inisial = nama.trim().charAt(0).toUpperCase() || "?";

  // Dua kolom di layar lebar kalau ada biodata: kiri data diri, kanan biodata.
  // Di HP tetap satu kolom, tapi isian pendek dipasangkan supaya tidak banyak menggulir.
  return (
    <form
      noValidate
      onSubmit={saatSimpan}
      onInput={saatMengisi}
      className={`grid gap-4 sm:gap-6 ${bolehBiodata ? "max-w-6xl lg:grid-cols-2 lg:items-start" : "max-w-2xl"}`}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Foto */}
        <section className="flex items-center gap-4 rounded-3xl bg-surface-low p-4 sm:gap-5 sm:p-6">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-container bg-cover bg-center text-2xl font-extrabold text-on-primary-container sm:size-24 sm:text-3xl"
            style={foto ? { backgroundImage: `url(${foto})` } : undefined}
          >
            {!foto && inisial}
          </div>
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-on-surface-variant">Foto untuk kartu peserta. Boleh dikosongkan dulu; penyimpanan foto menyusul.</p>
            <md-outlined-button has-icon type="button" onClick={() => inputFoto.current?.click()}>
              <Camera slot="icon" size={18} />
              {foto ? "Ganti foto" : "Pilih foto"}
            </md-outlined-button>
            <input ref={inputFoto} type="file" name="foto" accept="image/*" onChange={saatPilihFoto} className="hidden" />
          </div>
        </section>

        {/* Data diri */}
        <section className={kotakIsian}>
          <h2 className="font-extrabold">Data diri</h2>

          <md-outlined-text-field
            name="nama"
            label="Nama lengkap"
            value={peserta?.nama ?? ""}
            autocomplete="off"
            error={Boolean(galat.nama)}
            error-text={galat.nama}
            className="w-full"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PilihanSegmen
              label="Jenis kelamin"
              name="jenisKelamin"
              nilaiAwal={peserta?.jenisKelamin}
              error={galat.jenisKelamin}
              pilihan={[
                { nilai: "putra", label: "Putra" },
                { nilai: "putri", label: "Putri" },
              ]}
            />
            <PilihanSegmen
              label="Kelompok"
              name="wilayah"
              nilaiAwal={peserta?.wilayah}
              error={galat.wilayah}
              pilihan={[
                { nilai: "Bendlay 2", label: "Bendlay 2" },
                { nilai: "Bendlay 4", label: "Bendlay 4" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <md-outlined-text-field
              name="tanggalLahir"
              label="Tanggal lahir"
              type="date"
              value={peserta?.tanggalLahir ?? ""}
              max={hariIni}
              error={Boolean(galat.tanggalLahir)}
              error-text={galat.tanggalLahir}
              className="w-full"
            />
            <md-outlined-text-field
              name="noHp"
              label="No HP / WA"
              type="tel"
              inputMode="tel"
              value={peserta?.noHp ?? ""}
              placeholder="08…"
              supporting-text="Opsional"
              error={Boolean(galat.noHp)}
              error-text={galat.noHp}
              className="w-full"
            />
          </div>
          {/* Kategori tidak dipilih manual, selalu dihitung dari tanggal lahir */}
          <p className="-mt-1 px-1 text-sm text-on-surface-variant">
            {tanggalValid ? (
              <>
                Kategori otomatis:{" "}
                <span className="rounded-lg bg-secondary-container px-2 py-0.5 font-bold text-on-secondary-container">
                  {labelKategori[kategoriPeserta(tanggalLahir)]}
                </span>{" "}
                · {hitungUmur(tanggalLahir)} tahun
              </>
            ) : (
              "Kategori pra-remaja / remaja / pra-nikah dihitung otomatis dari tanggal lahir."
            )}
          </p>
        </section>

        {/* Status diubah lewat tombol Suspend/Pulihkan di daftar peserta (wajib alasan, KONSEP 3.3). */}
        {modeUbah && peserta.status === "tidak_aktif" && (
          <p className="rounded-2xl bg-surface-highest px-4 py-3 text-sm text-on-surface-variant">
            Peserta ini sedang <b>di-suspend</b>. Pulihkan dari daftar peserta (filter Tidak aktif) kalau ia aktif mengaji lagi.
          </p>
        )}
      </div>

      {/* Biodata untuk Tim PnKB: hanya Administrator (dan nanti pemiliknya sendiri). Boleh dikosongkan. */}
      {bolehBiodata && (
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-1 px-2">
            <h2 className="text-lg font-extrabold">Biodata (opsional)</h2>
            <p className="text-sm text-on-surface-variant">
              Untuk Tim PnKB. Boleh dikosongkan dan dilengkapi nanti. Hanya terlihat oleh pemiliknya sendiri dan Administrator.
            </p>
          </div>
          <IsianBiodata biodata={biodata} galat={galat} />
        </div>
      )}

      {pesanUmum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container lg:col-span-2">
          {pesanUmum}
        </p>
      )}

      <div className="flex justify-end gap-2 lg:col-span-2">
        <md-text-button href="/peserta">Batal</md-text-button>
        <md-filled-button has-icon={proses} type="submit" disabled={proses}>
          {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
          {proses ? "Menyimpan..." : modeUbah ? "Simpan perubahan" : "Simpan peserta"}
        </md-filled-button>
      </div>
    </form>
  );
}
