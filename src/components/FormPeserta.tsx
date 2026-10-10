"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CircleCheck, LoaderCircle } from "lucide-react";
import { simpanPeserta } from "@/app/(pengurus)/peserta/aksi";
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
    const namaKolom = kolom.name as keyof IsianPeserta | undefined;
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
    const data = new FormData(e.currentTarget);
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
    if (Object.keys(galatBaru).length > 0) return;

    // 2) Simpan lewat Server Action. Server memeriksa ulang hak akses dan isian (Zod),
    //    karena pemeriksaan di browser bisa dilewati.
    setProses(true);
    try {
      const hasilServer = await simpanPeserta(peserta?.id ?? null, data);
      if (!hasilServer.ok) {
        setGalat(hasilServer.galat as GalatIsian);
        setPesanUmum(hasilServer.pesan ?? (Object.keys(hasilServer.galat).length ? undefined : "Gagal menyimpan."));
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
          <p className="text-sm text-on-surface-variant">Foto untuk kartu peserta. Boleh dikosongkan dulu; penyimpanan foto menyusul.</p>
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
              "Kategori pra-remaja / remaja / pra-nikah dihitung otomatis dari tanggal lahir."
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

      {pesanUmum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {pesanUmum}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <md-text-button href="/peserta">Batal</md-text-button>
        <md-filled-button type="submit" disabled={proses}>
          {proses && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
          {proses ? "Menyimpan..." : modeUbah ? "Simpan perubahan" : "Simpan peserta"}
        </md-filled-button>
      </div>
    </form>
  );
}
