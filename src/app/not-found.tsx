import Link from "next/link";
import { Compass } from "lucide-react";

// Halaman 404: dipakai untuk alamat yang tidak ada, dan saat halaman memanggil notFound()
// (misalnya /peserta/xyz/ubah untuk peserta yang tidak terdaftar).
export default function TidakDitemukan() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <div className="muncul grid size-20 place-items-center rounded-[28px] bg-primary-container text-on-primary-container">
        <Compass size={36} className="animate-[letup_700ms_cubic-bezier(0.34,1.56,0.64,1)]" />
      </div>
      <div className="muncul" style={{ animationDelay: "80ms" }}>
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">404</p>
        <h1 className="mt-1 text-2xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-on-surface-variant">Alamatnya mungkin salah ketik, atau datanya sudah tidak ada.</p>
      </div>
      <div className="muncul flex flex-wrap justify-center gap-2" style={{ animationDelay: "160ms" }}>
        <md-filled-button href="/dashboard">Ke Beranda pengurus</md-filled-button>
        <md-outlined-button href="/app-peserta">Ke tampilan peserta</md-outlined-button>
      </div>
      <Link href="/" className="text-sm font-semibold text-on-surface-variant hover:underline">
        Kembali ke halaman depan
      </Link>
    </main>
  );
}
