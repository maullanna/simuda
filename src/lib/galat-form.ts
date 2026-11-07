// Bantuan untuk form panjang: setelah pemeriksaan gagal, gulir ke isian pertama yang salah.
// Tanpa ini, di HP pesan merah bisa berada jauh di atas tombol Simpan sehingga terasa "tidak terjadi apa-apa".

export const PESAN_ADA_GALAT = "Ada isian yang belum benar. Periksa yang bertanda merah.";

export function gulirKeGalatPertama(form: HTMLFormElement | null, galat: Record<string, string | undefined>) {
  if (!form) return;
  // Tunggu React selesai menampilkan pesan merahnya dulu.
  requestAnimationFrame(() => {
    const salah = Array.from(form.elements).find((el) => {
      const nama = (el as HTMLElement & { name?: string }).name;
      return nama && galat[nama];
    }) as HTMLElement | undefined;
    if (!salah) return;
    // Pilihan (radio) tersembunyi: gulir ke kelompok pilihannya.
    const sasaran = (salah.closest("fieldset") as HTMLElement | null) ?? salah;
    sasaran.scrollIntoView({ behavior: "smooth", block: "center" });
    if (salah.tagName.includes("-") || salah.tagName === "SELECT") salah.focus({ preventScroll: true });
  });
}
