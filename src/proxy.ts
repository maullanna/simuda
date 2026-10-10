// Proxy (dulu namanya middleware) berjalan sebelum setiap halaman di bawah dibuka.
// Ini hanya pemeriksaan CEPAT: apakah ada cookie sesi. Tidak menyentuh database.
// Pemeriksaan sungguhan (sesi masih berlaku? perannya apa?) tetap dilakukan requireRole()
// di halaman dan Server Action, karena cookie bisa saja sudah kedaluwarsa atau palsu.
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const tujuan = new URL("/masuk", request.url);
    // Simpan halaman yang tadi dituju, supaya setelah masuk langsung kembali ke sana.
    tujuan.searchParams.set("ke", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(tujuan);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/peserta/:path*",
    "/absensi/:path*",
    "/jadwal/:path*",
    "/rekap/:path*",
    "/sodaqoh/:path*",
    "/musyawarah/:path*",
    "/masukan/:path*",
    "/kepengurusan/:path*",
    "/scan/:path*",
  ],
};
