"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import {
  ArrowLeft,
  CameraOff,
  CircleCheck,
  CircleHelp,
  FlaskConical,
  RefreshCw,
  ScanLine,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";
import { TombolInputManual, TombolTutupSesi } from "@/components/absensi/AksiAbsensi";
import { TombolTema } from "@/components/TombolTema";
import type { JenisKelamin } from "@/lib/peserta";
import type { PesertaSesi } from "@/lib/sesi";

// Komponen kamera dimuat hanya di browser (ssr: false), karena kamera dan
// BarcodeDetector tidak ada di server.
const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-surface-highest" />,
});

export type SesiScan = {
  id: string;
  judul: string; // contoh "Putra · Gabungan"
  materi: string;
  jam: string;
  jenisKelamin: JenisKelamin;
  peserta: PesertaSesi[];
};

export type KartuScan = { token: string; pesertaId: string; nama: string; jenisKelamin: JenisKelamin };

type JenisUmpan = "berhasil" | "sudah" | "tidak-dikenal" | "beda-kelompok";
type Umpan = { kunci: number; jenis: JenisUmpan; nama?: string; waktu: string; catatan?: string };

const pesanKamera: Partial<Record<IScannerError["kind"], string>> = {
  "permission-denied": "Izin kamera ditolak. Buka pengaturan browser, izinkan kamera, lalu muat ulang halaman.",
  "no-camera": "Kamera tidak ditemukan di perangkat ini.",
  "in-use": "Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.",
  "insecure-context": "Kamera hanya bisa dibuka lewat HTTPS atau localhost.",
  unsupported: "Browser ini belum mendukung kamera. Coba Chrome terbaru.",
};

// Waktu sekarang dalam milidetik. Ditaruh di luar komponen karena membaca jam bukan bagian
// dari render; fungsi ini hanya dipanggil dari event (scan atau klik), bukan saat render.
function milidetikSekarang(): number {
  return Date.now();
}

function jamSekarang(): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date());
}

