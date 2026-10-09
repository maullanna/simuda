import type { Metadata } from "next";
import { connection } from "next/server";
import { LayarScanner, type KartuScan, type SesiScan } from "@/components/scan/LayarScanner";
import { daftarPeserta, dataAbsensiContoh, kartuContoh } from "@/lib/mock";
import { labelJenisKelamin, tanggalHariIniWib } from "@/lib/peserta";
import { daftarPesertaSesi, formatTanggal, labelSasaran } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Scanner · SIMUDA",
};

// Layar petugas scan (KONSEP 4.2). Sengaja di luar folder (pengurus), jadi tampil
// penuh tanpa sidebar: petugas scan cukup melihat kamera dan hitungan hadir.
export default async function ScanPage(props: PageProps<"/scan">) {
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);

  const daftarSesi: SesiScan[] = sesi
    .filter((s) => s.tanggal === hariIni && s.status === "berlangsung")
    .map((s) => ({
      id: s.id,
      judul: `${labelJenisKelamin[s.jenisKelamin]} · ${labelSasaran[s.sasaran]}`,
      materi: s.materi,
      jam: s.jamMulai,
      jenisKelamin: s.jenisKelamin,
      peserta: daftarPesertaSesi(s, daftarPeserta, kehadiran),
    }));

  // Sesi dari tombol "Buka scanner" di Absensi (?sesi=...). Kalau hanya ada satu sesi, langsung dipakai.
  const { sesi: sesiDiminta } = await props.searchParams;
  const sesiAwal =
    daftarSesi.find((s) => s.id === sesiDiminta)?.id ?? (daftarSesi.length === 1 ? daftarSesi[0].id : null);

  // SEMENTARA (data contoh): daftar kartu dikirim ke browser supaya alur scan bisa dicoba.
  // Saat database tersambung, token dicocokkan di server dan daftar ini dihapus.
  const kartu: KartuScan[] = kartuContoh.flatMap((k) => {
    const p = daftarPeserta.find((x) => x.id === k.pesertaId);
    return p && p.status === "aktif" ? [{ token: k.token, pesertaId: p.id, nama: p.nama, jenisKelamin: p.jenisKelamin }] : [];
  });

  return <LayarScanner daftarSesi={daftarSesi} sesiAwal={sesiAwal} kartu={kartu} tanggal={formatTanggal(hariIni)} />;
}
