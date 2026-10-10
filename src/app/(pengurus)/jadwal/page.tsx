import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarClock, Clock, FileText, Image as IkonFoto, User } from "lucide-react";
import { ChipJenisKelamin } from "@/components/ChipJenisKelamin";
import { TombolCatatan, TombolIsiMateri, TombolTambahSesi } from "@/components/jadwal/AksiJadwal";
import { dataAbsensiContoh } from "@/lib/mock";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal, jadwalRutin, labelSasaran, type Sesi } from "@/lib/sesi";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Jadwal & materi · SIMUDA",
};

// Chip kuning lembut untuk isian yang masih kosong. Sengaja bukan merah:
// ini pengingat untuk pengurus, bukan kesalahan.
function ChipPerluDiisi() {
  return (
    <span className="inline-flex rounded-lg bg-warning-container px-2 py-0.5 text-[11px] font-bold text-on-warning-container">
      Perlu diisi
    </span>
  );
}

function BarisSesiMendatang({ sesi, hariIni, daftarPemateri }: { sesi: Sesi; hariIni: string; daftarPemateri: string[] }) {
  const lengkap = sesi.materi !== "" && sesi.pemateri !== "";
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-mid p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <ChipJenisKelamin jenisKelamin={sesi.jenisKelamin} />
          <span className="text-xs font-semibold text-on-surface-variant">{labelSasaran[sesi.sasaran]}</span>
          {!lengkap && <ChipPerluDiisi />}
        </div>
        {sesi.materi ? (
          <p className="font-bold">{sesi.materi}</p>
        ) : (
          <p className="font-semibold italic text-on-surface-variant">Materi belum diisi</p>
        )}
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <User size={14} /> {sesi.pemateri || "Pemateri belum diisi"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {sesi.jamMulai}
          </span>
        </p>
      </div>
      <TombolIsiMateri sesi={sesi} hariIni={hariIni} daftarPemateri={daftarPemateri} />
    </div>
  );
}

function KartuCatatan({ sesi }: { sesi: Sesi }) {
  return (
    <article className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ChipJenisKelamin jenisKelamin={sesi.jenisKelamin} />
        <span className="text-xs font-semibold text-on-surface-variant">
          {formatTanggal(sesi.tanggal, { weekday: "long", day: "numeric", month: "long" })}
        </span>
        {!sesi.catatan && <ChipPerluDiisi />}
      </div>
      <div>
        <h3 className="font-extrabold">{sesi.materi}</h3>
        <p className="text-sm text-on-surface-variant">{sesi.pemateri}</p>
      </div>
      {sesi.catatan ? (
        <p className="line-clamp-3 text-sm leading-relaxed">{sesi.catatan}</p>
      ) : (
        <p className="text-sm italic text-on-surface-variant">
          Catatan belum diisi. Catatan materi diisi setelah pengajian selesai.
        </p>
      )}
      {sesi.lampiran && sesi.lampiran.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {sesi.lampiran.map((l) => {
            const Ikon = l.tipe === "foto" ? IkonFoto : FileText;
            return (
              <li
                key={l.nama}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-semibold text-on-surface-variant"
              >
                <Ikon size={14} className="shrink-0" />
                <span className="truncate">{l.nama}</span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-auto">
        <TombolCatatan sesi={sesi} />
      </div>
    </article>
  );
}

export default async function JadwalPage() {
  // Isi halaman bergantung pada tanggal hari ini, jadi dibuat saat dibuka, bukan saat build.
  await requireRole("sesi", "lihat");
  await connection();
  const hariIni = tanggalHariIniWib();
  const { sesi } = dataAbsensiContoh(hariIni);

  // Sesi mendatang, dikelompokkan per tanggal (putra dan putri di hari yang sama jadi satu kartu).
  const mendatang = sesi
    .filter((s) => s.status === "terjadwal")
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jenisKelamin.localeCompare(b.jenisKelamin));
  const perTanggal = [...new Set(mendatang.map((s) => s.tanggal))].map((tanggal) => ({
    tanggal,
    sesi: mendatang.filter((s) => s.tanggal === tanggal),
  }));
  const belumDiisi = mendatang.filter((s) => !s.materi || !s.pemateri).length;

  // Nama pemateri yang pernah mengisi, untuk "pilih cepat" di form.
  const daftarPemateri = [...new Set(sesi.map((s) => s.pemateri).filter(Boolean))].sort();

  // Catatan dari 3 hari pengajian terakhir yang sudah selesai.
  const tanggalSelesai = [...new Set(sesi.filter((s) => s.status === "selesai").map((s) => s.tanggal))]
    .sort()
    .reverse()
    .slice(0, 3);
  const catatanTerakhir = sesi
    .filter((s) => tanggalSelesai.includes(s.tanggal))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.jenisKelamin.localeCompare(b.jenisKelamin));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* Judul sudah tampil di navbar; h1 tetap ada untuk pembaca layar */}
          <h1 className="sr-only">Jadwal & materi</h1>
          <p className="text-on-surface-variant">
            {mendatang.length} sesi dalam 2 pekan ke depan
            {belumDiisi > 0 && ` · ${belumDiisi} materi belum diisi`}
          </p>
        </div>
        <TombolTambahSesi hariIni={hariIni} daftarPemateri={daftarPemateri} />
      </header>

      {/* Jadwal rutin */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Jadwal rutin</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {jadwalRutin.map((j, i) => (
            <div
              key={j.hari}
              className="muncul group flex items-center gap-4 rounded-[28px] bg-surface-low p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-container text-on-primary-container transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
                <CalendarClock size={22} />
              </div>
              <div>
                <p className="text-lg font-extrabold">{j.nama}</p>
                <p className="text-sm text-on-surface-variant">Pukul {j.jam} · putra & putri terpisah</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant">
          Hari pengajian masih contoh dan perlu dikonfirmasi ke Ketua Muda/i.
        </p>
      </section>

      {/* Sesi mendatang */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Sesi mendatang</h2>
        <div className="flex flex-col gap-3">
          {perTanggal.map(({ tanggal, sesi: sesiHariItu }) => (
            <article key={tanggal} className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-4 sm:flex-row sm:p-5">
              {/* Blok tanggal */}
              <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-center sm:justify-center sm:gap-0 sm:text-center">
                <p className="text-xs font-bold uppercase text-primary">
                  {formatTanggal(tanggal, { weekday: "short" })}
                </p>
                <p className="text-3xl font-extrabold leading-tight">{Number(tanggal.slice(8))}</p>
                <p className="text-xs font-semibold text-on-surface-variant">
                  {formatTanggal(tanggal, { month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {sesiHariItu.map((s) => (
                  <BarisSesiMendatang key={s.id} sesi={s} hariIni={hariIni} daftarPemateri={daftarPemateri} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Catatan pengajian terakhir */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Catatan pengajian terakhir</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {catatanTerakhir.map((s) => (
            <KartuCatatan key={s.id} sesi={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
