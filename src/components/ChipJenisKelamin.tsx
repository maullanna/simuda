import { labelJenisKelamin, type JenisKelamin } from "@/lib/peserta";

// Chip kecil "Putra" (hijau) atau "Putri" (biru).
export function ChipJenisKelamin({ jenisKelamin }: { jenisKelamin: JenisKelamin }) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
        jenisKelamin === "putra"
          ? "bg-primary-container text-on-primary-container"
          : "bg-tertiary-container text-on-tertiary-container"
      }`}
    >
      {labelJenisKelamin[jenisKelamin]}
    </span>
  );
}
