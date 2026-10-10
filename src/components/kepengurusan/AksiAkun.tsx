"use client";

import { useState, type FormEvent } from "react";
import { Ban, Check, Copy, KeyRound, LoaderCircle, RotateCcw, UserRoundPlus } from "lucide-react";
import { aturAkses, buatAkun, resetKataSandi, type HasilAksi } from "@/app/(pengurus)/kepengurusan/aksi";
import { Dialog } from "@/components/Dialog";
import { KolomKataSandi } from "@/components/KolomKataSandi";

export type InfoAkun = { id: string; nama: string; email: string | null; aktif: boolean };

// Panggil Server Action dan ubah kegagalan jaringan menjadi pesan yang bisa dibaca.
async function jalankan(aksi: () => Promise<HasilAksi>): Promise<HasilAksi> {
  try {
    return await aksi();
  } catch {
    return { ok: false, pesan: "Gagal tersambung ke server. Periksa koneksi internet lalu coba lagi." };
  }
}

function PesanGalat({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return (
    <p role="alert" className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
      {pesan}
    </p>
  );
}

// Ditampilkan sekali setelah akun dibuat / kata sandi direset. Kata sandi tidak disimpan
// dalam bentuk asli di mana pun, jadi ini satu-satunya kesempatan untuk menyalinnya.
function KataSandiJadi({ judul, email, sandi, tutup }: { judul: string; email: string; sandi: string; tutup: () => void }) {
  const [tersalin, setTersalin] = useState(false);
  const teks = `Akun SIMUDA\nEmail: ${email}\nKata sandi: ${sandi}\nMasuk di halaman /masuk lalu ganti kata sandi di menu Akun saya.`;
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 font-bold text-primary">
        <Check size={20} /> {judul}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-2xl bg-surface-mid px-4 py-3 text-sm">
        <dt className="text-on-surface-variant">Email</dt>
        <dd className="break-all font-semibold">{email}</dd>
        <dt className="text-on-surface-variant">Kata sandi</dt>
        <dd className="break-all font-mono font-semibold">{sandi}</dd>
      </dl>
      <p className="rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container">
        Kata sandi ini <b>hanya tampil sekarang</b>. Sampaikan lewat chat pribadi, jangan di grup, lalu minta dia
        menggantinya setelah masuk.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <md-outlined-button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(teks);
              setTersalin(true);
            } catch {
              setTersalin(false);
            }
          }}
        >
          {tersalin ? <Check slot="icon" size={18} /> : <Copy slot="icon" size={18} />}
          {tersalin ? "Tersalin" : "Salin pesan"}
        </md-outlined-button>
        <md-filled-button type="button" onClick={tutup}>
          Selesai
        </md-filled-button>
      </div>
    </div>
  );
}

function FormBuatAkun({ akun, tutup }: { akun: InfoAkun; tutup: () => void }) {
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<{ email?: string; kataSandi?: string; umum?: string }>({});
  const [proses, setProses] = useState(false);
  const [jadi, setJadi] = useState<{ email: string; sandi: string } | null>(null);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();
    const g: typeof galat = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) g.email = "Format email belum benar";
    if (sandi.length < 8) g.kataSandi = "Kata sandi minimal 8 karakter";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setProses(true);
    const hasil = await jalankan(() => buatAkun(akun.id, email, sandi));
    setProses(false);
    if (!hasil.ok) return setGalat({ ...hasil.galat, umum: hasil.galat ? undefined : hasil.pesan });
    setJadi({ email, sandi });
  }

  if (jadi) return <KataSandiJadi judul="Akun dibuat" email={jadi.email} sandi={jadi.sandi} tutup={tutup} />;

  return (
    <form
      noValidate
      onSubmit={simpan}
      onInput={(e) => {
        const nama = (e.target as HTMLElement & { name?: string }).name as keyof typeof galat | undefined;
        if (nama && galat[nama]) setGalat((g) => ({ ...g, [nama]: undefined, umum: undefined }));
      }}
      className="flex flex-col gap-4"
    >
      <PesanGalat pesan={galat.umum} />
      <md-outlined-text-field
        name="email"
        label="Email untuk masuk"
        type="email"
        autocomplete="off"
        error={Boolean(galat.email)}
        error-text={galat.email}
        className="w-full"
      />
      <KolomKataSandi name="kataSandi" label="Kata sandi awal" nilai={sandi} ubah={setSandi} galat={galat.kataSandi} bolehAcak />
      <div className="flex justify-end gap-2">
        <md-text-button type="button" onClick={tutup}>
          Batal
        </md-text-button>
        <md-filled-button type="submit" disabled={proses}>
          {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <UserRoundPlus slot="icon" size={18} />}
          {proses ? "Membuat..." : "Buat akun"}
        </md-filled-button>
      </div>
    </form>
  );
}

