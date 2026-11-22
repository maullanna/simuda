"use client";

import { useState, type DragEvent } from "react";
import { CircleCheck, Download, FileSpreadsheet, LoaderCircle, RotateCcw, TriangleAlert, Upload } from "lucide-react";
import { imporPeserta, type HasilImpor } from "@/app/(pengurus)/peserta/aksi";
import { formatUkuran } from "@/lib/format";
import { KOLOM_BIODATA_IMPOR, KOLOM_IMPOR, periksaBarisImpor, type BarisImpor, type PesertaAda } from "@/lib/impor-peserta";
import { labelKategori, type Kategori } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";

const BATAS_UKURAN = 5 * 1024 * 1024;

// exceljs dimuat hanya saat dibutuhkan, karena ukurannya cukup besar.
async function muatExcel() {
  const modul = await import("exceljs");
  return (modul as unknown as { default?: typeof modul }).default ?? modul;
}

function unduhBlob(blob: Blob, nama: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Impor pemuda/i dari Excel: semua dibaca dan diperiksa di browser dulu (pratinjau),
// lalu disimpan lewat Server Action imporPeserta() yang memeriksa ulang setiap baris.
// Kolom biodata hanya diproses kalau yang mengimpor Administrator (bolehBiodata).
export function ImporPeserta({ hariIni, sudahAda, bolehBiodata }: { hariIni: string; sudahAda: PesertaAda[]; bolehBiodata: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [baris, setBaris] = useState<BarisImpor[]>([]);
  const [galatFile, setGalatFile] = useState<string | null>(null);
  const [proses, setProses] = useState(false);
  const [diseret, setDiseret] = useState(false);
  const [hanyaMasalah, setHanyaMasalah] = useState(false);
  const [adaKolomBiodata, setAdaKolomBiodata] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [hasilImpor, setHasilImpor] = useState<Extract<HasilImpor, { ok: true }> | null>(null);
  const [galatSimpan, setGalatSimpan] = useState<string>();

  const siap = baris.filter((b) => b.masalah.length === 0);
  const bermasalah = baris.length - siap.length;
  const tampil = hanyaMasalah ? baris.filter((b) => b.masalah.length > 0) : baris;

  async function unduhTemplate() {
    const { Workbook } = await muatExcel();
    const buku = new Workbook();
    const sheet = buku.addWorksheet("Pemuda-i");
    const judul = [...KOLOM_IMPOR, ...KOLOM_BIODATA_IMPOR.map((b) => b.judul)];
    sheet.columns = judul.map((h) => ({ header: h, width: h === "Nama lengkap" || h === "Nama ayah" ? 28 : 16 }));
    // Kolom data diri (wajib) hijau tua, kolom biodata (boleh kosong) abu-abu.
    sheet.getRow(1).eachCell((sel, i) => {
      const wajib = i <= KOLOM_IMPOR.length;
      sel.font = { bold: true, color: { argb: wajib ? "FFFFFFFF" : "FF1F2937" } };
      sel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: wajib ? "FF2E6B30" : "FFE5E7EB" } };
    });
    sheet.addRow(["Contoh Nama Putra", "Putra", "Bendlay 2", "17/08/2009", "081234567890", ...KOLOM_BIODATA_IMPOR.map((b) => b.contoh)]);
    sheet.addRow(["Contoh Nama Putri", "Putri", "Bendlay 4", "2004-03-21", ""]);
    // No HP diformat teks supaya angka 0 di depan tidak hilang.
    sheet.getColumn(5).numFmt = "@";
    const petunjuk = buku.addWorksheet("Petunjuk");
    petunjuk.getColumn(1).width = 100;
    [
      "Cara mengisi:",
      "1. Isi satu orang per baris di sheet pertama. Hapus dua baris contoh sebelum mengunggah.",
      "2. Kolom hijau WAJIB: Nama lengkap, Jenis kelamin (Putra/Putri), Kelompok (Bendlay 2/Bendlay 4), Tanggal lahir (17/08/2009 atau 2009-08-17). No HP boleh kosong.",
      "3. Kategori pra-remaja/remaja/pra-nikah tidak perlu diisi, dihitung otomatis dari tanggal lahir.",
      "4. Kolom abu-abu = BIODATA (untuk Tim PnKB), semuanya boleh kosong:",
      "   - Anak ke, Jumlah saudara, Tinggi (cm), Berat (kg): angka saja.",
      "   - Golongan darah: A, B, AB, atau O.",
      "   - Status nikah: Belum menikah atau Menikah.",
      "   - Pendidikan: SD, SMP, SMA, SMK, D3, D4, S1, S2, S3 (MI = SD, MTs = SMP, MA = SMA). Jurusan ditulis di kolom Jurusan.",
      "5. Biodata hanya ikut tersimpan kalau yang mengimpor Administrator.",
      "6. File hasil Google Form juga bisa langsung diunggah, asalkan ada kolom Jenis kelamin.",
    ].forEach((t) => petunjuk.addRow([t]));
    unduhBlob(new Blob([await buku.xlsx.writeBuffer()]), "template-impor-pemudai-simuda.xlsx");
  }

  async function baca(f: File) {
    setFile(f);
    setBaris([]);
    setGalatFile(null);
    setHasilImpor(null);
    setGalatSimpan(undefined);
    if (!f.name.toLowerCase().endsWith(".xlsx")) {
      setGalatFile("Hanya file Excel .xlsx. Kalau masih .xls atau .csv, simpan ulang sebagai .xlsx dulu.");
      return;
    }
    if (f.size > BATAS_UKURAN) {
      setGalatFile("Ukuran file lebih dari 5 MB.");
      return;
    }
    setProses(true);
    try {
      const { Workbook } = await muatExcel();
      const buku = new Workbook();
      await buku.xlsx.load(await f.arrayBuffer());
      const sheet = buku.worksheets[0];
      if (!sheet) throw new Error("tanpa sheet");
      // Ambil semua baris apa adanya; row.values dimulai dari indeks 1 (kolom A).
      const mentah: unknown[][] = [];
      for (let r = 1; r <= sheet.rowCount; r++) {
        const nilai = sheet.getRow(r).values as unknown[];
        mentah.push(Array.from({ length: sheet.columnCount }, (_, c) => nilai[c + 1]));
      }
      const hasil = periksaBarisImpor(mentah, hariIni, sudahAda);
      setBaris(hasil.baris);
      setAdaKolomBiodata(hasil.adaKolomBiodata);
      setGalatFile(hasil.galatFile ?? null);
    } catch {
      setGalatFile("File tidak bisa dibaca. Pastikan file Excel .xlsx yang valid.");
    } finally {
      setProses(false);
    }
  }

  function saatJatuh(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDiseret(false);
    const f = e.dataTransfer.files[0];
    if (f) baca(f);
  }

  function ulang() {
    setFile(null);
    setBaris([]);
    setGalatFile(null);
    setHasilImpor(null);
    setGalatSimpan(undefined);
    setHanyaMasalah(false);
  }

  async function simpan() {
    setMenyimpan(true);
    setGalatSimpan(undefined);
    try {
      const hasil = await imporPeserta(
        siap.map((b) => ({
          nomorBaris: b.nomorBaris,
          nama: b.nama,
          jenisKelamin: b.jenisKelamin,
          wilayah: b.wilayah,
          tanggalLahir: b.tanggalLahir,
          noHp: b.noHp,
          biodata: b.biodata,
        })),
      );
      if (!hasil.ok) return setGalatSimpan(hasil.pesan);
      setHasilImpor(hasil);
    } catch {
      setGalatSimpan("Gagal menyimpan. Periksa koneksi internet lalu coba lagi. Tidak ada data yang tersimpan setengah.");
    } finally {
      setMenyimpan(false);
    }
  }

  if (hasilImpor) {
    const tidakIkut = bermasalah + hasilImpor.dilewati.length;
    return (
      <section className="flex max-w-2xl flex-col gap-4 rounded-[28px] bg-surface-low p-6">
        <div className="flex items-center gap-3">
          <CircleCheck size={28} className="text-primary" />
          <h2 className="text-xl font-extrabold">{hasilImpor.jumlah} pemuda/i berhasil disimpan</h2>
        </div>
        <p className="text-sm text-on-surface-variant">Setiap orang sudah dibuatkan kartu dan bisa langsung dicetak dari menu Cetak kartu.</p>
        {hasilImpor.biodataDiabaikan && (
          <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
            Kolom biodata tidak ikut tersimpan, karena biodata hanya boleh diisi oleh Administrator.
          </p>
        )}
        {tidakIkut > 0 && (
          <div className="rounded-2xl bg-surface-mid px-4 py-3 text-sm">
            <p className="font-semibold">Tidak ikut disimpan: {tidakIkut} baris</p>
            {hasilImpor.dilewati.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-on-surface-variant">
                {hasilImpor.dilewati.map((d) => (
                  <li key={d.nomorBaris}>
                    Baris {d.nomorBaris}: {d.alasan}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-on-surface-variant">Perbaiki di Excel lalu unggah ulang. Yang sudah tersimpan otomatis ditandai sudah terdaftar.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <md-filled-button href="/peserta">Kembali ke daftar</md-filled-button>
          <md-outlined-button type="button" onClick={ulang}>
            Impor file lain
          </md-outlined-button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Langkah 1 dan 2 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Langkah 1</p>
          <h2 className="font-extrabold">Isi template Excel</h2>
          <p className="text-sm text-on-surface-variant">
            Kolom wajib: {KOLOM_IMPOR.slice(0, 4).join(", ")}. Ditambah No HP dan {KOLOM_BIODATA_IMPOR.length} kolom biodata yang boleh kosong
            {bolehBiodata ? "" : " (biodata hanya tersimpan kalau yang mengimpor Administrator)"}.
          </p>
          <div>
            <md-outlined-button has-icon type="button" onClick={unduhTemplate}>
              <Download slot="icon" size={18} />
              Unduh template
            </md-outlined-button>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Langkah 2</p>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDiseret(true);
            }}
            onDragLeave={() => setDiseret(false)}
            onDrop={saatJatuh}
            className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-3xl border-2 border-dashed px-4 py-7 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
              diseret ? "border-primary bg-primary-container/40" : "border-outline-variant hover:bg-surface-high"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) baca(f);
                e.target.value = "";
              }}
              className="sr-only"
            />
            {proses ? (
              <LoaderCircle size={26} className="animate-spin text-primary" />
            ) : file ? (
              <FileSpreadsheet size={26} className="text-primary" />
            ) : (
              <Upload size={26} className="text-primary transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1" />
            )}
            <p className="font-bold">{proses ? "Membaca file..." : file ? file.name : "Tarik file Excel ke sini atau klik untuk memilih"}</p>
            <p className="text-xs text-on-surface-variant">{file ? `${formatUkuran(file.size)} · klik untuk ganti file` : "File .xlsx, maksimal 5 MB"}</p>
          </label>
          {galatFile && <p className="text-sm text-error">{galatFile}</p>}
        </section>
      </div>

      {/* Langkah 3: pratinjau */}
      {baris.length > 0 && (
        <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Langkah 3</p>
              <h2 className="font-extrabold">Periksa sebelum diimpor</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-bold sm:ml-auto">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1.5 text-on-primary-container">
                <CircleCheck size={16} /> {siap.length} siap
              </span>
              {bermasalah > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-warning-container px-3 py-1.5 text-on-warning-container">
                  <TriangleAlert size={16} /> {bermasalah} perlu diperbaiki
                </span>
              )}
            </div>
          </div>

          {adaKolomBiodata && !bolehBiodata && (
            <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
              File ini berisi kolom biodata. Biodata hanya boleh diisi Administrator, jadi kolom biodata akan diabaikan saat disimpan.
            </p>
          )}

          {bermasalah > 0 && (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={hanyaMasalah} onChange={(e) => setHanyaMasalah(e.target.checked)} className="size-4 accent-primary" />
              Tampilkan yang perlu diperbaiki saja
            </label>
          )}

          <div className="max-h-[28rem] overflow-auto rounded-2xl border border-outline-variant">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-mid text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-3 py-2.5">Baris</th>
                  <th className="px-3 py-2.5">Nama</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell">Jenis kelamin</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Kelompok</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Tanggal lahir</th>
                  {adaKolomBiodata && <th className="hidden px-3 py-2.5 lg:table-cell">Biodata</th>}
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((b) => {
                  const ok = b.masalah.length === 0;
                  return (
                    <tr key={b.nomorBaris} className={`border-t border-outline-variant/60 ${ok ? "" : "bg-warning-container/30"}`}>
                      <td className="px-3 py-2.5 text-on-surface-variant">{b.nomorBaris}</td>
                      <td className="px-3 py-2.5 font-semibold">{b.nama || "–"}</td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">{b.jenisKelamin === "putra" ? "Putra" : b.jenisKelamin === "putri" ? "Putri" : "–"}</td>
                      <td className="hidden px-3 py-2.5 md:table-cell">{b.wilayah || "–"}</td>
                      <td className="hidden whitespace-nowrap px-3 py-2.5 md:table-cell">
                        {b.kategori ? (
                          <>
                            {formatTanggal(b.tanggalLahir, { day: "numeric", month: "short", year: "numeric" })}
                            <span className="ml-1.5 text-xs text-on-surface-variant">{labelKategori[b.kategori as Kategori]}</span>
                          </>
                        ) : (
                          b.tanggalLahir || "–"
                        )}
                      </td>
                      {adaKolomBiodata && (
                        <td className="hidden px-3 py-2.5 text-on-surface-variant lg:table-cell">
                          {Object.keys(b.biodata).length ? `${Object.keys(b.biodata).length} kolom terisi` : "–"}
                        </td>
                      )}
                      <td className="px-3 py-2.5">
                        {ok ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                            <CircleCheck size={14} /> Siap
                          </span>
                        ) : (
                          <ul className="flex flex-col gap-0.5 text-xs text-on-warning-container">
                            {b.masalah.map((m) => (
                              <li key={m} className="flex gap-1">
                                <TriangleAlert size={12} className="mt-0.5 shrink-0" /> {m}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {bermasalah > 0 && siap.length > 0 && (
              <p className="mr-auto text-xs text-on-surface-variant">Baris yang perlu diperbaiki tidak ikut diimpor.</p>
            )}
            <md-text-button has-icon type="button" onClick={ulang}>
              <RotateCcw slot="icon" size={16} />
              Mulai ulang
            </md-text-button>
            <md-filled-button has-icon={menyimpan} type="button" disabled={siap.length === 0 || menyimpan} onClick={simpan}>
              {menyimpan && <LoaderCircle slot="icon" size={18} className="animate-spin" />}
              {menyimpan ? "Menyimpan..." : `Impor ${siap.length} pemuda/i`}
            </md-filled-button>
          </div>
          {galatSimpan && (
            <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {galatSimpan}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
