"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Check, LoaderCircle, Lock, RotateCcw, Save } from "lucide-react";
import { kembalikanHakAwal, simpanLevel } from "@/app/(pengurus)/level-pengguna/aksi";
import { DAFTAR_FITUR, SEMUA_FITUR, URUTAN_AKSI, aksiTersedia, bisaDicentang, labelAksi, type AksiCentang, type Fitur, type HakLevel } from "@/lib/hak-akses";

export type DataLevel = { id: string; kode: string | null; nama: string; keterangan: string | null; aksesPenuh: boolean; hak: HakLevel; jumlahPengurus: number };

const FITUR_CENTANG = SEMUA_FITUR.filter(bisaDicentang);
const FITUR_KHUSUS = SEMUA_FITUR.filter((f) => !bisaDicentang(f));

// Kotak centang kecil yang tetap jelas di HP (area sentuh 40px).
function Centang({ nyala, ubah, label, nonaktif }: { nyala: boolean; ubah: () => void; label: string; nonaktif?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={nyala}
      aria-label={label}
      disabled={nonaktif}
      onClick={ubah}
      className="mx-auto grid size-10 place-items-center rounded-full transition-colors hover:bg-surface-highest disabled:pointer-events-none"
    >
      <span
        className={`grid size-5 place-items-center rounded-md border-2 transition-colors ${
          nyala ? "border-primary bg-primary text-on-primary" : "border-outline"
        } ${nonaktif ? "opacity-60" : ""}`}
      >
        {nyala && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

// Form tambah/ubah level (KONSEP 3.1). Level Administrator ditampilkan terkunci (semua tercentang).
export function FormLevel({ level }: { level?: DataLevel }) {
  const router = useRouter();
  const terkunci = Boolean(level?.aksesPenuh);
  const [nama, setNama] = useState(level?.nama ?? "");
  const [keterangan, setKeterangan] = useState(level?.keterangan ?? "");
  const [hak, setHak] = useState<HakLevel>(level?.hak ?? {});
  const [galat, setGalat] = useState<{ nama?: string; keterangan?: string; umum?: string }>({});
  const [proses, setProses] = useState<"simpan" | "awal" | null>(null);

  const punya = (f: Fitur, a: AksiCentang) => terkunci || (hak[f] ?? []).includes(a);

  // Tambah/ubah/suspend tanpa lihat tidak masuk akal: mencentangnya ikut mencentang Lihat,
  // dan melepas Lihat ikut melepas tindakan lain di fitur itu.
  function ubahCentang(f: Fitur, a: AksiCentang) {
    setHak((h) => {
      const isi = new Set(h[f] ?? []);
      if (isi.has(a)) {
        isi.delete(a);
        if (a === "lihat") ["tambah", "ubah", "suspend"].forEach((x) => isi.delete(x as AksiCentang));
      } else {
        isi.add(a);
        if (a !== "lihat" && a !== "jalankan" && aksiTersedia(f).includes("lihat")) isi.add("lihat");
      }
      const urut = URUTAN_AKSI.filter((x) => isi.has(x));
      const baru = { ...h };
      if (urut.length) baru[f] = urut;
      else delete baru[f];
      return baru;
    });
  }

  function ubahSatuBaris(f: Fitur, semua: boolean) {
    setHak((h) => {
      const baru = { ...h };
      if (semua) baru[f] = aksiTersedia(f);
      else delete baru[f];
      return baru;
    });
  }

  async function simpan() {
    setProses("simpan");
    setGalat({});
    try {
      const hasil = await simpanLevel(level?.id ?? null, { nama, keterangan, hak });
      if (!hasil.ok) return setGalat({ ...hasil.galat, umum: hasil.pesan });
      router.push("/level-pengguna");
    } catch {
      setGalat({ umum: "Gagal menyimpan. Periksa koneksi internet lalu coba lagi." });
    } finally {
      setProses(null);
    }
  }

  async function keAwal() {
    if (!level) return;
    setProses("awal");
    try {
      const hasil = await kembalikanHakAwal(level.id);
      if (!hasil.ok) return setGalat({ umum: hasil.pesan });
      router.refresh();
      router.push("/level-pengguna");
    } finally {
      setProses(null);
    }
  }

  const jumlahDicentang = Object.values(hak).reduce((n, a) => n + (a?.length ?? 0), 0);

  return (
    <div className="flex max-w-4xl flex-col gap-4 sm:gap-6">
      {terkunci && (
        <p className="flex items-start gap-3 rounded-2xl bg-primary-container px-4 py-3 text-sm text-on-primary-container">
          <Lock size={18} className="mt-0.5 shrink-0" />
          Level Administrator terkunci: selalu akses penuh ke semua fitur, termasuk hapus permanen dan mengatur level. Tidak bisa diubah atau dihapus.
        </p>
      )}

      <section className="flex flex-col gap-4 rounded-3xl bg-surface-low p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr] sm:gap-4">
          <md-outlined-text-field
            label="Nama level"
            value={nama}
            disabled={terkunci}
            placeholder="Contoh: Penerobos"
            onInput={(e) => setNama((e.target as HTMLInputElement).value)}
            error={Boolean(galat.nama)}
            error-text={galat.nama}
            className="w-full"
          />
          <md-outlined-text-field
            label="Keterangan (opsional)"
            value={keterangan}
            disabled={terkunci}
            placeholder="Contoh: Seksi penggerak muda/i"
            onInput={(e) => setKeterangan((e.target as HTMLInputElement).value)}
            error={Boolean(galat.keterangan)}
            error-text={galat.keterangan}
            className="w-full"
          />
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-3xl bg-surface-low p-2 sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-2 pt-2">
          <h2 className="font-extrabold">Hak akses</h2>
          {!terkunci && <p className="text-sm text-on-surface-variant">{jumlahDicentang} hak dicentang</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-2 py-2">Fitur</th>
                {URUTAN_AKSI.map((a) => (
                  <th key={a} className="w-14 px-1 py-2 text-center">
                    {labelAksi[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FITUR_CENTANG.map((f, i) => {
                const info = DAFTAR_FITUR[f];
                const tersedia = aksiTersedia(f);
                const penuh = tersedia.every((a) => punya(f, a));
                return (
                  <Fragment key={f}>
                    {info.kelompok !== DAFTAR_FITUR[FITUR_CENTANG[i - 1]]?.kelompok && (
                      <tr>
                        <td colSpan={URUTAN_AKSI.length + 1} className="px-2 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-primary">
                          {info.kelompok}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t border-outline-variant/40">
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          disabled={terkunci}
                          onClick={() => ubahSatuBaris(f, !penuh)}
                          title={penuh ? "Lepas semua di baris ini" : "Centang semua di baris ini"}
                          className="text-left font-semibold hover:text-primary disabled:pointer-events-none"
                        >
                          {info.label}
                        </button>
                      </td>
                      {URUTAN_AKSI.map((a) => (
                        <td key={a} className="px-1 py-1 text-center">
                          {tersedia.includes(a) ? (
                            <Centang nyala={punya(f, a)} ubah={() => ubahCentang(f, a)} label={`${info.label}: ${labelAksi[a]}`} nonaktif={terkunci} />
                          ) : (
                            <span className="text-on-surface-variant/40">–</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mx-2 mb-2 mt-3 rounded-2xl bg-surface-mid px-4 py-3 text-sm text-on-surface-variant">
          <p className="font-semibold text-on-surface">Tidak perlu dicentang:</p>
          <ul className="mt-1 list-disc pl-5">
            {FITUR_KHUSUS.map((f) => (
              <li key={f}>
                {DAFTAR_FITUR[f].label}:{" "}
                {"selalu" in DAFTAR_FITUR[f] ? "selalu boleh untuk semua yang bisa masuk" : "khusus Administrator"}
              </li>
            ))}
            <li>Hapus permanen data: khusus Administrator</li>
          </ul>
        </div>
      </section>

      {galat.umum && (
        <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {galat.umum}
        </p>
      )}

      {!terkunci && (
        <div className="flex flex-wrap justify-end gap-2">
          {level?.kode && (
            <md-outlined-button has-icon type="button" disabled={proses !== null} onClick={keAwal}>
              {proses === "awal" ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <RotateCcw slot="icon" size={18} />}
              Kembalikan ke hak awal
            </md-outlined-button>
          )}
          <md-text-button href="/level-pengguna">Batal</md-text-button>
          <md-filled-button has-icon type="button" disabled={proses !== null} onClick={simpan}>
            {proses === "simpan" ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <Save slot="icon" size={18} />}
            {level ? "Simpan level" : "Tambah level"}
          </md-filled-button>
        </div>
      )}
    </div>
  );
}
