import { cookies } from "next/headers";
import { KerangkaPengurus } from "@/components/KerangkaPengurus";
import { tanggalHariIniWib } from "@/lib/peserta";

// Folder (pengurus) memakai tanda kurung, jadi namanya tidak ikut ke URL:
// (pengurus)/dashboard/page.tsx dibuka di /dashboard, bukan /pengurus/dashboard.
// Semua halaman di dalam folder ini otomatis memakai sidebar dan navbar ini.
export default async function PengurusLayout({ children }: { children: React.ReactNode }) {
  // Ukuran sidebar (lebar/ciut) diingat lewat cookie. Dibaca di server supaya
  // tampilan pertama sudah benar, tidak lebar dulu lalu tiba-tiba menciut.
  const ciut = (await cookies()).get("sidebar")?.value === "ciut";

  return (
    <KerangkaPengurus ciutAwal={ciut} hariIni={tanggalHariIniWib()}>
      {children}
    </KerangkaPengurus>
  );
}
