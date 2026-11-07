import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormLevel } from "@/components/level/FormLevel";
import { requireRole } from "@/lib/pengguna";

export const metadata: Metadata = {
  title: "Tambah level · SIMUDA",
};

export default async function TambahLevelPage() {
  await requireRole("levelPengguna", "jalankan");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href="/level-pengguna" className="flex w-fit items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={16} /> Level pengguna
        </Link>
        <h1 className="text-2xl font-extrabold lg:text-3xl">Tambah level</h1>
      </header>
      <FormLevel />
    </div>
  );
}
