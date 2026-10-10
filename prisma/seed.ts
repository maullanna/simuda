import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Sasaran as SasaranDb, Wilayah as WilayahDb, WilayahPengurus } from "../src/generated/prisma/enums";
import { daftarPengurus, daftarPeserta, dataAbsensiContoh, dataMasukanContoh, dataMusyawarahContoh, dataSodaqohContoh, petugasScanContoh } from "../src/lib/mock";
import { tanggalHariIniWib } from "../src/lib/peserta";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }) });

const wilayahDb = (w: string): WilayahDb => (w === "Bendlay 4" ? "bendlay_4" : "bendlay_2");
const wilayahPengurusDb = (w: string): WilayahPengurus => (w === "Pimpinan" ? "pimpinan" : w === "Bendlay 4" ? "bendlay_4" : "bendlay_2");
const sasaranDb = (s: string): SasaranDb => (s === "pra-nikah" ? "pra_nikah" : s === "pra-remaja" ? "pra_remaja" : (s as SasaranDb));
const tanggal = (t: string) => new Date(`${t}T00:00:00Z`); 
const waktuWib = (t: string, jam: string) => new Date(`${t}T${jam}:00+07:00`);

const tokenAcak = () => randomBytes(16).toString("hex");

async function main() {
  const sudahAda = await prisma.peserta.count();
  if (sudahAda > 0 && process.env.SEED_TIMPA !== "ya") {
    throw new Error(`Database sudah berisi ${sudahAda} peserta, seed dibatalkan supaya data tidak tertimpa.\n` + "Kalau memang ingin mengisi ulang database PENGEMBANGAN, jalankan dengan SEED_TIMPA=ya.");
  }

  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);
  const { transaksi, riwayat } = dataSodaqohContoh(hariIni);
  const { musyawarah, tindakLanjut } = dataMusyawarahContoh(hariIni);
  const masukan = dataMasukanContoh(hariIni);

  const idPengurus = new Map(daftarPengurus.map((p) => [p.nama, p.id]));
  const pemateri = [...new Set(sesi.map((s) => s.pemateri).filter(Boolean))].map((nama, i) => ({ id: `m${i + 1}`, nama }));
  const idPemateri = new Map(pemateri.map((p) => [p.nama, p.id]));

  await prisma.$transaction(
    async (tx) => {
      await tx.auditLog.deleteMany();
      await tx.tindakLanjut.deleteMany();
      await tx.musyawarah.deleteMany();
      await tx.masukan.deleteMany();
      await tx.sodaqoh.deleteMany();
      await tx.lampiran.deleteMany();
      await tx.kehadiran.deleteMany();
      await tx.sesiPengajian.deleteMany();
      await tx.pemateri.deleteMany();
      await tx.kartu.deleteMany();
      await tx.pengurus.deleteMany();
      await tx.peserta.deleteMany();

      await tx.peserta.createMany({
        data: daftarPeserta.map((p) => ({
          id: p.id,
          nama: p.nama,
          jenisKelamin: p.jenisKelamin,
          wilayah: wilayahDb(p.wilayah),
          tanggalLahir: tanggal(p.tanggalLahir),
          noHp: p.noHp || null,
          status: p.status,
          tanggalBergabung: tanggal(p.tanggalBergabung),
        })),
      });

      await tx.kartu.createMany({
        data: daftarPeserta.filter((p) => p.status === "aktif").map((p) => ({ pesertaId: p.id, token: tokenAcak() })),
      });

      await tx.pengurus.createMany({
        data: [
          ...daftarPengurus.map((p) => ({
            id: p.id,
            nama: p.nama,
            jabatan: p.jabatan,
            wilayah: wilayahPengurusDb(p.wilayah),
            peran: p.peran,
          })),
          ...petugasScanContoh.map((pesertaId) => {
            const p = daftarPeserta.find((x) => x.id === pesertaId)!;
            return {
              id: `ps-${p.id}`,
              pesertaId: p.id,
              nama: p.nama,
              jabatan: "Petugas scan",
              wilayah: wilayahPengurusDb(p.wilayah),
              peran: "petugas_scan" as const,
            };
          }),
        ],
      });

      await tx.pemateri.createMany({ data: pemateri });

      await tx.sesiPengajian.createMany({
        data: sesi.map((s) => ({
          id: s.id,
          tanggal: tanggal(s.tanggal),
          jamMulai: s.jamMulai,
          jenisKelamin: s.jenisKelamin,
          sasaran: sasaranDb(s.sasaran),
          pemateriId: s.pemateri ? idPemateri.get(s.pemateri) : null,
          materi: s.materi || null,
          catatan: s.catatan ?? null,
          status: s.status,
        })),
      });

      await tx.lampiran.createMany({
        data: sesi.flatMap((s) =>
          (s.lampiran ?? []).map((l) => ({
            sesiId: s.id,
            url: `/contoh-lampiran/${l.nama}`, // file sungguhan belum ada; nanti alamat dari storage
            namaFile: l.nama,
            tipe: l.tipe,
          })),
        ),
      });

      await tx.kehadiran.createMany({
        data: kehadiran.map((k) => ({
          sesiId: k.sesiId,
          pesertaId: k.pesertaId,
          status: k.status,
          metode: k.metode,
          keterangan: k.keterangan ?? null,
          dicatatOleh: "seed", // belum ada akun login; nanti berisi id user pencatat
          waktu: waktuWib(sesi.find((s) => s.id === k.sesiId)!.tanggal, k.waktu),
        })),
      });

      await tx.sodaqoh.createMany({
        data: transaksi.map((t) => ({
          id: t.id,
          tanggal: tanggal(t.tanggal),
          jenis: t.jenis,
          jumlah: t.jumlah,
          keterangan: t.keterangan,
          penghitung1Id: t.penghitung ? idPengurus.get(t.penghitung[0]) : null,
          penghitung2Id: t.penghitung ? idPengurus.get(t.penghitung[1]) : null,
          buktiUrl: t.bukti ? `/contoh-nota/${t.bukti.nama}` : null,
          dicatatOleh: "seed",
        })),
      });

      await tx.auditLog.createMany({
        data: riwayat.map((r) => ({
          userId: "seed",
          tabel: "sodaqoh",
          recordId: r.transaksiId,
          aksi: "ubah",
          dataBaru: { ringkasan: r.perubahan, oleh: r.oleh },
          alasan: r.alasan,
          waktu: waktuWib(r.waktu.slice(0, 10), r.waktu.slice(11)),
        })),
      });

      await tx.musyawarah.createMany({
        data: musyawarah.map((m) => ({
          id: m.id,
          tanggal: tanggal(m.tanggal),
          jam: m.jam,
          lokasi: m.lokasi,
          agenda: m.agenda,
          hasil: m.hasil,
          notulisId: idPengurus.get(m.notulis) ?? null,
          status: m.status,
        })),
      });

      await tx.tindakLanjut.createMany({
        data: tindakLanjut.map((t) => ({
          id: t.id,
          musyawarahId: t.musyawarahId,
          tugas: t.tugas,
          picId: idPengurus.get(t.pic)!,
          tenggat: tanggal(t.tenggat),
          status: t.status,
        })),
      });

      await tx.masukan.createMany({
        data: masukan.map((m) => ({
          id: m.id,
          sesiId: m.sesiId,
          pesertaId: m.pesertaId,
          isi: m.isi,
          dibuatAt: waktuWib(m.dibuat.slice(0, 10), m.dibuat.slice(11)),
        })),
      });
    },
    { timeout: 60_000 },
  ); // koneksi ke Singapura butuh waktu; batas bawaan 5 detik terlalu pendek

  // Ringkasan hasil
  const hitung = {
    peserta: await prisma.peserta.count(),
    kartu: await prisma.kartu.count(),
    pengurus: await prisma.pengurus.count(),
    pemateri: await prisma.pemateri.count(),
    sesi: await prisma.sesiPengajian.count(),
    kehadiran: await prisma.kehadiran.count(),
    lampiran: await prisma.lampiran.count(),
    sodaqoh: await prisma.sodaqoh.count(),
    auditLog: await prisma.auditLog.count(),
    musyawarah: await prisma.musyawarah.count(),
    tindakLanjut: await prisma.tindakLanjut.count(),
    masukan: await prisma.masukan.count(),
  };
  console.log(`Seed selesai (tanggal acuan ${hariIni}):`);
  console.table(hitung);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
