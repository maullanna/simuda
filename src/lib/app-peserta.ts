// Data untuk tampilan peserta di HP (KONSEP 4.3).
// Sengaja hanya menyiapkan hal positif: jumlah hadir, jadwal, materi.
// Jumlah alpa dan izin TIDAK dihitung di sini supaya tidak sampai tampil ke peserta (KONSEP bagian 6).

import { daftarPeserta, dataAbsensiContoh, kartuContoh, pesertaMasukContoh } from "./mock";
import { pesertaSasaran, type Sesi } from "./sesi";

export function dataPesertaMasuk(hariIni: string) {
  const peserta = daftarPeserta.find((p) => p.id === pesertaMasukContoh)!;
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);

  // Hanya sesi yang ditujukan untuk peserta ini (jenis kelamin dan kategorinya cocok).
  const sesiSaya = sesi
    .filter((s) => s.status !== "batal" && pesertaSasaran(s, [peserta]).length > 0)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const statusSaya = (s: Sesi) => kehadiran.find((k) => k.sesiId === s.id && k.pesertaId === peserta.id)?.status;

  const tahunIni = hariIni.slice(0, 4);
  const hadirTahunIni = sesiSaya.filter((s) => s.tanggal.startsWith(tahunIni) && statusSaya(s) === "hadir").length;

  const mendatang = sesiSaya.filter((s) => s.tanggal >= hariIni && s.status !== "selesai");
  const lalu = sesiSaya.filter((s) => s.status === "selesai").reverse();

  return {
    peserta,
    token: kartuContoh.find((k) => k.pesertaId === peserta.id)?.token ?? "",
    hadirTahunIni,
    mendatang,
    lalu,
    // Hanya dua keadaan yang dipakai tampilan: sudah hadir hari ini, atau sudah mengabari izin.
    sudahHadir: (s: Sesi) => statusSaya(s) === "hadir",
    sudahIzin: (s: Sesi) => statusSaya(s) === "izin",
  };
}
