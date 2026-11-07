import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormLevel } from "@/components/level/FormLevel";
import { ambilLevel } from "@/lib/data/level";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Atur level · SIMUDA",
};

export default async function UbahLevelPage(props: PageProps<"/level-pengguna/[id]">) {
  await requireRole("levelPengguna", "jalankan");
  const { id } = await props.params;
  const level = await ambilLevel(id);
  if (!level) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/level-pengguna" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Level pengguna
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">{level.nama}</h1>
        <p className="text-on-surface-variant">Dipakai {level.jumlahPengurus} pengurus. Perubahan berlaku untuk mereka semua.</p>
      </header>
      <FormLevel level={level} />
    </div>
  );
}
