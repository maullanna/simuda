"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CircleCheck } from "lucide-react";
import { PilihanSegmen } from "@/components/PilihanSegmen";
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
export function FormPeserta({ peserta, hariIni }: { peserta?: Peserta; hariIni: string }) {
  const modeUbah = peserta !== undefined;

  const [galat, setGalat] = useState<GalatIsian>({});
  const [tanggalLahir, setTanggalLahir] = useState(peserta?.tanggalLahir ?? "");
  const [nama, setNama] = useState(peserta?.nama ?? "");
  const [foto, setFoto] = useState<string | null>(null);
  const [hasil, setHasil] = useState<IsianPeserta | null>(null);
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
    const namaKolom = kolom.name as keyof IsianPeserta | undefined;
    if (namaKolom === "tanggalLahir") setTanggalLahir(kolom.value ?? "");
    if (namaKolom === "nama") setNama(kolom.value ?? "");
    if (namaKolom && galat[namaKolom]) setGalat((g) => ({ ...g, [namaKolom]: undefined }));
  }

  function saatPilihFoto() {
    const file = inputFoto.current?.files?.[0];
    if (file) setFoto(URL.createObjectURL(file));
  }

  function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const isian: IsianPeserta = {
      nama: String(data.get("nama") ?? ""),
      jenisKelamin: String(data.get("jenisKelamin") ?? ""),
      wilayah: String(data.get("wilayah") ?? ""),
      tanggalLahir: String(data.get("tanggalLahir") ?? ""),
      noHp: String(data.get("noHp") ?? ""),
      status: String(data.get("status") ?? "aktif"),
    };

    const galatBaru = periksaIsianPeserta(isian, hariIni);
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;

    // Database belum tersambung. Di sini nanti memanggil Server Action untuk menyimpan.
    setHasil(isian);
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
            {modeUbah ? "Perubahan siap disimpan" : `${hasil.nama.trim()} siap ditambahkan`}
          </h2>
        </div>
        <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
          Database belum tersambung, jadi data ini <b>belum benar-benar tersimpan</b>. Isian sudah
          lolos pemeriksaan dan siap disimpan begitu database tersambung.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-on-surface-variant">Nama</dt>
          <dd className="font-semibold">{hasil.nama.trim()}</dd>
          <dt className="text-on-surface-variant">Jenis kelamin</dt>
          <dd className="font-semibold capitalize">{hasil.jenisKelamin}</dd>
          <dt className="text-on-surface-variant">Wilayah</dt>
          <dd className="font-semibold">{hasil.wilayah}</dd>
          <dt className="text-on-surface-variant">Kategori</dt>
          <dd className="font-semibold">{labelKategori[kategoriPeserta(hasil.tanggalLahir)]}</dd>
          <dt className="text-on-surface-variant">No HP</dt>
          <dd className="font-semibold">{hasil.noHp || "–"}</dd>
          {modeUbah && (
            <>
              <dt className="text-on-surface-variant">Status</dt>
              <dd className="font-semibold">{hasil.status === "aktif" ? "Aktif" : "Tidak aktif"}</dd>
            </>
          )}
        </dl>
        <div className="flex flex-wrap gap-2">
          <md-filled-button href="/peserta">Kembali ke daftar</md-filled-button>
          {!modeUbah && (
            <md-outlined-button type="button" onClick={tambahLagi}>
              Tambah lagi
            </md-outlined-button>
          )}
        </div>
      </section>
    );
  }

  const tanggalValid = /^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir) && tanggalLahir <= hariIni;
  const inisial = nama.trim().charAt(0).toUpperCase() || "?";

  return (
    <form noValidate onSubmit={saatSimpan} onInput={saatMengisi} className="flex max-w-2xl flex-col gap-6">
      {/* Foto */}
      <section className="flex items-center gap-5 rounded-3xl bg-surface-low p-6">
        <div
          className="grid size-24 shrink-0 place-items-center rounded-full bg-primary-container bg-cover bg-center text-3xl font-extrabold text-on-primary-container"
          style={foto ? { backgroundImage: `url(${foto})` } : undefined}
        >
          {!foto && inisial}
        </div>
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-on-surface-variant">Foto untuk kartu peserta. Boleh dikosongkan dulu.</p>
          <md-outlined-button type="button" onClick={() => inputFoto.current?.click()}>
            <Camera slot="icon" size={18} />
            {foto ? "Ganti foto" : "Pilih foto"}
          </md-outlined-button>
          <input ref={inputFoto} type="file" name="foto" accept="image/*" onChange={saatPilihFoto} className="hidden" />
        </div>
      </section>

      {/* Data diri */}
      <section className="flex flex-col gap-5 rounded-3xl bg-surface-low p-6">
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
          label="Wilayah"
          name="wilayah"
          nilaiAwal={peserta?.wilayah}
          error={galat.wilayah}
          pilihan={[
            { nilai: "Bendlay 2", label: "Bendlay 2" },
            { nilai: "Bendlay 4", label: "Bendlay 4" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <md-outlined-text-field
            name="tanggalLahir"
            label="Tanggal lahir"
            type="date"
            value={peserta?.tanggalLahir ?? ""}
            max={hariIni}
            error={Boolean(galat.tanggalLahir)}
            error-text={galat.tanggalLahir}
            className="w-full sm:max-w-xs"
          />
          {/* Kategori tidak dipilih manual, selalu dihitung dari tanggal lahir */}
          <p className="px-4 text-sm text-on-surface-variant">
            {tanggalValid ? (
              <>
                Kategori otomatis:{" "}
                <span className="rounded-lg bg-secondary-container px-2 py-0.5 font-bold text-on-secondary-container">
                  {labelKategori[kategoriPeserta(tanggalLahir)]}
                </span>{" "}
                · {hitungUmur(tanggalLahir)} tahun
              </>
            ) : (
              "Kategori remaja / pra-nikah dihitung otomatis dari tanggal lahir."
            )}
          </p>
        </div>

        <md-outlined-text-field
          name="noHp"
          label="No HP / WhatsApp (opsional)"
          type="tel"
          inputMode="tel"
          value={peserta?.noHp ?? ""}
          supporting-text="Contoh: 081234567890"
          error={Boolean(galat.noHp)}
          error-text={galat.noHp}
          className="w-full sm:max-w-xs"
        />
      </section>

      {/* Status hanya muncul saat mengubah. Peserta baru selalu aktif. */}
      {modeUbah && (
        <section className="flex flex-col gap-3 rounded-3xl bg-surface-low p-6">
          <h2 className="font-extrabold">Status</h2>
          <PilihanSegmen
            label="Status peserta"
            name="status"
            nilaiAwal={peserta.status}
            pilihan={[
              { nilai: "aktif", label: "Aktif" },
              { nilai: "tidak_aktif", label: "Tidak aktif" },
            ]}
          />
          <p className="text-sm text-on-surface-variant">
            Peserta tidak pernah dihapus. Peserta tidak aktif tetap tersimpan beserta riwayat
            kehadirannya, hanya tidak muncul di absensi dan daftar utama.
          </p>
        </section>
      )}

      <div className="flex justify-end gap-2">
        <md-text-button href="/peserta">Batal</md-text-button>
        <md-filled-button type="submit">{modeUbah ? "Simpan perubahan" : "Simpan peserta"}</md-filled-button>
      </div>
    </form>
  );
}
