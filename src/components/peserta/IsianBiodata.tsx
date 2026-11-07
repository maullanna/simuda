import { PilihanSegmen } from "@/components/PilihanSegmen";
import { BIODATA_KOSONG, DAFTAR_GOLONGAN_DARAH, labelJenjang, type Biodata, type JenjangPendidikan } from "@/lib/biodata";

export type GalatBiodata = Partial<Record<keyof Biodata, string>>;

// Teks bantu supaya angka 0 tidak dianggap kosong.
const awal = (v: string | number | null) => (v === null ? "" : String(v));

// Kotak isian: jarak tepi lebih kecil di HP supaya dua kolom tetap lega.
export const kotakIsian = "flex flex-col gap-4 rounded-3xl bg-surface-low p-4 sm:gap-5 sm:p-6";

// Isian biodata muda/i (KONSEP 5.1b), dipakai di form Tambah/Ubah peserta dan halaman Ubah biodata.
// Hanya berisi kolom; menyimpan diurus form induknya. Semua isian boleh kosong.
// Isian pendek dipasangkan dua kolom (juga di HP) supaya tidak banyak menggulir.
export function IsianBiodata({ biodata = BIODATA_KOSONG, galat, jenisKelamin }: { biodata?: Biodata; galat: GalatBiodata; jenisKelamin?: "putra" | "putri" }) {
  const kolom = (name: keyof Biodata, label: string, extra: { type?: string; placeholder?: string; supporting?: string } = {}) => (
    <md-outlined-text-field
      name={name}
      label={label}
      type={extra.type}
      placeholder={extra.placeholder}
      supporting-text={extra.supporting}
      value={awal(biodata[name])}
      autocomplete="off"
      error={Boolean(galat[name])}
      error-text={galat[name]}
      className="w-full"
    />
  );
  const binti = jenisKelamin === "putra" ? "bin" : jenisKelamin === "putri" ? "binti" : "bin/binti";

  return (
    <>
      <section className={kotakIsian}>
        <h2 className="font-extrabold">Keluarga dan kelahiran</h2>
        {kolom("namaAyah", "Nama ayah", { supporting: `Tampil sebagai "${binti} …" di profil` })}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {kolom("tempatLahir", "Kota lahir")}
          {kolom("suku", "Suku")}
          {kolom("anakKe", "Anak ke-", { type: "number" })}
          {kolom("jumlahSaudara", "Dari … saudara", { type: "number" })}
        </div>
      </section>

      <section className={kotakIsian}>
        <h2 className="font-extrabold">Fisik dan status</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {kolom("tinggiCm", "Tinggi (cm)", { type: "number" })}
          {kolom("beratKg", "Berat (kg)", { type: "number" })}
        </div>
        <PilihanSegmen
          label="Golongan darah"
          name="golonganDarah"
          nilaiAwal={biodata.golonganDarah ?? ""}
          error={galat.golonganDarah}
          pilihan={[...DAFTAR_GOLONGAN_DARAH.map((g) => ({ nilai: g, label: g })), { nilai: "", label: "Belum tahu" }]}
        />
        <PilihanSegmen
          label="Status pernikahan"
          name="statusNikah"
          nilaiAwal={biodata.statusNikah ?? ""}
          error={galat.statusNikah}
          pilihan={[
            { nilai: "belum_menikah", label: "Belum menikah" },
            { nilai: "menikah", label: "Menikah" },
            { nilai: "", label: "Kosong" },
          ]}
        />
      </section>

      <section className={kotakIsian}>
        <h2 className="font-extrabold">Pendidikan dan kegiatan</h2>
        <div className="grid grid-cols-[6.5rem_1fr] gap-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="sr-only">Jenjang pendidikan</span>
            <select
              name="pendidikanJenjang"
              defaultValue={biodata.pendidikanJenjang ?? ""}
              aria-label="Jenjang pendidikan"
              className={`h-14 cursor-pointer rounded-[4px] border bg-transparent px-4 text-on-surface outline-none focus:border-2 focus:border-primary ${galat.pendidikanJenjang ? "border-error" : "border-outline"}`}
            >
              <option value="">Jenjang</option>
              {(Object.keys(labelJenjang) as JenjangPendidikan[]).map((j) => (
                <option key={j} value={j}>
                  {labelJenjang[j]}
                </option>
              ))}
            </select>
            {galat.pendidikanJenjang && <span className="px-4 text-xs text-error">{galat.pendidikanJenjang}</span>}
          </label>
          {kolom("pendidikanJurusan", "Jurusan", { placeholder: "Contoh: Informatika" })}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {kolom("pekerjaan", "Pekerjaan")}
          {kolom("dapukan", "Dapukan")}
          {kolom("skill", "Skill")}
          {kolom("hobi", "Hobi")}
        </div>
      </section>
    </>
  );
}
