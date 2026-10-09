// Label kecil yang muncul saat kursor diarahkan ke induknya (induk wajib punya
// class "group relative"). Teksnya tetap terbaca pembaca layar walau tidak terlihat.
export function LabelMelayang({
  teks,
  posisi = "kanan",
}: {
  teks: string;
  posisi?: "kanan" | "bawah" | "bawah-kiri";
}) {
  const bawah = "top-full mt-2 -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0";
  const letak = {
    kanan: "left-full top-1/2 ml-3 -translate-x-1 -translate-y-1/2 group-hover:translate-x-0 group-focus-visible:translate-x-0",
    bawah: `right-0 ${bawah}`,
    "bawah-kiri": `left-0 ${bawah}`,
  }[posisi];

  return (
    <span
      className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-on-surface px-2.5 py-1.5 text-xs font-semibold text-surface opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 group-focus-visible:opacity-100 ${letak}`}
    >
      {teks}
    </span>
  );
}