function FormResetSandi({ akun, email, selesai }: { akun: InfoAkun; email: string; selesai: () => void }) {
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string>();
  const [proses, setProses] = useState(false);
  const [jadi, setJadi] = useState(false);

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sandi.length < 8) return setGalat("Kata sandi minimal 8 karakter");
    setProses(true);
    const hasil = await jalankan(() => resetKataSandi(akun.id, sandi));
    setProses(false);
    if (!hasil.ok) return setGalat(hasil.pesan);
    setJadi(true);
  }

  if (jadi) return <KataSandiJadi judul="Kata sandi diganti" email={email} sandi={sandi} tutup={selesai} />;

  return (
    <form noValidate onSubmit={simpan} onInput={() => setGalat(undefined)} className="flex flex-col gap-3">
      <div>
        <h3 className="font-bold">Reset kata sandi</h3>
        <p className="text-sm text-on-surface-variant">Untuk yang lupa kata sandi. Semua perangkatnya akan dikeluarkan.</p>
      </div>
      <KolomKataSandi name="kataSandi" label="Kata sandi baru" nilai={sandi} ubah={setSandi} galat={galat} bolehAcak />
      <div className="flex justify-end">
        <md-filled-tonal-button type="submit" disabled={proses}>
          {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <KeyRound slot="icon" size={18} />}
          {proses ? "Menyimpan..." : "Ganti kata sandi"}
        </md-filled-tonal-button>
      </div>
    </form>
  );
}

function BagianAkses({ akun, selesai }: { akun: InfoAkun; selesai: () => void }) {
  const [yakin, setYakin] = useState(false);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string>();

  async function ubah(aktif: boolean) {
    setProses(true);
    const hasil = await jalankan(() => aturAkses(akun.id, aktif));
    setProses(false);
    if (!hasil.ok) return setGalat(hasil.pesan);
    selesai();
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-bold">Akses</h3>
        <p className="text-sm text-on-surface-variant">
          {akun.aktif
            ? "Cabut akses untuk pengurus yang sudah tidak menjabat. Datanya tetap tersimpan."
            : "Akses sedang dicabut: akun ini tidak bisa masuk ke SIMUDA."}
        </p>
      </div>
      <PesanGalat pesan={galat} />
      {akun.aktif && yakin && (
        <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {akun.nama} akan langsung dikeluarkan dari semua perangkat dan tidak bisa masuk lagi sampai aksesnya dipulihkan.
        </p>
      )}
      <div className="flex justify-end gap-2">
        {!akun.aktif ? (
          <md-filled-tonal-button type="button" disabled={proses} onClick={() => ubah(true)}>
            {proses ? <LoaderCircle slot="icon" size={18} className="animate-spin" /> : <RotateCcw slot="icon" size={18} />}
            Pulihkan akses
          </md-filled-tonal-button>
        ) : yakin ? (
          <>
            <md-text-button type="button" onClick={() => setYakin(false)}>
              Batal
            </md-text-button>
            <button
              type="button"
              disabled={proses}
              onClick={() => ubah(false)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-error px-5 text-sm font-semibold text-on-error transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {proses ? <LoaderCircle size={18} className="animate-spin" /> : <Ban size={18} />}
              Ya, cabut akses
            </button>
          </>
        ) : (
          <md-text-button type="button" onClick={() => setYakin(true)}>
            <Ban slot="icon" size={18} />
            Cabut akses
          </md-text-button>
        )}
      </div>
    </div>
  );
}

// Chip status akun di kartu pengurus. Diklik: dialog kelola akun (hanya untuk yang boleh mengelola).
export function TombolAkun({ akun, bolehKelola, diriSendiri }: { akun: InfoAkun; bolehKelola: boolean; diriSendiri: boolean }) {
  const [terbuka, setTerbuka] = useState(false);
  // Email saat dialog dibuka. Setelah akun dibuat halaman memuat ulang data (akun.email terisi),
  // tapi dialog tetap menampilkan kata sandi yang baru dibuat sampai ditutup.
  const [emailSaatDibuka, setEmailSaatDibuka] = useState<string | null>(null);
  const tutup = () => setTerbuka(false);

  const [teks, gaya] = !akun.aktif
    ? ["Akses dicabut", "bg-error-container text-on-error-container"]
    : akun.email
      ? [akun.email, "bg-surface-highest text-on-surface-variant"]
      : ["Belum punya akun", "border border-dashed border-outline text-on-surface-variant"];
  const chip = `inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${gaya}`;

  if (!bolehKelola) {
    return (
      <span className={chip}>
        <KeyRound size={12} className="shrink-0" />
        <span className="truncate">{teks}</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setEmailSaatDibuka(akun.email);
          setTerbuka(true);
        }}
        aria-label={`Kelola akun ${akun.nama}`}
        className={`${chip} group/akun transition-colors hover:bg-surface-highest hover:text-on-surface`}
      >
        <KeyRound size={12} className="shrink-0 transition-transform group-hover/akun:-rotate-12" />
        <span className="truncate">{teks}</span>
      </button>
      <Dialog terbuka={terbuka} tutup={tutup} judul={`Akun ${akun.nama}`} keterangan={akun.email ?? "Belum punya akun untuk masuk ke SIMUDA"}>
        {diriSendiri ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm">Ini akunmu sendiri. Ganti kata sandimu dari halaman Akun saya.</p>
            <div className="flex justify-end">
              <md-filled-button href="/akun">Buka Akun saya</md-filled-button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {emailSaatDibuka ? (
              <FormResetSandi akun={akun} email={emailSaatDibuka} selesai={tutup} />
            ) : (
              <FormBuatAkun akun={akun} tutup={tutup} />
            )}
            <div className="h-px bg-outline-variant" />
            <BagianAkses akun={akun} selesai={tutup} />
          </div>
        )}
      </Dialog>
    </>
  );
}
