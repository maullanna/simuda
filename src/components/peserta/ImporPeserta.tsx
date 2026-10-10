"use client";

import { useState, type DragEvent } from "react";
import { CircleCheck, Download, FileSpreadsheet, LoaderCircle, RotateCcw, TriangleAlert, Upload } from "lucide-react";
import { formatUkuran } from "@/lib/format";
import { KOLOM_IMPOR, periksaBarisImpor, type BarisImpor, type PesertaAda } from "@/lib/impor-peserta";
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

// Impor peserta dari Excel: semua dibaca dan diperiksa di browser dulu,
// pengurus melihat pratinjau, baru kemudian (nanti) disimpan ke database.
export function ImporPeserta({ hariIni, sudahAda }: { hariIni: string; sudahAda: PesertaAda[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [baris, setBaris] = useState<BarisImpor[]>([]);
  const [galatFile, setGalatFile] = useState<string | null>(null);
  const [proses, setProses] = useState(false);
  const [diseret, setDiseret] = useState(false);
  const [hanyaMasalah, setHanyaMasalah] = useState(false);
  const [diimpor, setDiimpor] = useState(false);

  const siap = baris.filter((b) => b.masalah.length === 0);
  const bermasalah = baris.length - siap.length;
  const tampil = hanyaMasalah ? baris.filter((b) => b.masalah.length > 0) : baris;

  async function unduhTemplate() {
    const { Workbook } = await muatExcel();
    const buku = new Workbook();
    const sheet = buku.addWorksheet("Peserta");
    sheet.columns = KOLOM_IMPOR.map((h) => ({ header: h, width: h === "Nama lengkap" ? 30 : 16 }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E6B30" } };
    sheet.addRow(["Contoh Nama Putra", "Putra", "Bendlay 2", "17/08/2009", "081234567890"]);
    sheet.addRow(["Contoh Nama Putri", "Putri", "Bendlay 4", "2004-03-21", ""]);
    // Kolom No HP diformat teks supaya angka 0 di depan tidak hilang.
    sheet.getColumn(5).numFmt = "@";
    const petunjuk = buku.addWorksheet("Petunjuk");
    petunjuk.getColumn(1).width = 90;
    [
      "Cara mengisi:",
      "1. Isi satu peserta per baris di sheet \"Peserta\". Hapus dua baris contoh sebelum mengunggah.",
      "2. Jenis kelamin: Putra atau Putri.",
      "3. Wilayah: Bendlay 2 atau Bendlay 4.",
      "4. Tanggal lahir: 17/08/2009 atau 2009-08-17. Kategori pra-remaja/remaja/pra-nikah dihitung otomatis.",
      "5. No HP boleh dikosongkan.",
    ].forEach((t) => petunjuk.addRow([t]));
    unduhBlob(new Blob([await buku.xlsx.writeBuffer()]), "template-impor-peserta-simuda.xlsx");
  }

  async function baca(f: File) {
    setFile(f);
    setBaris([]);
    setGalatFile(null);
    setDiimpor(false);
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
    setDiimpor(false);
    setHanyaMasalah(false);
  }

  if (diimpor) {
    return (
      <section className="flex max-w-2xl flex-col gap-4 rounded-[28px] bg-surface-low p-6">
        <div className="flex items-center gap-3">
          <CircleCheck size={28} className="text-primary" />
          <h2 className="text-xl font-extrabold">{siap.length} peserta siap diimpor</h2>
        </div>
        <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
          Database belum tersambung, jadi data ini <b>belum benar-benar tersimpan</b>. Setelah tersambung, setiap peserta yang diimpor
          otomatis dibuatkan token kartu dan bisa langsung dicetak kartunya.
        </p>
        {bermasalah > 0 && (
          <p className="text-sm text-on-surface-variant">{bermasalah} baris yang bermasalah tidak ikut diimpor. Perbaiki di Excel lalu unggah ulang.</p>
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
          <p className="text-sm text-on-surface-variant">Kolom: {KOLOM_IMPOR.join(", ")}. Kategori pra-remaja/remaja/pra-nikah tidak perlu diisi.</p>
          <div>
            <md-outlined-button type="button" onClick={unduhTemplate}>
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
                  <th className="hidden px-3 py-2.5 sm:table-cell">Kelompok</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Wilayah</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Tanggal lahir</th>
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
            <md-text-button type="button" onClick={ulang}>
              <RotateCcw slot="icon" size={16} />
              Mulai ulang
            </md-text-button>
            <md-filled-button type="button" disabled={siap.length === 0} onClick={() => setDiimpor(true)}>
              Impor {siap.length} peserta
            </md-filled-button>
          </div>
        </section>
      )}
    </div>
  );
}
