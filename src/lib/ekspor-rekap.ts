// Data dan pembuat file Excel untuk unduhan rekap.
// Dijalankan di browser; library exceljs baru dimuat saat tombol Excel ditekan.

export type DataEksporRekap = {
  periode: string; // contoh "Oktober 2026"
  filter: string; // contoh "Putri · Bendlay 2" atau "Semua peserta"
  dibuat: string; // contoh "Jumat, 9 Oktober 2026"
  ringkasan: {
    pengajian: number;
    sesi: number;
    rataRata: number; // persen 0-100
    hadir: number;
    sasaran: number;
    izin: number;
    alpa: number;
  };
  perPeserta: {
    nama: string;
    kelompok: string;
    wilayah: string;
    kategori: string;
    sesi: number;
    hadir: number;
    izin: number;
    alpa: number;
    persen: number;
  }[];
  perSesi: {
    tanggal: string; // contoh "Kam, 8 Okt 2026"
    kelompok: string;
    sasaran: string;
    materi: string;
    pemateri: string;
    hadir: number;
    jumlahSasaran: number;
    izin: number;
    alpa: number;
  }[];
};

const HIJAU = "FF2E6B30";
const HIJAU_MUDA = "FFE5F4DF";

export async function buatExcelRekap(data: DataEksporRekap): Promise<Blob> {
  // exceljs dimuat hanya saat dibutuhkan, karena ukurannya cukup besar.
  const modul = await import("exceljs");
  const { Workbook } = (modul as unknown as { default?: typeof modul }).default ?? modul;
  const buku = new Workbook();
  buku.creator = "SIMUDA";
  buku.created = new Date();

  // ----- Sheet 1: Ringkasan -----
  const ringkas = buku.addWorksheet("Ringkasan");
  ringkas.columns = [{ width: 26 }, { width: 34 }];
  ringkas.addRow(["Rekap Kehadiran Pengajian Muda/i"]).font = { bold: true, size: 14, color: { argb: HIJAU } };
  ringkas.addRow(["Bendlay 2 & Bendlay 4"]);
  ringkas.addRow([]);
  const baris: [string, string | number][] = [
    ["Periode", data.periode],
    ["Filter", data.filter],
    ["Dibuat", data.dibuat],
    ["", ""],
    ["Jumlah pengajian", data.ringkasan.pengajian],
    ["Jumlah sesi (putra & putri)", data.ringkasan.sesi],
    ["Rata-rata hadir", data.ringkasan.rataRata / 100],
    ["Total hadir", data.ringkasan.hadir],
    ["Total kehadiran sasaran", data.ringkasan.sasaran],
    ["Total izin", data.ringkasan.izin],
    ["Total alpa", data.ringkasan.alpa],
  ];
  for (const [label, nilai] of baris) {
    const r = ringkas.addRow([label, nilai]);
    r.getCell(1).font = { bold: true };
    r.getCell(2).alignment = { horizontal: "left" };
    if (label === "Rata-rata hadir") r.getCell(2).numFmt = "0%";
  }

  // Gaya baris judul tabel: hijau dengan teks putih, dibekukan saat digulir, ada filter otomatis.
  function tabel(nama: string, kolom: { header: string; key: string; width: number }[]) {
    const sheet = buku.addWorksheet(nama, { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = kolom;
    const judul = sheet.getRow(1);
    judul.font = { bold: true, color: { argb: "FFFFFFFF" } };
    judul.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HIJAU } };
    judul.alignment = { vertical: "middle" };
    judul.height = 22;
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: kolom.length } };
    return sheet;
  }

  // ----- Sheet 2: Per peserta -----
  const peserta = tabel("Per peserta", [
    { header: "No", key: "no", width: 6 },
    { header: "Nama", key: "nama", width: 30 },
    { header: "Kelompok", key: "kelompok", width: 11 },
    { header: "Wilayah", key: "wilayah", width: 12 },
    { header: "Kategori", key: "kategori", width: 12 },
    { header: "Sesi", key: "sesi", width: 8 },
    { header: "Hadir", key: "hadir", width: 8 },
    { header: "Izin", key: "izin", width: 8 },
    { header: "Alpa", key: "alpa", width: 8 },
    { header: "Kehadiran", key: "persen", width: 11 },
  ]);
  data.perPeserta.forEach((p, i) => {
    const r = peserta.addRow({ no: i + 1, ...p, persen: p.persen / 100 });
    r.getCell("persen").numFmt = "0%";
    if (i % 2 === 1) r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HIJAU_MUDA } };
  });

  // ----- Sheet 3: Per sesi -----
  const sesi = tabel("Per sesi", [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "tanggal", width: 18 },
    { header: "Kelompok", key: "kelompok", width: 11 },
    { header: "Sasaran", key: "sasaran", width: 12 },
    { header: "Materi", key: "materi", width: 34 },
    { header: "Pemateri", key: "pemateri", width: 18 },
    { header: "Hadir", key: "hadir", width: 8 },
    { header: "Jumlah sasaran", key: "jumlahSasaran", width: 15 },
    { header: "Izin", key: "izin", width: 8 },
    { header: "Alpa", key: "alpa", width: 8 },
  ]);
  data.perSesi.forEach((s, i) => {
    const r = sesi.addRow({ no: i + 1, ...s });
    if (i % 2 === 1) r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HIJAU_MUDA } };
  });

  const isi = await buku.xlsx.writeBuffer();
  return new Blob([isi], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
