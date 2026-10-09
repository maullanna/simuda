import { Lightbulb, ShieldAlert, Sun } from "lucide-react";
import { KartuDigital } from "@/components/peserta-app/KartuDigital";
import { KepalaHalaman } from "@/components/peserta-app/KepalaHalaman";
import { dataPesertaMasuk } from "@/lib/app-peserta";
import { tanggalHariIniWib } from "@/lib/peserta";

// Kartu peserta di HP. SEMENTARA (data contoh): token diambil dari mock.
// Nanti token diambil di server untuk peserta yang sedang login saja.
export default function KartuPesertaPage() {
  const d = dataPesertaMasuk(tanggalHariIniWib());

  return (
    <>
      <KepalaHalaman judul="Kartu" keterangan="Pakai kalau kartu cetak tertinggal" />
      <main className="flex flex-col gap-4 px-5">
        <KartuDigital nama={d.peserta.nama} jenisKelamin={d.peserta.jenisKelamin} wilayah={d.peserta.wilayah} token={d.token} />
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex gap-3 rounded-2xl bg-surface-low p-3">
            <Sun size={18} className="mt-0.5 shrink-0 text-primary" />
            Naikkan kecerahan layar supaya QR mudah terbaca kamera petugas.
          </li>
          <li className="flex gap-3 rounded-2xl bg-surface-low p-3">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-primary" />
            Kartu cetak dan kartu di HP sama-sama berlaku. Cukup tunjukkan salah satu.
          </li>
          <li className="flex gap-3 rounded-2xl bg-surface-low p-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-primary" />
            Jangan kirim tangkapan layar kartu ini ke orang lain, karena QR-nya bisa dipakai untuk absen atas namamu.
          </li>
        </ul>
      </main>
    </>
  );
}
