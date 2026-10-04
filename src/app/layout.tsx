import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}