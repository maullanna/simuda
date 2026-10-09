// Perhitungan untuk halaman Rekap. Semua angka dihitung dari data sesi dan kehadiran,
// tidak ada yang disimpan terpisah, jadi tidak mungkin saling bertentangan.

import type { Angka, TitikKehadiran } from "@/components/beranda/GrafikKehadiran";
import type { Peserta } from "./peserta";
import { formatTanggal, pesertaSasaran, type Kehadiran, type Sesi } from "./sesi";

export type RekapPeserta = {
  peserta: Peserta;
  sesi: number; // jumlah sesi yang menjadi sasarannya di periode ini
  hadir: number;
  izin: number;
  alpa: number;
  persen: number;
};

function hitung(sesiDipakai: Sesi[], peserta: Peserta[], kehadiran: Kehadiran[]): Angka {
  const angka: Angka = { hadir: 0, izin: 0, alpa: 0, sasaran: 0 };
  for (const s of sesiDipakai) {
    const sasaran = pesertaSasaran(s, peserta);
    angka.sasaran += sasaran.length;
    for (const p of sasaran) {
      const status = kehadiran.find((k) => k.sesiId === s.id && k.pesertaId === p.id)?.status;
      if (status === "hadir") angka.hadir++;
      else if (status === "izin") angka.izin++;
      else if (status === "alpa") angka.alpa++;
    }
  }
  return angka;
}

// `peserta` sudah tersaring (kelompok, wilayah, kategori); `sesi` hanya sesi selesai di periode.
export function hitungRekap(sesi: Sesi[], peserta: Peserta[], kehadiran: Kehadiran[]) {
  const tanggal = [...new Set(sesi.map((s) => s.tanggal))].sort();

  const perTanggal: TitikKehadiran[] = tanggal
    .map((t) => {
      const sesiHariItu = sesi.filter((s) => s.tanggal === t);
      const putra = sesiHariItu.filter((s) => s.jenisKelamin === "putra");
      const putri = sesiHariItu.filter((s) => s.jenisKelamin === "putri");
      const aPutra = hitung(putra, peserta, kehadiran);
      const aPutri = hitung(putri, peserta, kehadiran);
      return {
        tanggal: t,
        label: formatTanggal(t, { day: "numeric", month: "short" }),
        labelPanjang: formatTanggal(t, { weekday: "long", day: "numeric", month: "long" }),
        gabungan: hitung(sesiHariItu, peserta, kehadiran),
        putra: aPutra.sasaran ? aPutra : null,
        putri: aPutri.sasaran ? aPutri : null,
      };
    })
    // Tanggal yang tidak punya peserta sasaran dari kelompok terpilih tidak ditampilkan.
    .filter((t) => t.gabungan.sasaran > 0);

  const perPeserta: RekapPeserta[] = peserta.map((p) => {
    const sesiSasaran = sesi.filter((s) => pesertaSasaran(s, [p]).length > 0);
    const a = hitung(sesiSasaran, [p], kehadiran);
    return { peserta: p, sesi: a.sasaran, hadir: a.hadir, izin: a.izin, alpa: a.alpa, persen: a.sasaran ? Math.round((a.hadir / a.sasaran) * 100) : 0 };
  });

  const total = perTanggal.reduce(
    (t, d) => ({
      hadir: t.hadir + d.gabungan.hadir,
      izin: t.izin + d.gabungan.izin,
      alpa: t.alpa + d.gabungan.alpa,
      sasaran: t.sasaran + d.gabungan.sasaran,
    }),
    { hadir: 0, izin: 0, alpa: 0, sasaran: 0 },
  );

  return { perTanggal, perPeserta, total };
}

export type PerluDihubungi = {
  peserta: Peserta;
  alasan: string;
  terakhirHadir: string | null; // tanggal YYYY-MM-DD, atau null kalau belum pernah tercatat hadir
};

// Daftar "perlu dihubungi" (KONSEP 5.6) beserta alasannya, untuk pengurus saja.
// Selalu dihitung dari 2 pengajian terakhir, tidak mengikuti filter tanggal,
// karena gunanya melihat keadaan saat ini.
export function daftarPerluDihubungi(sesi: Sesi[], peserta: Peserta[], kehadiran: Kehadiran[]): PerluDihubungi[] {
  const selesai = sesi.filter((s) => s.status === "selesai").sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return peserta.flatMap((p) => {
    if (p.status !== "aktif") return [];
    const sesiSasaran = selesai.filter((s) => pesertaSasaran(s, [p]).length > 0);
    const status = (s: Sesi) => kehadiran.find((k) => k.sesiId === s.id && k.pesertaId === p.id)?.status;

    const duaTerakhir = sesiSasaran.slice(0, 2).map(status);
    if (duaTerakhir.length < 2 || duaTerakhir.some((x) => x === "hadir")) return [];

    const alasan = duaTerakhir.every((x) => x === "izin")
      ? "Izin 2 pengajian berturut-turut"
      : "Tidak hadir 2 pengajian terakhir";
    const terakhirHadir = sesiSasaran.find((s) => status(s) === "hadir")?.tanggal ?? null;
    return [{ peserta: p, alasan, terakhirHadir }];
  });
}

// Nomor HP Indonesia ke format wa.me (tanpa 0 atau +): 081234... -> 6281234...
export function nomorWhatsApp(noHp: string): string | null {
  const angka = noHp.replace(/\D/g, "");
  if (!angka) return null;
  if (angka.startsWith("62")) return angka;
  if (angka.startsWith("0")) return `62${angka.slice(1)}`;
  return null;
}

