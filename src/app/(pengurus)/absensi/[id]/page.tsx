import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, CircleCheck, Clock, HandHeart, NotebookPen, ScanLine, User, UserX, Users } from "lucide-react";
import { KotakStat } from "@/components/beranda/KotakStat";
import { ChipJenisKelamin } from "@/components/ChipJenisKelamin";
import { FilterChip } from "@/components/FilterChip";
import { daftarPeserta, dataAbsensiContoh } from "@/lib/mock";
import { tanggalHariIniWib } from "@/lib/peserta";
import { daftarPesertaSesi, formatTanggal, labelSasaran, type PesertaSesi } from "@/lib/sesi";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Detail sesi · SIMUDA",
};

const tampilanStatus: Record<PesertaSesi["status"], { label: string; kelas: string }> = {
  hadir: { label: "Hadir", kelas: "bg-primary-container text-on-primary-container" },
  izin: { label: "Izin", kelas: "bg-tertiary-container text-on-tertiary-container" },
  // Alpa sengaja abu-abu netral, bukan merah (KONSEP bagian 6).
  alpa: { label: "Alpa", kelas: "bg-surface-highest text-on-surface-variant" },
  belum: { label: "Belum", kelas: "border border-outline-variant text-on-surface-variant" },
};

const labelStatusSesi = { terjadwal: "Terjadwal", berlangsung: "Berlangsung", selesai: "Selesai", batal: "Batal" };

// Detail satu sesi: siapa saja yang hadir, izin, alpa, atau belum tercatat.
export default async function DetailSesiPage(props: PageProps<"/absensi/[id]">) {
  await requireRole("daftarHadir", "lihat");
  await connection();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const hariIni = tanggalHariIniWib();
  const { sesi, kehadiran } = dataAbsensiContoh(hariIni);

  const s = sesi.find((x) => x.id === id);
  if (!s) notFound();

  // Peserta sasaran, ditambah peserta di luar sasaran yang ternyata ikut hadir.
  const semua = daftarPesertaSesi(s, daftarPeserta, kehadiran).filter((p) => !p.diLuarSasaran || p.status === "hadir");
  const catatan = (pesertaId: string) => kehadiran.find((k) => k.sesiId === s.id && k.pesertaId === pesertaId);

  const hitung = (st: PesertaSesi["status"]) => semua.filter((p) => p.status === st).length;
  const statusDipilih = typeof sp.status === "string" && sp.status in tampilanStatus ? (sp.status as PesertaSesi["status"]) : undefined;
  const tampil = statusDipilih ? semua.filter((p) => p.status === statusDipilih) : semua;
  const sasaran = semua.filter((p) => !p.diLuarSasaran).length;
  const selesai = s.status === "selesai";

  const urlStatus = (st?: string) => (st && st !== statusDipilih ? `/absensi/${s.id}?status=${st}` : `/absensi/${s.id}`);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link href="/absensi" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Absensi
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <ChipJenisKelamin jenisKelamin={s.jenisKelamin} />
          <span className="rounded-lg bg-surface-highest px-2.5 py-1 text-xs font-bold text-on-surface-variant">{labelSasaran[s.sasaran]}</span>
          <span className="rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-bold text-on-surface-variant">{labelStatusSesi[s.status]}</span>
        </div>
        <h1 className="text-2xl font-extrabold lg:text-3xl">{s.materi || "Materi belum diisi"}</h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
          <span>{formatTanggal(s.tanggal)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={15} /> {s.jamMulai.replace(":", ".")}
          </span>
          {s.pemateri && (
            <span className="inline-flex items-center gap-1">
              <User size={15} /> {s.pemateri}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {s.status === "berlangsung" && (
            <md-filled-button href={`/scan?sesi=${s.id}`}>
              <ScanLine slot="icon" size={18} />
              Buka scanner
            </md-filled-button>
          )}
          {selesai && (
            <md-outlined-button href="/jadwal">
              <NotebookPen slot="icon" size={18} />
              {s.catatan ? "Lihat catatan materi" : "Tulis catatan materi"}
            </md-outlined-button>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KotakStat ikon={Users} label="Peserta sasaran" nilai={sasaran} catatan={labelSasaran[s.sasaran]} jeda={0} />
        <KotakStat ikon={CircleCheck} label="Hadir" nilai={hitung("hadir")} catatan={`${semua.filter((p) => p.diLuarSasaran).length} di luar sasaran`} jeda={60} />
        <KotakStat ikon={HandHeart} label="Izin" nilai={hitung("izin")} catatan="Dikabari sebelum pengajian" jeda={120} />
        <KotakStat
          ikon={UserX}
          label={selesai ? "Alpa" : "Belum tercatat"}
          nilai={selesai ? hitung("alpa") : hitung("belum")}
          catatan={selesai ? "Tercatat saat sesi ditutup" : "Menjadi alpa saat sesi ditutup"}
          jeda={180}
        />
      </div>

      <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold">Daftar peserta</h2>
          <div className="flex flex-wrap gap-2">
            <FilterChip label={`Semua ${semua.length}`} href={urlStatus()} aktif={!statusDipilih} />
            {(selesai ? (["hadir", "izin", "alpa"] as const) : (["hadir", "izin", "belum"] as const)).map((st) => (
              <FilterChip key={st} label={`${tampilanStatus[st].label} ${hitung(st)}`} href={urlStatus(st)} aktif={statusDipilih === st} />
            ))}
          </div>
        </div>

        {tampil.length === 0 ? (
          <p className="py-10 text-center text-on-surface-variant">Tidak ada peserta dengan status ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="w-10 py-2 pr-2">No</th>
                  <th className="py-2 pr-3">Nama</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Tercatat</th>
                  <th className="hidden px-3 py-2 md:table-cell">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((p, i) => {
                  const k = catatan(p.id);
                  const metode = k?.metode === "qr" ? "Scan kartu" : k?.metode === "manual" ? "Input manual" : k?.metode === "izin" ? "Dicatat pengurus" : null;
                  return (
                    <tr key={p.id} className="border-t border-outline-variant/60">
                      <td className="py-2.5 pr-2 text-on-surface-variant">{i + 1}</td>
                      <td className="py-2.5 pr-3">
                        <Link href={`/peserta/${p.id}/ubah`} className="font-semibold hover:underline">
                          {p.nama}
                        </Link>
                        <p className="text-xs text-on-surface-variant">{p.wilayah}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${tampilanStatus[p.status].kelas}`}>
                          {tampilanStatus[p.status].label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-2.5 text-on-surface-variant sm:table-cell">
                        {metode && p.status !== "alpa" ? `${metode} · ${k?.waktu.replace(":", ".")}` : "–"}
                      </td>
                      <td className="hidden px-3 py-2.5 text-on-surface-variant md:table-cell">
                        {[k?.keterangan, p.diLuarSasaran ? "Di luar sasaran sesi ini" : null].filter(Boolean).join(" · ") || "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
