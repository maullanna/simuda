// Lapisan data biodata muda/i dan data kelompok (KONSEP 5.1b). Hanya untuk server.
// Biodata sensitif: halaman/aksi WAJIB memeriksa hak (Administrator atau pemiliknya) sebelum memanggil ini.
import "server-only";
import { BIODATA_KOSONG, type Biodata, type DataKelompok } from "@/lib/biodata";
import { prisma } from "@/lib/db";
import { keWilayahDb } from "@/lib/data/peserta";
import type { Wilayah } from "@/lib/peserta";

export async function ambilBiodata(pesertaId: string): Promise<Biodata> {
  const b = await prisma.biodataPeserta.findUnique({ where: { pesertaId }, omit: { pesertaId: true, diubahAt: true } });
  return b ?? BIODATA_KOSONG;
}

const KELOMPOK_KOSONG = { desa: null, daerah: null, kipok: null, timPnkbKelompok: null, timPnkbDesa: null, timPnkbDaerah: null };

export async function ambilDataKelompok(wilayah: Wilayah): Promise<DataKelompok> {
  const k = await prisma.dataKelompok.findUnique({ where: { wilayah: keWilayahDb(wilayah) }, omit: { wilayah: true, diubahAt: true } });
  return { wilayah, ...(k ?? KELOMPOK_KOSONG) };
}

export async function ambilSemuaDataKelompok(): Promise<DataKelompok[]> {
  return Promise.all((["Bendlay 2", "Bendlay 4"] as const).map(ambilDataKelompok));
}
