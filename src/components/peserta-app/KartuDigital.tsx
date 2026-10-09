"use client";

import { useEffect, useState } from "react";

// Kartu peserta versi HP: QR yang sama dengan kartu cetak, untuk dipindai
// kalau kartu fisik tertinggal. QR hanya berisi token acak, tanpa data pribadi.
export function KartuDigital({
  nama,
  jenisKelamin,
  wilayah,
  token,
}: {
  nama: string;
  jenisKelamin: "putra" | "putri";
  wilayah: string;
  token: string;
}) {
  const [qr, setQr] = useState<string | null>(null);

  // Gambar QR dibuat di browser. Library qrcode baru dimuat saat halaman kartu dibuka.
  useEffect(() => {
    let batal = false;
    import("qrcode")
      .then(({ toDataURL }) => toDataURL(token, { errorCorrectionLevel: "M", margin: 1, width: 480 }))
      .then((url) => {
        if (!batal) setQr(url);
      });
    return () => {
      batal = true;
    };
  }, [token]);

  const putra = jenisKelamin === "putra";

  return (
    <div className="muncul overflow-hidden rounded-[28px] bg-surface-low">
      <div className="flex items-center gap-3 px-5 pt-5">
        <div className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-on-primary">S</div>
        <div className="leading-tight">
          <p className="font-extrabold">SIMUDA</p>
          <p className="text-xs text-on-surface-variant">Kartu peserta pengajian</p>
        </div>
      </div>

      {/* QR di atas latar putih supaya mudah terbaca kamera, juga di mode gelap */}
      <div className="mx-auto my-5 grid size-64 place-items-center rounded-3xl bg-white p-3">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- gambar data URL buatan sendiri, tidak perlu dioptimasi next/image
          <img src={qr} alt="Kode QR kartu peserta" className="size-full" />
        ) : (
          <div className="size-full animate-pulse rounded-2xl bg-surface-highest" />
        )}
      </div>

      <div className="flex flex-col items-center gap-2 px-5 pb-5 text-center">
        <p className="text-xl font-extrabold">{nama}</p>
        <div className="flex gap-1.5">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              putra ? "bg-primary-container text-on-primary-container" : "bg-tertiary-container text-on-tertiary-container"
            }`}
          >
            {putra ? "Putra" : "Putri"}
          </span>
          <span className="rounded-lg bg-surface-highest px-2.5 py-1 text-xs font-bold text-on-surface-variant">{wilayah}</span>
        </div>
      </div>
      <p className="bg-primary py-2 text-center text-xs font-bold tracking-wider text-on-primary">TUNJUKKAN KE PETUGAS SCAN</p>
    </div>
  );
}
