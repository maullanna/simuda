import { connection } from "next/server";
import { Clock, User } from "lucide-react";
import { KepalaHalaman } from "@/components/peserta-app/KepalaHalaman";
import { TombolKabariIzin } from "@/components/peserta-app/TombolKabariIzin";
import { dataPesertaMasuk } from "@/lib/app-peserta";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal, geserTanggal } from "@/lib/sesi";

// Jadwal pengajian peserta: hanya sesi yang ditujukan untuknya, 2 pekan ke depan.
export default async function JadwalPesertaPage() {
  await connection();
  const hariIni = tanggalHariIniWib();
  const d = dataPesertaMasuk(hariIni);
  const jadwal = d.mendatang.filter((s) => s.tanggal <= geserTanggal(hariIni, 14));

  return (
    <>
      <KepalaHalaman judul="Jadwal" keterangan="Pengajian untukmu dalam 2 pekan ke depan" />
      <main className="flex flex-col gap-3 px-5">
        {jadwal.length === 0 && (
          <p className="rounded-[28px] bg-surface-low px-6 py-10 text-center text-on-surface-variant">Belum ada jadwal.</p>
        )}
        {jadwal.map((s, i) => {
          const hariIniKah = s.tanggal === hariIni;
          const bisaIzin = s.tanggal <= geserTanggal(hariIni, 7) && !d.sudahHadir(s) && !d.sudahIzin(s);
          return (
            <article
              key={s.id}
              className={`muncul flex gap-4 rounded-[28px] p-4 ${hariIniKah ? "bg-primary-container text-on-primary-container" : "bg-surface-low"}`}
              style={{ animationDelay: `${i * 50}ms`, animationDuration: "400ms" }}
            >
              <div className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl py-2 ${hariIniKah ? "bg-surface/60" : "bg-surface-mid"}`}>
                <p className="text-[11px] font-bold uppercase">{formatTanggal(s.tanggal, { weekday: "short" })}</p>
                <p className="text-2xl font-extrabold leading-tight">{Number(s.tanggal.slice(8))}</p>
                <p className="text-[11px]">{formatTanggal(s.tanggal, { month: "short" })}</p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {hariIniKah && <p className="text-xs font-bold uppercase tracking-wider">Hari ini</p>}
                <p className="font-extrabold leading-snug">{s.materi || "Materi menyusul"}</p>
                <p className="flex flex-wrap gap-x-3 text-sm opacity-80">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} /> {s.jamMulai.replace(":", ".")}
                  </span>
                  {s.pemateri && (
                    <span className="inline-flex items-center gap-1">
                      <User size={14} /> {s.pemateri}
                    </span>
                  )}
                </p>
                {d.sudahIzin(s) && <p className="text-xs font-semibold opacity-80">Izin sudah tersampaikan</p>}
                {bisaIzin && (
                  <div className="-ml-3 mt-1">
                    <TombolKabariIzin
                      varian="teks"
                      opsi={[
                        {
                          id: s.id,
                          label: hariIniKah ? "Hari ini" : formatTanggal(s.tanggal, { weekday: "long", day: "numeric", month: "short" }),
                          keterangan: `${s.materi || "Materi menyusul"} · ${s.jamMulai.replace(":", ".")}`,
                        },
                      ]}
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </main>
    </>
  );
}
