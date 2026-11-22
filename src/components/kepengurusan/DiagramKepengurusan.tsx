import { TombolAkun } from "@/components/kepengurusan/AksiAkun";
import { TombolUbahPengurus } from "@/components/kepengurusan/AksiKepengurusan";
import type { PengurusTampil } from "@/lib/data/pengurus";
import type { LevelRingkas } from "@/lib/kepengurusan";

export type HakDiagram = { bolehKelola: boolean; bolehAkun: boolean; pengurusIdSaya: string; pilihanLevel: LevelRingkas[] };
type Nada = "pimpinan" | "ketua" | "biasa";

// Tingkat di bagan dari teks jabatan: Kyai/Ketua di atas, semua "Wakil ..." di tengah, sisanya di bawah.
function tingkat(jabatan: string): number {
  const j = jabatan.toLowerCase();
  if (j.includes("wakil")) return 1;
  if (j.includes("kyai") || j.includes("ketua")) return 0;
  return 2;
}

// Urutan dalam satu baris bawah: Sekretaris, Bendahara, lalu jabatan lain menurut abjad.
function urutJabatan(a: PengurusTampil, b: PengurusTampil): number {
  const bobot = (j: string) => (/sekretaris|sekertaris/i.test(j) ? 0 : /bendahara/i.test(j) ? 1 : 2);
  return bobot(a.jabatan) - bobot(b.jabatan) || a.jabatan.localeCompare(b.jabatan, "id") || a.nama.localeCompare(b.nama, "id");
}

// Pengurus dikelompokkan per tingkat; tingkat yang kosong tidak ditampilkan.
export function susunBaris(daftar: PengurusTampil[]): PengurusTampil[][] {
  return [0, 1, 2].map((t) => daftar.filter((p) => tingkat(p.jabatan) === t).sort(urutJabatan)).filter((b) => b.length > 0);
}

const garis = "bg-outline-variant";

// Garis penghubung di atas/bawah satu kotak: tegak di tengah, mendatar ke kiri/kanan kalau ada saudara.
function Konektor({ posisi, pertama, terakhir }: { posisi: "atas" | "bawah"; pertama: boolean; terakhir: boolean }) {
  const tepi = posisi === "atas" ? "top-0" : "bottom-0";
  return (
    <div aria-hidden className="relative h-5 w-full">
      <span className={`absolute left-1/2 h-full w-0.5 -translate-x-1/2 ${garis}`} />
      {!pertama && <span className={`absolute left-0 right-1/2 h-0.5 ${tepi} ${garis}`} />}
      {!terakhir && <span className={`absolute left-1/2 right-0 h-0.5 ${tepi} ${garis}`} />}
    </div>
  );
}

function Tegak({ tinggi = "h-5" }: { tinggi?: string }) {
  return <div aria-hidden className={`mx-auto w-0.5 ${tinggi} ${garis}`} />;
}

const warnaNada: Record<Nada, string> = {
  pimpinan: "bg-primary-container text-on-primary-container",
  ketua: "bg-secondary-container text-on-secondary-container",
  biasa: "bg-surface-mid",
};

function Simpul({ p, hak, nada }: { p: PengurusTampil; hak: HakDiagram; nada: Nada }) {
  return (
    <div className={`group relative flex w-44 flex-col items-center gap-1.5 rounded-2xl p-3 text-center ${warnaNada[nada]} ${p.aktif ? "" : "opacity-60"}`}>
      {hak.bolehKelola && (
        <div className="absolute right-0.5 top-0.5">
          <TombolUbahPengurus pengurus={p} pilihanLevel={hak.pilihanLevel} />
        </div>
      )}
      <div className="grid size-10 place-items-center rounded-full bg-surface/70 text-sm font-extrabold transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
        {p.nama.replace(/^(KH|Ust|Ustzh)\.\s*/, "").charAt(0)}
      </div>
      <div className="w-full">
        <p className="line-clamp-2 text-sm font-bold leading-snug">{p.nama}</p>
        <p className={`text-xs ${nada === "biasa" ? "text-on-surface-variant" : "opacity-80"}`}>{p.jabatan}</p>
      </div>
      <div className="flex max-w-full justify-center">
        <TombolAkun akun={p} bolehKelola={hak.bolehAkun} diriSendiri={p.id === hak.pengurusIdSaya} />
      </div>
    </div>
  );
}