export function LayarScanner({
  daftarSesi,
  sesiAwal,
  kartu,
  tanggal,
}: {
  daftarSesi: SesiScan[];
  sesiAwal: string | null;
  kartu: KartuScan[];
  tanggal: string;
}) {
  const [sesiId, setSesiId] = useState<string | null>(sesiAwal);
  // Hasil scan di layar ini, per sesi. Belum tersimpan ke database.
  const [tercatat, setTercatat] = useState<Record<string, Record<string, string>>>({});
  const [umpan, setUmpan] = useState<Umpan | null>(null);
  const [riwayat, setRiwayat] = useState<Umpan[]>([]);
  const [kameraNyala, setKameraNyala] = useState(true);
  const [galatKamera, setGalatKamera] = useState<string | null>(null);
  const terakhir = useRef<{ token: string; saat: number }>({ token: "", saat: 0 });

  const sesi = daftarSesi.find((s) => s.id === sesiId) ?? null;

  // Daftar peserta sesi, digabung dengan hasil scan di layar ini.
  const peserta: PesertaSesi[] = sesi
    ? sesi.peserta.map((p) => (tercatat[sesi.id]?.[p.id] ? { ...p, status: "hadir" as const } : p))
    : [];
  const jumlahSasaran = peserta.filter((p) => !p.diLuarSasaran).length;
  const jumlahHadir = peserta.filter((p) => p.status === "hadir").length;

  // Umpan balik tampil 2,5 detik lalu hilang sendiri.
  useEffect(() => {
    if (!umpan) return;
    const jeda = setTimeout(() => setUmpan(null), 2500);
    return () => clearTimeout(jeda);
  }, [umpan]);

  function tampilkan(u: Omit<Umpan, "kunci" | "waktu">) {
    const lengkap = { ...u, kunci: milidetikSekarang(), waktu: jamSekarang() };
    setUmpan(lengkap);
    setRiwayat((r) => [lengkap, ...r].slice(0, 8));
  }

  // Inti layar ini: apa yang terjadi setelah sebuah token QR terbaca (KONSEP 8.2).
  // CATATAN: nanti pencarian token dilakukan di server lewat Server Action yang dicek
  // requireRole(). Daftar token TIDAK boleh dikirim ke browser seperti data contoh ini.
  function proses(token: string) {
    if (!sesi) return;

    // Kartu yang sama terbaca berkali-kali dalam 3 detik dianggap satu kali scan.
    const kini = milidetikSekarang();
    if (token === terakhir.current.token && kini - terakhir.current.saat < 3000) return;
    terakhir.current = { token, saat: kini };

    const k = kartu.find((x) => x.token === token);
    if (!k) {
      tampilkan({ jenis: "tidak-dikenal" });
      return;
    }
    if (k.jenisKelamin !== sesi.jenisKelamin) {
      tampilkan({ jenis: "beda-kelompok", nama: k.nama, catatan: `Kartu ini untuk sesi ${k.jenisKelamin}.` });
      return;
    }
    const p = peserta.find((x) => x.id === k.pesertaId);
    if (p?.status === "hadir") {
      tampilkan({ jenis: "sudah", nama: k.nama });
      return;
    }
    setTercatat((t) => ({ ...t, [sesi.id]: { ...t[sesi.id], [k.pesertaId]: jamSekarang() } }));
    navigator.vibrate?.(80);
    tampilkan({ jenis: "berhasil", nama: k.nama });
  }

  function saatScan(kode: IDetectedBarcode[]) {
    const token = kode[0]?.rawValue;
    if (token) proses(token);
  }

  // ----- Pilih sesi -----
  if (!sesi) {
    return (
      <Kerangka tanggal={tanggal}>
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 pt-6">
          <h1 className="text-2xl font-extrabold">Pilih sesi</h1>
          {daftarSesi.length === 0 ? (
            <p className="rounded-3xl bg-surface-low px-6 py-10 text-center text-on-surface-variant">
              Tidak ada pengajian yang sedang berlangsung hari ini.
            </p>
          ) : (
            daftarSesi.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSesiId(s.id)}
                className="muncul group flex items-center gap-4 rounded-[28px] bg-surface-low p-5 text-left transition-colors hover:bg-surface-mid"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 ${
                    s.jenisKelamin === "putra"
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-tertiary-container text-on-tertiary-container"
                  }`}
                >
                  <ScanLine size={26} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold">{s.judul}</p>
                  <p className="truncate text-sm text-on-surface-variant">
                    {s.materi} · {s.jam}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </Kerangka>
    );
  }

  // ----- Layar scan -----
  const belumHadir = peserta.filter((p) => !p.diLuarSasaran && p.status === "belum");
  const sudahHadir = peserta.filter((p) => p.status === "hadir");
  const kartuLain = kartu.find((k) => k.jenisKelamin !== sesi.jenisKelamin);

  return (
    <Kerangka
      tanggal={tanggal}
      sesiJudul={sesi.judul}
      gantiSesi={daftarSesi.length > 1 ? () => setSesiId(null) : undefined}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Kamera */}
        <div className="relative isolate aspect-square w-full overflow-hidden rounded-[28px] bg-on-surface sm:aspect-[4/3] lg:aspect-auto lg:min-h-[32rem]">
          {kameraNyala && !galatKamera ? (
            <Scanner
              onScan={saatScan}
              onError={(e) => setGalatKamera(pesanKamera[e.kind] ?? "Kamera tidak bisa dibuka.")}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              allowMultiple
              scanDelay={1500}
              sound={false}
              components={{ finder: false, torch: true, zoom: false, onOff: false }}
              classNames={{ container: "absolute! inset-0! size-full!", video: "size-full! object-cover!" }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center p-8 text-center text-surface">
              <div className="flex max-w-xs flex-col items-center gap-3">
                <CameraOff size={36} />
                <p className="text-sm">{galatKamera ?? "Kamera dimatikan."}</p>
                <md-filled-tonal-button
                  type="button"
                  onClick={() => {
                    setGalatKamera(null);
                    setKameraNyala(true);
                  }}
                >
                  <RefreshCw slot="icon" size={16} />
                  Nyalakan kamera
                </md-filled-tonal-button>
              </div>
            </div>
          )}

          {/* Bingkai pindai dengan garis bergerak */}
          {kameraNyala && !galatKamera && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
              <div className="relative size-[62%] max-h-80 max-w-80">
                {["left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((sudut) => (
                  <span key={sudut} className={`absolute size-10 border-primary-container ${sudut}`} />
                ))}
                <span className="absolute inset-x-3 h-0.5 rounded-full bg-primary-container shadow-[0_0_12px_2px] shadow-primary-container/70 animate-[garis-pindai_2.4s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Umpan balik setelah scan */}
          {umpan && <LapisanUmpan key={umpan.kunci} umpan={umpan} />}

          {kameraNyala && !galatKamera && (
            <button
              type="button"
              onClick={() => setKameraNyala(false)}
              className="absolute bottom-3 left-3 z-20 inline-flex h-9 items-center gap-1.5 rounded-full bg-on-surface/60 px-3 text-xs font-bold text-surface backdrop-blur hover:bg-on-surface/80"
            >
              <CameraOff size={14} /> Matikan kamera
            </button>
          )}
        </div>

        {/* Panel kanan: hitungan, aksi, riwayat */}
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-[28px] bg-surface-low p-5">
            <p className="text-sm text-on-surface-variant">{sesi.materi}</p>
            <p>
              <span key={jumlahHadir} className="inline-block animate-[letup_500ms_cubic-bezier(0.34,1.56,0.64,1)] text-5xl font-extrabold">
                {jumlahHadir}
              </span>
              <span className="text-lg font-semibold text-on-surface-variant"> / {jumlahSasaran} hadir</span>
            </p>
            <div className="h-3 overflow-hidden rounded-full bg-surface-highest">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ width: `${jumlahSasaran ? Math.min((jumlahHadir / jumlahSasaran) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <TombolInputManual judulSesi={`${sesi.judul} · ${sesi.materi}`} peserta={peserta} />
              <TombolTutupSesi judulSesi={`${sesi.judul} · ${sesi.materi}`} peserta={peserta} />
            </div>
          </section>

          <p className="rounded-2xl bg-warning-container px-4 py-3 text-xs text-on-warning-container">
            Mode tampilan: hasil scan hanya tersimpan di layar ini sampai database tersambung.
          </p>

          <section className="flex flex-col gap-2 rounded-[28px] bg-surface-low p-5">
            <h2 className="font-extrabold">Scan terakhir</h2>
            {riwayat.length === 0 ? (
              <p className="py-4 text-center text-sm text-on-surface-variant">Belum ada kartu yang dipindai.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {riwayat.map((r) => (
                  <BarisRiwayat key={r.kunci} umpan={r} />
                ))}
              </ul>
            )}
          </section>

          {/* Mode uji: mensimulasikan scan selama kartu ber-QR belum dicetak */}
          <details className="group rounded-[28px] bg-surface-low p-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-extrabold">
              <FlaskConical size={18} className="text-primary" /> Mode uji
              <span className="ml-auto text-xs font-semibold text-on-surface-variant group-open:hidden">Buka</span>
            </summary>
            <p className="mt-2 text-xs text-on-surface-variant">Simulasi scan untuk mencoba alur sebelum kartu dicetak.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Peserta belum hadir", token: kartu.find((k) => k.pesertaId === belumHadir[0]?.id)?.token, mati: belumHadir.length === 0 },
                { label: "Peserta sudah hadir", token: kartu.find((k) => k.pesertaId === sudahHadir[0]?.id)?.token, mati: sudahHadir.length === 0 },
                { label: "Kartu kelompok lain", token: kartuLain?.token, mati: !kartuLain },
                { label: "Kartu tidak dikenal", token: "kartu-palsu-123", mati: false },
              ].map((u) => (
                <button
                  key={u.label}
                  type="button"
                  disabled={u.mati}
                  onClick={() => {
                    terakhir.current = { token: "", saat: 0 }; // simulasi tidak kena jeda 3 detik
                    if (u.token) proses(u.token);
                  }}
                  className="h-8 rounded-lg border border-outline-variant px-3 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-highest disabled:opacity-40"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </Kerangka>
  );
}

// Bar atas layar scanner: kembali ke Absensi, sesi aktif, dan tombol tema.
function Kerangka({
  tanggal,
  sesiJudul,
  gantiSesi,
  children,
}: {
  tanggal: string;
  sesiJudul?: string;
  gantiSesi?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 pb-8 pt-3 lg:px-8 lg:pt-4">
      <header className="flex h-14 items-center gap-2 rounded-full bg-surface-low px-2">
        <Link
          href="/absensi"
          aria-label="Kembali ke Absensi"
          className="grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-highest"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate font-bold">{sesiJudul ? `Scanner · ${sesiJudul}` : "Scanner"}</p>
          <p className="truncate text-xs text-on-surface-variant">{tanggal}</p>
        </div>
        {gantiSesi && (
          <md-text-button type="button" onClick={gantiSesi}>
            Ganti sesi
          </md-text-button>
        )}
        <TombolTema className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-highest" />
      </header>
      {children}
    </div>
  );
}

const tampilanUmpan: Record<JenisUmpan, { latar: string; ikon: typeof CircleCheck }> = {
  berhasil: { latar: "bg-primary-container/95 text-on-primary-container", ikon: CircleCheck },
  sudah: { latar: "bg-secondary-container/95 text-on-secondary-container", ikon: UserRoundCheck },
  "tidak-dikenal": { latar: "bg-warning-container/95 text-on-warning-container", ikon: CircleHelp },
  "beda-kelompok": { latar: "bg-warning-container/95 text-on-warning-container", ikon: TriangleAlert },
};

// Lapisan besar di atas kamera. Sapaan untuk peserta sama untuk semua orang,
// tanpa menyebut riwayat kehadiran (prinsip KONSEP bagian 6).
function LapisanUmpan({ umpan }: { umpan: Umpan }) {
  const { latar, ikon: Ikon } = tampilanUmpan[umpan.jenis];
  return (
    <div
      role="status"
      aria-live="assertive"
      className={`muncul absolute inset-0 z-30 grid place-items-center p-6 text-center ${latar}`}
      style={{ animationDuration: "250ms" }}
    >
      <div className="flex flex-col items-center gap-3">
        {umpan.jenis === "berhasil" && umpan.nama ? (
          <div className="grid size-24 animate-[letup_600ms_cubic-bezier(0.34,1.56,0.64,1)] place-items-center rounded-full bg-primary text-4xl font-extrabold text-on-primary">
            {umpan.nama.charAt(0)}
          </div>
        ) : (
          <Ikon size={64} className="animate-[letup_600ms_cubic-bezier(0.34,1.56,0.64,1)]" />
        )}
        {umpan.jenis === "berhasil" && (
          <>
            <p className="text-lg font-semibold">Selamat datang,</p>
            <p className="text-3xl font-extrabold">{umpan.nama}</p>
          </>
        )}
        {umpan.jenis === "sudah" && (
          <>
            <p className="text-2xl font-extrabold">{umpan.nama}</p>
            <p className="font-semibold">Sudah tercatat hadir</p>
          </>
        )}
        {umpan.jenis === "tidak-dikenal" && (
          <>
            <p className="text-2xl font-extrabold">Kartu tidak dikenal</p>
            <p className="max-w-xs text-sm">Pastikan kartu SIMUDA yang masih aktif, atau catat lewat Input manual.</p>
          </>
        )}
        {umpan.jenis === "beda-kelompok" && (
          <>
            <p className="text-2xl font-extrabold">Bukan sesi ini</p>
            <p className="max-w-xs text-sm">
              {umpan.nama}. {umpan.catatan}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function BarisRiwayat({ umpan }: { umpan: Umpan }) {
  const { ikon: Ikon } = tampilanUmpan[umpan.jenis];
  const teks = {
    berhasil: umpan.nama,
    sudah: `${umpan.nama} · sudah tercatat`,
    "tidak-dikenal": "Kartu tidak dikenal",
    "beda-kelompok": `${umpan.nama} · bukan sesi ini`,
  }[umpan.jenis];
  return (
    <li className="muncul flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm" style={{ animationDuration: "300ms" }}>
      <Ikon size={18} className={umpan.jenis === "berhasil" ? "shrink-0 text-primary" : "shrink-0 text-on-surface-variant"} />
      <span className="min-w-0 flex-1 truncate font-semibold">{teks}</span>
      <span className="shrink-0 text-xs text-on-surface-variant">{umpan.waktu}</span>
    </li>
  );
}
