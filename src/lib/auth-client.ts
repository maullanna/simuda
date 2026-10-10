// Klien login untuk komponen di browser (form masuk, tombol keluar).
// Alamat server diambil dari halaman yang sedang dibuka, jadi tidak perlu diatur.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
