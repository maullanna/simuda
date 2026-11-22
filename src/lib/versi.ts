// Nomor versi SIMUDA untuk ditampilkan (contoh: "SIMUDA v0.1"). Sumbernya package.json, lewat next.config.ts.
export const VERSI = process.env.NEXT_PUBLIC_VERSI ?? "0.1";
export const NAMA_VERSI = `SIMUDA v${VERSI}`;
