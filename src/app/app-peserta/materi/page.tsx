import { connection } from "next/server";
import { FileText, Image as IkonFoto, User } from "lucide-react";
import { KepalaHalaman } from "@/components/peserta-app/KepalaHalaman";
import { dataPesertaMasuk } from "@/lib/app-peserta";
import { tanggalHariIniWib } from "@/lib/peserta";
import { formatTanggal } from "@/lib/sesi";

// Materi pengajian yang sudah lewat, untuk dibaca ulang.
// Sengaja tidak menampilkan apakah peserta hadir di sesi itu (KONSEP bagian 6).
export default async function MateriPesertaPage() {
  await connection();
  const hariIni = tanggalHariIniWib();
  const d = dataPesertaMasuk(hariIni);
  const materi = d.lalu.slice(0, 12);

  return (
    <>
      <KepalaHalaman judul="Materi" keterangan="Ringkasan pengajian yang sudah lewat" />
      <main className="flex flex-col gap-3 px-5">
        {materi.length === 0 && (
          <p className="rounded-[28px] bg-surface-low px-6 py-10 text-center text-on-surface-variant">Belum ada materi.</p>
        )}
        {materi.map((s, i) => (
          <article
            key={s.id}
            className="muncul flex flex-col gap-2 rounded-[28px] bg-surface-low p-5"
            style={{ animationDelay: `${i * 50}ms`, animationDuration: "400ms" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {formatTanggal(s.tanggal, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="text-lg font-extrabold leading-snug">{s.materi}</h2>
            <p className="inline-flex items-center gap-1 text-sm text-on-surface-variant">
              <User size={14} /> {s.pemateri}
            </p>
            {s.catatan ? (
              <p className="text-sm leading-relaxed">{s.catatan}</p>
            ) : (
              <p className="text-sm text-on-surface-variant">Ringkasan materi sedang disiapkan pengurus.</p>
            )}
            {s.lampiran && s.lampiran.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {s.lampiran.map((l) => {
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
          </article>
        ))}
      </main>
    </>
  );
}
