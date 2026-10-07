import type { Metadata } from "next";
import { penggunaAktif } from "@/lib/mock";

export const metadata: Metadata = {
  title: "Beranda · SIMUDA",
};

export default function DashboardPage() {
  const namaDepan = penggunaAktif.nama.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Assalamu&apos;alaikum, {namaDepan}</h1>
        <p className="text-on-surface-variant">Ringkasan pengajian muda/i Bendlay 2 & Bendlay 4</p>
      </header>
    </div>
  );
}
