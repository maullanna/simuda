import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { MaterialRegister } from "@/components/MaterialRegister";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// next/font mengunduh font saat build lalu menyajikannya dari server kita sendiri,
// jadi tidak bergantung ke Google saat aplikasi dibuka.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SIMUDA",
  description: "Sistem Informasi Muda/i Bendlay 2 & Bendlay 4",
};

// Untuk pengunjung yang belum pernah memilih tema: ikuti pengaturan HP/laptop.
// Dijalankan sebelum halaman tampil, supaya tidak sempat berkedip putih dulu.
const skripTemaAwal = `
if (!document.documentElement.dataset.tema) {
  document.documentElement.dataset.tema =
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "gelap" : "terang";
}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Kalau pengguna pernah memilih tema, pilihannya tersimpan di cookie dan
  // langsung dipasang dari server.
  const temaCookie = (await cookies()).get("tema")?.value;
  const tema = temaCookie === "gelap" || temaCookie === "terang" ? temaCookie : undefined;

  return (
    // suppressHydrationWarning: atribut data-tema boleh diisi script di atas
    // sebelum React mengambil alih, jadi perbedaan kecil ini memang disengaja.
    <html lang="id" data-tema={tema} suppressHydrationWarning className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Script id="tema-awal" strategy="beforeInteractive">
          {skripTemaAwal}
        </Script>
        <MaterialRegister />
        {children}
      </body>
    </html>
  );
}
