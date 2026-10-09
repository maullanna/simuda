import Link from "next/link";
import { connection } from "next/server";
import { CircleCheck, Clock, QrCode, Sparkles, User } from "lucide-react";
import { TombolKabariIzin, type OpsiIzinPeserta } from "@/components/peserta-app/TombolKabariIzin";
import { TombolTema } from "@/components/TombolTema";
import { dataPesertaMasuk } from "@/lib/app-peserta";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal, geserTanggal, seninPekanIni } from "@/lib/sesi";

// Beranda peserta. Prinsip KONSEP bagian 6: hanya angka yang bisa naik,
// tanpa peringkat, streak, persentase, atau warna merah.
export default async function BerandaPesertaPage() {
  await connection();
  const hariIni = tanggalHariIniWib();
  const d = dataPesertaMasuk(hariIni);
  const namaDepan = d.peserta.nama.split(" ")[0];

  const berikutnya = d.mendatang[0];
  const sesiHariIni = berikutnya?.tanggal === hariIni;
  const sudahHadirHariIni = berikutnya ? d.sudahHadir(berikutnya) : false;

  const akhirPekan = geserTanggal(seninPekanIni(hariIni), 6);
  const pekanIni = d.mendatang.filter((s) => s.tanggal <= akhirPekan);

  // Izin bisa dikabarkan untuk pengajian dalam 7 hari ke depan yang belum hadir/izin.
  const opsiIzin: OpsiIzinPeserta[] = d.mendatang
    .filter((s) => s.tanggal <= geserTanggal(hariIni, 7) && !d.sudahHadir(s) && !d.sudahIzin(s))
    .map((s) => ({
      id: s.id,
      label: s.tanggal === hariIni ? "Hari ini" : formatTanggal(s.tanggal, { weekday: "long", day: "numeric", month: "short" }),
      keterangan: `${s.materi || "Materi menyusul"} · ${s.jamMulai.replace(":", ".")}`,
    }));

  return (
    <main className="flex flex-col gap-5 px-5 pt-5">
      <header className="flex items-center gap-3">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-full text-lg font-extrabold ${
            d.peserta.jenisKelamin === "putra" ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
          }`}
        >
          {namaDepan.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold">Assalamu&apos;alaikum, {namaDepan}</h1>
          <p className="text-sm text-on-surface-variant">{formatTanggal(hariIni)}</p>
        </div>
        <TombolTema className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high" />
      </header>

      {/* Angka yang hanya bisa naik */}
      <section className="muncul group relative isolate overflow-hidden rounded-[28px] bg-primary-container p-6 text-on-primary-container">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 -z-10 size-36 rounded-full bg-primary/15 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 right-16 -z-10 size-24 rounded-full bg-surface/40" />
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <Sparkles size={16} /> Sudah hadir
        </p>
        <p className="mt-1">
          <span className="text-6xl font-extrabold tracking-tight">{d.hadirTahunIni}</span>
          <span className="text-xl font-bold"> kali</span>
        </p>
        <p className="text-sm font-semibold">di pengajian tahun ini. Terima kasih sudah meluangkan waktu untuk mengaji.</p>
      </section>

      {/* Pengajian berikutnya */}
      {berikutnya ? (
        <section className="muncul flex flex-col gap-4 rounded-[28px] bg-surface-low p-5" style={{ animationDelay: "80ms" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {sesiHariIni ? "Pengajian hari ini" : "Pengajian berikutnya"}
          </p>
          <div className="flex gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface-mid py-2">
              <p className="text-xs font-bold uppercase text-primary">{formatTanggal(berikutnya.tanggal, { weekday: "short" })}</p>
              <p className="text-2xl font-extrabold leading-tight">{Number(berikutnya.tanggal.slice(8))}</p>
              <p className="text-xs text-on-surface-variant">{formatTanggal(berikutnya.tanggal, { month: "short" })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold leading-snug">{berikutnya.materi || "Materi menyusul"}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {berikutnya.jamMulai.replace(":", ".")}
                </span>
                {berikutnya.pemateri && (
                  <span className="inline-flex items-center gap-1">
                    <User size={14} /> {berikutnya.pemateri}
                  </span>
                )}
              </p>
            </div>
          </div>

          {sudahHadirHariIni ? (
            <p className="flex items-center gap-2 rounded-2xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container">
              <CircleCheck size={18} /> Kamu sudah tercatat hadir hari ini. Selamat mengaji!
            </p>
          ) : d.sudahIzin(berikutnya) ? (
            <p className="rounded-2xl bg-surface-mid px-4 py-3 text-sm text-on-surface-variant">
              Izinmu untuk pengajian ini sudah tersampaikan ke pengurus.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <md-filled-button href="/app-peserta/kartu">
                <QrCode slot="icon" size={18} />
                Buka kartu
              </md-filled-button>
              <TombolKabariIzin opsi={opsiIzin} />
            </div>
          )}
        </section>
      ) : (
        <p className="rounded-[28px] bg-surface-low px-6 py-10 text-center text-on-surface-variant">Belum ada jadwal pengajian berikutnya.</p>
      )}

      {/* Pekan ini */}
      <section className="muncul flex flex-col gap-3" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">Pekan ini</h2>
          <Link href="/app-peserta/jadwal" className="text-sm font-bold text-primary hover:underline">
            Semua jadwal
          </Link>
        </div>
        {pekanIni.length === 0 ? (
          <p className="rounded-2xl bg-surface-low px-4 py-6 text-center text-sm text-on-surface-variant">Tidak ada pengajian lagi pekan ini.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pekanIni.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-surface-low p-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-mid text-center leading-none">
                  <span className="text-[10px] font-bold uppercase text-primary">{formatTanggal(s.tanggal, { weekday: "short" })}</span>
                  <span className="text-base font-extrabold">{Number(s.tanggal.slice(8))}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{s.materi || "Materi menyusul"}</p>
                  <p className="text-xs text-on-surface-variant">
                    {s.tanggal === hariIni ? "Hari ini · " : ""}
                    {s.jamMulai.replace(":", ".")}
                    {s.pemateri ? ` · ${s.pemateri}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
