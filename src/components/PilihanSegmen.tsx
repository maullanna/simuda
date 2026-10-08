import { Check } from "lucide-react";

// Tombol bersegmen gaya Material 3 (misalnya Putra | Putri).
// Isinya radio button biasa yang disembunyikan, jadi nilainya otomatis ikut terkirim
// bersama form dan tetap bisa dipilih dengan keyboard.
export function PilihanSegmen({
  label,
  name,
  pilihan,
  nilaiAwal,
  error,
}: {
  label: string;
  name: string;
  pilihan: { nilai: string; label: string }[];
  nilaiAwal?: string;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold text-on-surface-variant">{label}</legend>
      <div
        className={`flex h-10 w-full overflow-hidden rounded-full border sm:w-fit ${
          error ? "border-error" : "border-outline"
        }`}
      >
        {pilihan.map((p, i) => (
          <label
            key={p.nilai}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-5 text-sm font-semibold transition-colors hover:bg-surface-high has-checked:bg-secondary-container has-checked:text-on-secondary-container has-focus-visible:bg-surface-highest sm:flex-none ${
              i > 0 ? "border-l border-outline" : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={p.nilai}
              defaultChecked={nilaiAwal === p.nilai}
              className="peer sr-only"
            />
            <Check size={16} className="hidden peer-checked:block" />
            {p.label}
          </label>
        ))}
      </div>
      {error && <p className="px-4 text-xs text-error">{error}</p>}
    </fieldset>
  );
}
