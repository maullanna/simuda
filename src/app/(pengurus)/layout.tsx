import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { KerangkaPengurus } from "@/components/KerangkaPengurus";
import { ambilPenggunaMasuk } from "@/lib/pengguna";
import { tanggalHariIniWib } from "@/lib/peserta";

// Folder (pengurus) memakai tanda kurung, jadi namanya tidak ikut ke URL:
// (pengurus)/dashboard/page.tsx dibuka di /dashboard, bukan /pengurus/dashboard.
// Semua halaman di dalam folder ini otomatis memakai sidebar dan navbar ini.
export default async function PengurusLayout({ children }: { children: React.ReactNode }) {
  // Pemeriksaan sesi saat halaman pengurus dibuka langsung (bukan pengganti requireRole di
  // halaman/aksi: layout tidak dirender ulang setiap pindah halaman, lihat src/lib/pengguna.ts).
  const pengguna = await ambilPenggunaMasuk();
  if (!pengguna) redirect("/masuk");
  // Petugas scan hanya boleh membuka layar Scanner (KONSEP bagian 3).
  if (pengguna.peran === "petugas_scan") redirect("/scan");

  // Ukuran sidebar (lebar/ciut) diingat lewat cookie. Dibaca di server supaya
  // tampilan pertama sudah benar, tidak lebar dulu lalu tiba-tiba menciut.
  const ciut = (await cookies()).get("sidebar")?.value === "ciut";

  return (
    <KerangkaPengurus
      ciutAwal={ciut}
      hariIni={tanggalHariIniWib()}
      pengguna={{ nama: pengguna.nama, jabatan: pengguna.jabatan, wilayah: pengguna.wilayah }}
    >
      {children}
    </KerangkaPengurus>
  );
}
