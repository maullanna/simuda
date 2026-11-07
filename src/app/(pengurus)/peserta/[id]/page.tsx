import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { TombolSalinProfil } from "@/components/peserta/TombolSalinProfil";
import { labelStatusNikah, teksPendidikan, teksProfil } from "@/lib/biodata";
import { ambilBiodata, ambilDataKelompok } from "@/lib/data/biodata";
import { ambilPeserta } from "@/lib/data/peserta";
import { boleh } from "@/lib/hak-akses";
import { requireRole } from "@/lib/pengguna";
import { hitungUmur, kategoriPeserta, labelJenisKelamin, labelKategori } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Profil peserta · SIMUDA",
};

function Baris({ label, isi }: { label: string; isi: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-outline-variant/50 py-2.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-sm text-on-surface-variant sm:w-44">{label}</dt>
      <dd className="min-w-0 break-words font-semibold">{isi === null || isi === "" ? <span className="font-normal text-on-surface-variant/70">–</span> : isi}</dd>
    </div>
  );
}

// Profil peserta: data dasar untuk semua yang boleh melihat peserta, dan biodata lengkap
// (KONSEP 5.1b) hanya untuk Administrator (dan nanti pemiliknya sendiri). Biodata tidak dimuat sama sekali untuk yang lain.
export default async function ProfilPesertaPage(props: PageProps<"/peserta/[id]">) {
  const pengguna = await requireRole("peserta", "lihat");
  const { id } = await props.params;
  const peserta = await ambilPeserta(id);
  if (!peserta) notFound();

  const lihatBiodata = boleh(pengguna, "biodata", "lihat");
  const [biodata, kelompok] = lihatBiodata ? await Promise.all([ambilBiodata(id), ambilDataKelompok(peserta.wilayah)]) : [null, null];
  const umur = hitungUmur(peserta.tanggalLahir);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link href="/peserta" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Peserta
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold lg:text-3xl">
              {peserta.nama}
              {biodata?.namaAyah && (
                <span className="font-semibold text-on-surface-variant">
                  {" "}
                  {peserta.jenisKelamin === "putra" ? "bin" : "binti"} {biodata.namaAyah}
                </span>
              )}
            </h1>
            <p className="text-on-surface-variant">
              {labelJenisKelamin[peserta.jenisKelamin]} · {peserta.wilayah} · {labelKategori[kategoriPeserta(peserta.tanggalLahir)]} · {umur} th
              {peserta.status === "tidak_aktif" && " · tidak aktif"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {boleh(pengguna, "peserta", "ubah") && <md-outlined-button href={`/peserta/${id}/ubah`}>Ubah data & kartu</md-outlined-button>}
            {boleh(pengguna, "biodata", "ubah") && <md-outlined-button href={`/peserta/${id}/biodata`}>Ubah biodata</md-outlined-button>}
            {biodata && <TombolSalinProfil teks={teksProfil(peserta, biodata, kelompok)} />}
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="flex flex-col rounded-3xl bg-surface-low p-6">
          <h2 className="mb-2 font-extrabold">Data dasar</h2>
          <dl>
            <Baris label="Tanggal lahir" isi={formatTanggal(peserta.tanggalLahir, { day: "numeric", month: "long", year: "numeric" })} />
            <Baris label="No HP" isi={peserta.noHp} />
            <Baris label="Bergabung" isi={formatTanggal(peserta.tanggalBergabung, { day: "numeric", month: "long", year: "numeric" })} />
          </dl>
        </section>

        {biodata && kelompok ? (
          <>
            <section className="flex flex-col rounded-3xl bg-surface-low p-6">
              <h2 className="mb-2 font-extrabold">Biodata</h2>
              <dl>
                <Baris label="Tempat lahir" isi={biodata.tempatLahir} />
                <Baris label="Anak ke" isi={biodata.anakKe && biodata.jumlahSaudara ? `${biodata.anakKe} dari ${biodata.jumlahSaudara} bersaudara` : null} />
                <Baris label="Suku" isi={biodata.suku} />
                <Baris label="Tinggi / berat" isi={biodata.tinggiCm || biodata.beratKg ? `${biodata.tinggiCm ?? "–"} cm / ${biodata.beratKg ?? "–"} kg` : null} />
                <Baris label="Golongan darah" isi={biodata.golonganDarah} />
                <Baris label="Status" isi={biodata.statusNikah ? labelStatusNikah[biodata.statusNikah] : null} />
                <Baris label="Pendidikan" isi={teksPendidikan(biodata)} />
                <Baris label="Pekerjaan" isi={biodata.pekerjaan} />
                <Baris label="Skill" isi={biodata.skill} />
                <Baris label="Hobi" isi={biodata.hobi} />
                <Baris label="Dapukan" isi={biodata.dapukan} />
              </dl>
            </section>
            <section className="flex flex-col rounded-3xl bg-surface-low p-6 xl:col-span-2">
              <h2 className="font-extrabold">Sambung dan Tim PnKB</h2>
              <p className="mb-2 text-sm text-on-surface-variant">Sama untuk semua peserta {peserta.wilayah}. Diubah dari halaman Kepengurusan.</p>
              <dl className="grid gap-x-8 lg:grid-cols-2">
                <div>
                  <Baris label="Kelompok" isi={peserta.wilayah} />
                  <Baris label="Desa" isi={kelompok.desa} />
                  <Baris label="Daerah" isi={kelompok.daerah} />
                </div>
                <div>
                  <Baris label="Kipok (Kyai Kelompok)" isi={kelompok.kipok} />
                  <Baris label="Tim PnKB kelompok" isi={kelompok.timPnkbKelompok} />
                  <Baris label="Tim PnKB desa" isi={kelompok.timPnkbDesa} />
                  <Baris label="Tim PnKB daerah" isi={kelompok.timPnkbDaerah} />
                </div>
              </dl>
            </section>
          </>
        ) : (
          <section className="flex items-start gap-3 rounded-3xl bg-surface-low p-6 text-sm text-on-surface-variant">
            <Lock size={18} className="mt-0.5 shrink-0" />
            Biodata hanya bisa dilihat oleh pemiliknya sendiri dan Administrator.
          </section>
        )}
      </div>
    </div>
  );
}