// Satu baris kotak dengan garis ke baris atas (atas) dan/atau ke baris bawah (bawah).
function Baris({ orang, hak, nada, atas, bawah }: { orang: PengurusTampil[]; hak: HakDiagram; nada: Nada; atas: boolean; bawah: boolean }) {
  return (
    <ul className="flex justify-center">
      {orang.map((p, i) => (
        <li key={p.id} className="flex flex-col items-center px-1.5">
          {atas && <Konektor posisi="atas" pertama={i === 0} terakhir={i === orang.length - 1} />}
          <Simpul p={p} hak={hak} nada={nada} />
          {bawah && <Konektor posisi="bawah" pertama={i === 0} terakhir={i === orang.length - 1} />}
        </li>
      ))}
    </ul>
  );
}

// Beberapa baris bertingkat yang saling terhubung. `atas`: baris pertama tersambung ke atasnya.
function Pohon({ baris, hak, pimpinan, atas }: { baris: PengurusTampil[][]; hak: HakDiagram; pimpinan: boolean; atas: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {baris.map((orang, i) => {
        const nada: Nada = pimpinan ? "pimpinan" : i === 0 && tingkat(orang[0].jabatan) === 0 ? "ketua" : "biasa";
        return (
          <div key={i} className="flex flex-col items-center">
            {i > 0 && <Tegak tinggi="h-3" />}
            <Baris orang={orang} hak={hak} nada={nada} atas={i > 0 || atas} bawah={i < baris.length - 1} />
          </div>
        );
      })}
    </div>
  );
}

// Bagan kepengurusan: pimpinan di puncak, lalu bercabang ke kelompok Bendlay 2 dan Bendlay 4.
export function DiagramKepengurusan({
  pimpinan,
  kelompok,
  hak,
}: {
  pimpinan: PengurusTampil[];
  kelompok: { wilayah: string; pengurus: PengurusTampil[] }[];
  hak: HakDiagram;
}) {
  const barisPimpinan = susunBaris(pimpinan);
  return (
    <section className="muncul flex flex-col gap-3 rounded-[28px] bg-surface-low p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-extrabold">Bagan kepengurusan</h2>
        <p className="text-xs text-on-surface-variant lg:hidden">Geser ke samping untuk melihat seluruh bagan</p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max min-w-full flex-col items-center py-2">
          {barisPimpinan.length > 0 && (
            <>
              <Pohon baris={barisPimpinan} hak={hak} pimpinan atas={false} />
              <Tegak tinggi="h-3" />
              <Konektor posisi="bawah" pertama terakhir />
            </>
          )}
          {/* Cabang per kelompok */}
          <ul className="flex justify-center">
            {kelompok.map((k, i) => {
              const baris = susunBaris(k.pengurus);
              return (
                <li key={k.wilayah} className="flex flex-col items-center px-3">
                  {barisPimpinan.length > 0 && <Konektor posisi="atas" pertama={i === 0} terakhir={i === kelompok.length - 1} />}
                  <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-extrabold text-on-primary">Kelompok {k.wilayah}</span>
                  {baris.length > 0 ? (
                    <Pohon baris={baris} hak={hak} pimpinan={false} atas />
                  ) : (
                    <>
                      <Tegak />
                      <p className="w-44 rounded-2xl border border-dashed border-outline-variant p-4 text-center text-sm text-on-surface-variant">Belum ada pengurus</p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
