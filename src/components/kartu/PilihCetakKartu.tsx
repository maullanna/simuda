"use client";

import { useEffect, useState } from "react";
import { Download, FileText, LoaderCircle, Printer } from "lucide-react";
import type { DataKartu, KontakKartu } from "@/components/kartu/DokumenKartu";

export type PesertaKartu = {
  id: string;
  nama: string;
  jenisKelamin: "putra" | "putri";
  wilayah: string;
  token: string;
};

const PER_LEMBAR = 10;

function inisial(nama: string): string {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

// Pilih peserta lalu buat PDF kartu. PDF dibuat di browser, jadi tidak ada file
// yang dikirim ke server. Library PDF dan QR baru dimuat saat tombol ditekan,
// supaya halaman tetap ringan dibuka.
export function PilihCetakKartu({
  peserta,
  awalTerpilih,
  kontak,
  namaFile,
}: {
  peserta: PesertaKartu[];
  awalTerpilih: string[];
  kontak: KontakKartu[];
  namaFile: string;
}) {
  const [terpilih, setTerpilih] = useState<string[]>(awalTerpilih);
  const [jk, setJk] = useState<"" | "putra" | "putri">("");
  const [wilayah, setWilayah] = useState("");
  const [belakang, setBelakang] = useState(true);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [urlPdf, setUrlPdf] = useState<string | null>(null);

  // URL PDF disimpan di memori browser; dilepas saat diganti atau halaman ditinggalkan.
  useEffect(() => {
    return () => {
      if (urlPdf) URL.revokeObjectURL(urlPdf);
    };
  }, [urlPdf]);

  const tampil = peserta.filter((p) => (!jk || p.jenisKelamin === jk) && (!wilayah || p.wilayah === wilayah));
  const semuaTampilTerpilih = tampil.length > 0 && tampil.every((p) => terpilih.includes(p.id));
  const jumlahLembar = Math.ceil(terpilih.length / PER_LEMBAR);

  function ubahPilihan(baru: string[]) {
    setTerpilih(baru);
    setUrlPdf(null); // pilihan berubah, PDF lama tidak berlaku lagi
  }

  function pilihSemuaTampil() {
    const idTampil = tampil.map((p) => p.id);
    ubahPilihan(
      semuaTampilTerpilih ? terpilih.filter((id) => !idTampil.includes(id)) : [...new Set([...terpilih, ...idTampil])],
    );
  }

  async function buatPdf() {
    setProses(true);
    setGalat(null);
    try {
      const [{ pdf }, { toDataURL }, { DokumenKartu }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("qrcode"),
        import("@/components/kartu/DokumenKartu"),
      ]);

      // Urutan kartu mengikuti urutan daftar (nama A-Z).
      const dipilih = peserta.filter((p) => terpilih.includes(p.id));
      const data: DataKartu[] = await Promise.all(
        dipilih.map(async (p) => ({
          id: p.id,
          nama: p.nama,
          inisial: inisial(p.nama),
          jenisKelamin: p.jenisKelamin === "putra" ? "Putra" : "Putri",
          wilayah: p.wilayah,
          // Isi QR hanya token acak (aturan keamanan no. 4).
          qr: await toDataURL(p.token, { errorCorrectionLevel: "M", margin: 1, width: 360 }),
        })),
      );

      const blob = await pdf(<DokumenKartu kartu={data} denganBelakang={belakang} kontak={kontak} />).toBlob();
      setUrlPdf(URL.createObjectURL(blob));
    } catch {
      setGalat("PDF gagal dibuat. Coba lagi, atau kurangi jumlah kartu.");
    } finally {
      setProses(false);
    }
  }

  const chip = (aktif: boolean) =>
    `h-8 rounded-lg border px-3 text-sm font-semibold transition-colors ${
      aktif
        ? "border-transparent bg-secondary-container text-on-secondary-container"
        : "border-outline-variant text-on-surface-variant hover:bg-surface-high"
    }`;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      {/* Kiri: pilih peserta */}
      <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(jk === "putra")} onClick={() => setJk(jk === "putra" ? "" : "putra")}>
            Putra
          </button>
          <button type="button" className={chip(jk === "putri")} onClick={() => setJk(jk === "putri" ? "" : "putri")}>
            Putri
          </button>
          {["Bendlay 2", "Bendlay 4"].map((w) => (
            <button key={w} type="button" className={chip(wilayah === w)} onClick={() => setWilayah(wilayah === w ? "" : w)}>
              {w}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-3 border-b border-outline-variant px-2 pb-3 text-sm font-bold">
          <input type="checkbox" checked={semuaTampilTerpilih} onChange={pilihSemuaTampil} className="size-4 accent-primary" />
          Pilih semua yang tampil ({tampil.length})
        </label>

        <ul className="flex max-h-[28rem] flex-col gap-0.5 overflow-y-auto">
          {tampil.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-high">
                <input
                  type="checkbox"
                  checked={terpilih.includes(p.id)}
                  onChange={(e) => ubahPilihan(e.target.checked ? [...terpilih, p.id] : terpilih.filter((x) => x !== p.id))}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.nama}</span>
                <span className="shrink-0 text-xs text-on-surface-variant">
                  {p.jenisKelamin === "putra" ? "Putra" : "Putri"} · {p.wilayah}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Kanan: ringkasan, opsi, pratinjau */}
      <section className="flex flex-col gap-4 rounded-[28px] bg-surface-low p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
            <Printer size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold">{terpilih.length} kartu</p>
            <p className="text-sm text-on-surface-variant">
              {jumlahLembar} lembar A4{belakang && jumlahLembar > 0 ? ` (${jumlahLembar * 2} halaman bolak-balik)` : ""} · 10 kartu per lembar
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-mid p-3 text-sm">
          <input
            type="checkbox"
            checked={belakang}
            onChange={(e) => {
              setBelakang(e.target.checked);
              setUrlPdf(null);
            }}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="font-bold">Sertakan sisi belakang</span>
            <span className="block text-xs text-on-surface-variant">
              Cetak bolak-balik, balik di sisi panjang. Sisi belakang sudah dicerminkan supaya pas di balik kartunya.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <md-filled-button type="button" disabled={terpilih.length === 0 || proses} onClick={buatPdf}>
            {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <FileText slot="icon" size={18} />}
            {proses ? "Membuat PDF..." : "Buat PDF"}
          </md-filled-button>
          {urlPdf && (
            <md-filled-tonal-button href={urlPdf} download={namaFile}>
              <Download slot="icon" size={18} />
              Unduh PDF
            </md-filled-tonal-button>
          )}
        </div>
        {galat && <p className="text-sm text-error">{galat}</p>}

        {urlPdf ? (
          <iframe title="Pratinjau kartu" src={urlPdf} className="h-[32rem] w-full rounded-2xl border border-outline-variant bg-surface" />
        ) : (
          <div className="grid h-48 place-items-center rounded-2xl border-2 border-dashed border-outline-variant px-6 text-center text-sm text-on-surface-variant">
            Pratinjau PDF muncul di sini setelah menekan &quot;Buat PDF&quot;.
          </div>
        )}

        <p className="text-xs text-on-surface-variant">
          Tidak dicetak di kartu: kategori (berubah sesuai usia), no HP, dan alamat. QR hanya berisi kode acak.
        </p>
      </section>
    </div>
  );
}
