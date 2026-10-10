import type { Metadata } from "next";
import { FormGantiSandi } from "@/components/akun/FormGantiSandi";
import { KerangkaMasuk } from "@/components/masuk/KerangkaMasuk";
import { TombolKeluar } from "@/components/TombolKeluar";
import { labelPeran } from "@/lib/kepengurusan";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Akun saya · SIMUDA",
};

// Akun saya: info akun dan ganti kata sandi sendiri.
// Sengaja di luar folder (pengurus) supaya petugas scan (yang tidak punya sidebar) juga bisa membukanya.
export default async function AkunPage() {
  const pengguna = await requireRole("akunSaya", "jalankan");
  const kembali =
    pengguna.peran === "petugas_scan"
      ? { href: "/scan", label: "Kembali ke Scanner" }
      : { href: "/dashboard", label: "Kembali ke Beranda" };

  return (
    <KerangkaMasuk judul="Akun saya" keterangan="Atur kata sandi untuk masuk ke SIMUDA" kembali={kembali}>
      <div className="flex items-center gap-3 rounded-2xl bg-surface-mid p-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-lg font-bold text-on-primary-container">
          {pengguna.nama.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{pengguna.nama}</p>
          <p className="truncate text-xs text-on-surface-variant">
            {pengguna.jabatan} · {pengguna.wilayah} · {labelPeran[pengguna.peran]}
          </p>
          <p className="truncate text-xs text-on-surface-variant">{pengguna.email}</p>
        </div>
        <TombolKeluar posisiLabel="bawah" />
      </div>
      <FormGantiSandi />
    </KerangkaMasuk>
  );
}
