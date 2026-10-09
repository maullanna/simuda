"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { FileText, Image as IkonFoto, Upload, X } from "lucide-react";
import { HasilSimpan } from "@/components/Dialog";
import { formatUkuran } from "@/lib/format";
import {
  BATAS_LAMPIRAN,
  PANJANG_CATATAN,
  periksaFileLampiran,
  type Lampiran,
  type Sesi,
} from "@/lib/sesi";

type FileBaru = { id: string; file: File; pratinjau: string | null };

// Form catatan pengajian beserta lampiran foto/PDF.
// File belum diunggah ke mana pun; hanya ditampilkan di browser sampai storage tersambung.
export function FormCatatan({ sesi, selesai }: { sesi: Sesi; selesai: () => void }) {
  const [catatan, setCatatan] = useState(sesi.catatan ?? "");
  const [lama, setLama] = useState<Lampiran[]>(sesi.lampiran ?? []);
  const [baru, setBaru] = useState<FileBaru[]>([]);
  const [galatCatatan, setGalatCatatan] = useState<string>();
  const [galatFile, setGalatFile] = useState<string[]>([]);
  const [diseret, setDiseret] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  // URL pratinjau foto disimpan di memori browser. Saat form ditutup, semuanya dilepas.
  const daftarBaru = useRef(baru);
  useEffect(() => {
    daftarBaru.current = baru;
  }, [baru]);
  useEffect(() => {
    return () => daftarBaru.current.forEach((f) => f.pratinjau && URL.revokeObjectURL(f.pratinjau));
  }, []);

  const jumlahLampiran = lama.length + baru.length;

  function tambahFile(files: FileList | null) {
    if (!files) return;
    const pesan: string[] = [];
    const diterima: FileBaru[] = [];
    let sisa = BATAS_LAMPIRAN.jumlah - jumlahLampiran;

    for (const file of Array.from(files)) {
      const salah = periksaFileLampiran(file);
      if (salah) {
        pesan.push(salah);
      } else if (sisa <= 0) {
        pesan.push(`${file.name}: maksimal ${BATAS_LAMPIRAN.jumlah} lampiran`);
      } else {
        diterima.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          pratinjau: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        });
        sisa--;
      }
    }
    setBaru((b) => [...b, ...diterima]);
    setGalatFile(pesan);
  }

  function hapusBaru(id: string) {
    setBaru((b) => {
      const dihapus = b.find((f) => f.id === id);
      if (dihapus?.pratinjau) URL.revokeObjectURL(dihapus.pratinjau);
      return b.filter((f) => f.id !== id);
    });
  }

  function saatJatuh(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDiseret(false);
    tambahFile(e.dataTransfer.files);
  }

  function saatSimpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const isi = catatan.trim();
    if (isi.length < PANJANG_CATATAN.min) {
      setGalatCatatan(`Catatan minimal ${PANJANG_CATATAN.min} huruf`);
      return;
    }
    if (isi.length > PANJANG_CATATAN.maks) {
      setGalatCatatan(`Catatan maksimal ${PANJANG_CATATAN.maks} huruf`);
      return;
    }
    // Database dan storage belum tersambung. Di sini nanti file diunggah lalu catatan disimpan.
    setTersimpan(true);
  }

  if (tersimpan) {
    return (
      <HasilSimpan judul="Catatan siap disimpan" tutup={selesai}>
        <p className="line-clamp-4 text-sm leading-relaxed">{catatan.trim()}</p>
        <p className="text-sm text-on-surface-variant">{jumlahLampiran} lampiran</p>
      </HasilSimpan>
    );
  }

  return (
    <form
      noValidate
      onSubmit={saatSimpan}
      onInput={(e) => {
        const kolom = e.target as HTMLElement & { name?: string; value?: string };
        if (kolom.name === "catatan") {
          setCatatan(kolom.value ?? "");
          setGalatCatatan(undefined);
        }
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <md-outlined-text-field
          name="catatan"
          label="Catatan pengajian"
          type="textarea"
          rows={5}
          value={sesi.catatan ?? ""}
          maxlength={PANJANG_CATATAN.maks}
          supporting-text="Ringkasan materi, jalannya diskusi, tugas untuk pertemuan berikutnya."
          error={Boolean(galatCatatan)}
          error-text={galatCatatan}
          className="w-full"
        />
        <p className="px-4 text-right text-xs text-on-surface-variant">
          {catatan.trim().length} / {PANJANG_CATATAN.maks}
        </p>
      </div>

      {/* Area unggah: tarik file ke sini, atau klik untuk memilih */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-on-surface-variant">
          Lampiran foto atau PDF ({jumlahLampiran}/{BATAS_LAMPIRAN.jumlah})
        </p>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputFile.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputFile.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDiseret(true);
          }}
          onDragLeave={() => setDiseret(false)}
          onDrop={saatJatuh}
          aria-disabled={jumlahLampiran >= BATAS_LAMPIRAN.jumlah}
          className={`group flex cursor-pointer flex-col items-center gap-1 rounded-3xl border-2 border-dashed px-4 py-6 text-center transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-50 ${
            diseret ? "border-primary bg-primary-container/40" : "border-outline-variant hover:bg-surface-highest"
          }`}
        >
          <Upload
            size={22}
            className={`text-primary transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 ${diseret ? "-translate-y-1 scale-110" : ""}`}
          />
          <p className="text-sm font-bold">{diseret ? "Lepaskan di sini" : "Tarik file ke sini atau klik untuk memilih"}</p>
          <p className="text-xs text-on-surface-variant">Foto atau PDF, maks. 5 MB per file</p>
        </div>
        <input
          ref={inputFile}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => {
            tambahFile(e.target.files);
            e.target.value = ""; // supaya file yang sama bisa dipilih lagi setelah dihapus
          }}
          className="hidden"
        />
        {galatFile.length > 0 && (
          <ul className="px-1 text-xs text-error">
            {galatFile.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {jumlahLampiran > 0 && (
          <ul className="flex flex-col gap-2">
            {lama.map((l) => (
              <BarisLampiran
                key={l.nama}
                nama={l.nama}
                tipe={l.tipe}
                keterangan="Sudah tersimpan"
                hapus={() => setLama((x) => x.filter((y) => y.nama !== l.nama))}
              />
            ))}
            {baru.map((f) => (
              <BarisLampiran
                key={f.id}
                nama={f.file.name}
                tipe={f.pratinjau ? "foto" : "pdf"}
                pratinjau={f.pratinjau}
                keterangan={`${formatUkuran(f.file.size)} · baru`}
                hapus={() => hapusBaru(f.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={selesai}>
          Batal
        </md-text-button>
        <md-filled-button type="submit">Simpan catatan</md-filled-button>
      </div>
    </form>
  );
}

function BarisLampiran({
  nama,
  tipe,
  pratinjau,
  keterangan,
  hapus,
}: {
  nama: string;
  tipe: "foto" | "pdf";
  pratinjau?: string | null;
  keterangan: string;
  hapus: () => void;
}) {
  const Ikon = tipe === "foto" ? IkonFoto : FileText;
  return (
    <li className="muncul flex items-center gap-3 rounded-2xl bg-surface-mid p-2 pr-1" style={{ animationDuration: "250ms" }}>
      <div
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-highest bg-cover bg-center text-on-surface-variant"
        style={pratinjau ? { backgroundImage: `url(${pratinjau})` } : undefined}
      >
        {!pratinjau && <Ikon size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{nama}</p>
        <p className="text-xs text-on-surface-variant">{keterangan}</p>
      </div>
      <button
        type="button"
        onClick={hapus}
        aria-label={`Hapus ${nama}`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest"
      >
        <X size={16} />
      </button>
    </li>
  );
}
