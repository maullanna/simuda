import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

// Versi aplikasi diambil dari package.json ("version"), lalu ditampilkan singkat: 0.1.0 -> "0.1".
// Setiap ada pembaruan, cukup naikkan versi di package.json (lihat KONSEP bagian 13).
const versi = (JSON.parse(readFileSync("./package.json", "utf8")) as { version: string }).version.split(".").slice(0, 2).join(".");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_VERSI: versi },
};

export default nextConfig;
