import type { Metadata } from "next";
import { FormGantiSandi } from "@/components/akun/FormGantiSandi";
import { KerangkaMasuk } from "@/components/masuk/KerangkaMasuk";
import { TombolKeluar } from "@/components/TombolKeluar";
import { halamanAwal, requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Akun saya · SIMUDA",
};

// Akun saya: info akun dan ganti kata sandi sendiri.
// Sengaja di luar folder (pengurus) supaya petugas scan (yang tidak punya sidebar) juga bisa membukanya.
export default async function AkunPage() {
  const pengguna = await requireRole("akunSaya", "jalankan");
  const awal = halamanAwal(pengguna);
  const kembali = { href: awal, label: awal === "/scan" ? "Kembali ke Scanner" : "Kembali" };

  return (
    <KerangkaMasuk judul="Akun saya" keterangan="Atur kata sandi untuk masuk ke SIMUDA" kembali={kembali}>
      <div className="flex items-center gap-3 rounded-2xl bg-surface-mid p-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-container text-lg font-bold text-on-primary-container">
          {pengguna.nama.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{pengguna.nama}</p>
          <p className="truncate text-xs text-on-surface-variant">
            {pengguna.jabatan} · {pengguna.wilayah} · {pengguna.levelNama}
          </p>
          <p className="truncate text-xs text-on-surface-variant">{pengguna.email}</p>
        </div>
        <TombolKeluar posisiLabel="bawah" />
      </div>
      <FormGantiSandi />
    </KerangkaMasuk>
  );
}
