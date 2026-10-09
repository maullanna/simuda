"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, LoaderCircle } from "lucide-react";
import type { DataEksporRekap } from "@/lib/ekspor-rekap";

// Tombol unduh rekap sebagai Excel atau PDF. File dibuat di browser dari data
// yang sedang tampil (periode + filter), lalu langsung diunduh.
export function TombolUnduhRekap({ data, namaFile }: { data: DataEksporRekap; namaFile: string }) {
  const [proses, setProses] = useState<"excel" | "pdf" | null>(null);
  const [galat, setGalat] = useState(false);

  function unduh(blob: Blob, nama: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nama;
    a.click();
    // Beri waktu browser memulai unduhan sebelum alamat sementaranya dilepas.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function unduhExcel() {
    setProses("excel");
    setGalat(false);
    try {
      const { buatExcelRekap } = await import("@/lib/ekspor-rekap");
      unduh(await buatExcelRekap(data), `${namaFile}.xlsx`);
    } catch {
      setGalat(true);
    } finally {
      setProses(null);
    }
  }

  async function unduhPdf() {
    setProses("pdf");
    setGalat(false);
    try {
      const [{ pdf }, { DokumenRekap }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/rekap/DokumenRekap"),
      ]);
      unduh(await pdf(<DokumenRekap data={data} />).toBlob(), `${namaFile}.pdf`);
    } catch {
      setGalat(true);
    } finally {
      setProses(null);
    }
  }

  return (
    <>
      <md-outlined-button type="button" onClick={unduhExcel} disabled={proses !== null}>
        {proses === "excel" ? (
          <LoaderCircle slot="icon" size={18} className="animate-spin" />
        ) : (
          <FileSpreadsheet slot="icon" size={18} />
        )}
        Excel
      </md-outlined-button>
      <md-outlined-button type="button" onClick={unduhPdf} disabled={proses !== null}>
        {proses === "pdf" ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <FileText slot="icon" size={18} />}
        PDF
      </md-outlined-button>
      {galat && <p className="w-full text-sm text-error">File gagal dibuat. Coba lagi.</p>}
    </>
  );
}
