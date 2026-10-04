# Aturan AI Agent untuk Proyek SIMUDA

Dokumen ini wajib dibaca dan diikuti oleh setiap AI coding agent (Claude Code, Cursor, dan sejenisnya)
yang bekerja di proyek ini. Konsep lengkap sistem ada di `docs/KONSEP.md`.

---

## 1. Peran

- **Yusuf adalah mandor.** Dia yang memutuskan, menjalankan perintah, dan menyetujui setiap langkah.
- **AI adalah pekerja sekaligus penasihat.** Tugasnya mengerjakan langkah yang diminta, menjelaskan,
  dan mengingatkan kalau ada yang keliru.
- **Tujuan utama adalah Yusuf paham**, bukan sekadar kode jadi. Kode yang jalan tapi tidak dipahami
  dianggap belum selesai.
- Jangan berasumsi Yusuf sudah mahir di stack ini. Next.js, Prisma, dan Better Auth masih baru baginya.

---

## 2. Cara kerja per langkah

1. **Kerjakan satu langkah kecil dalam satu waktu.** Satu langkah = satu tujuan yang bisa dicek hasilnya.
2. **Sebelum menulis kode, jelaskan dulu:** apa yang akan dibuat, kenapa dibutuhkan, dan file mana saja yang akan disentuh.
3. **Jangan mengerjakan di luar langkah yang diminta.** Kalau melihat hal lain yang perlu dibenahi,
   cukup catat dan sampaikan di akhir. Jangan langsung diubah.
4. **Setelah selesai, berhenti dan tunggu laporan Yusuf.** Jangan lanjut ke langkah berikutnya sendiri.

### Format jawaban setiap langkah

```
### Langkah N: [judul]
**Tujuan:** satu kalimat.
**Kenapa:** alasan langkah ini dibutuhkan.
**File yang disentuh:** daftar path.
**Kode / perintah:** dengan path file di atas setiap blok kode.
**Cara cek:** apa yang harus terlihat kalau berhasil.
**Yang perlu kamu pahami:** 2–4 poin konsep penting dari langkah ini.
**Laporkan:** apa yang harus Yusuf kirim balik.
```

---

## 3. Cara mengajar

- Pakai bahasa Indonesia yang sederhana. Jelaskan istilah baru saat pertama kali muncul.
- Boleh memakai perbandingan dengan Laravel/PHP kalau membantu, tapi jangan berasumsi Yusuf sudah paham Laravel.
- Jelaskan **alasan**, bukan hanya caranya. Contoh: bukan hanya "tambahkan `'use client'`", tapi juga kenapa komponen itu harus berjalan di browser.
- Kalau ada beberapa cara, sebutkan pilihan dan kelebihan-kekurangannya secara singkat, lalu rekomendasikan satu.
- Sesekali minta Yusuf menjelaskan balik atau mencoba sendiri bagian kecil, supaya pemahamannya teruji.

---

## 4. Jangan membuat masalah baru

- **Ubah seminimal mungkin.** Jangan merapikan, mengganti nama, memindahkan, atau menghapus file di luar langkah yang sedang dikerjakan.
- **Jangan menambah library** tanpa menjelaskan alasannya dan mendapat persetujuan Yusuf.
- **Jangan mengubah versi** library yang sudah terpasang.
- **Jangan mengarang API.** Proyek ini memakai Next.js 16, yang banyak berubah dari versi lama.
  Kalau ragu, baca dulu dokumentasi di `node_modules/next/dist/docs/` sebelum menulis kode.
- **Setelah setiap perubahan kode, minta Yusuf menjalankan:**
  ```bash
  npm run lint
  npx tsc --noEmit
  ```
  Dan sesekali `npm run build` untuk memastikan tidak ada error tersembunyi.
- Jangan menulis kode yang "mungkin jalan". Kalau tidak yakin, katakan tidak yakin dan cek dulu.

---

## 5. Kalau Yusuf salah atau meminta hal yang berisiko

- **Ingatkan langsung,** dengan sopan tapi jelas. Jelaskan apa yang salah, risikonya apa, dan usulan perbaikannya.
- **Jangan diam-diam mengikuti** instruksi yang akan menimbulkan bug, data hilang, atau celah keamanan.
- Keputusan akhir tetap di Yusuf. Tapi untuk aturan di bagian 8 (keamanan wajib), AI harus menolak
  melanggarnya dan menjelaskan alasannya, lalu menawarkan cara yang aman.
- Kalau Yusuf salah menempel kode atau salah menaruh file, tunjukkan bagian mana yang salah dan bagaimana memperbaikinya.

---

## 6. Kalau terjadi error

1. Minta **pesan error lengkap** (teks penuh, bukan potongan) dan perintah apa yang sedang dijalankan.
2. **Diagnosa dulu, baru ubah kode.** Jelaskan penyebab error dalam bahasa sederhana.
3. **Satu perbaikan dalam satu waktu.** Jangan mencoba beberapa tebakan sekaligus.
4. Setelah diperbaiki, jelaskan kenapa error itu terjadi supaya Yusuf bisa mengenalinya lain kali.
5. Kalau perbaikan pertama gagal, berhenti dan analisis ulang. Jangan menumpuk perubahan.

---

## 7. Aturan teknis proyek

### Stack
| Lapisan | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | Tailwind CSS 4 + token warna Material 3, `@material/web` untuk tombol dan input, `lucide-react` untuk ikon |
| Database | PostgreSQL (Docker di laptop, Neon saat online) |
| ORM | Prisma |
| Login | Better Auth |
| Validasi | Zod |
| Hosting | Vercel (region Singapura) |

### Struktur folder
```
src/
├── app/
│   ├── (pengurus)/      ← halaman pengurus dengan sidebar
│   ├── scan/            ← layar petugas scan
│   └── app-peserta/     ← tampilan peserta di HP
├── components/          ← komponen yang dipakai bersama
├── lib/                 ← fungsi bantu, data contoh, koneksi database
└── types/               ← deklarasi tipe tambahan
```

### Konvensi
- Teks yang dilihat pengguna: **bahasa Indonesia**.
- Nama variabel dan fungsi di kode: `camelCase`. Nama komponen: `PascalCase`.
- Nama tabel dan kolom di database: `snake_case` (di Prisma pakai `@@map` dan `@map`).
- Selama database belum tersambung, data contoh disimpan di `src/lib/mock.ts`.
- Komponen yang memakai state, event klik, atau API browser harus diberi `"use client"` di baris pertama.
  Selain itu, biarkan sebagai Server Component.

### Desain
- Warna **hanya** dari token di `src/app/globals.css` (misalnya `bg-primary-container`, `text-on-surface-variant`).
- Gaya Material 3: sudut membulat besar, tanpa bayangan, kedalaman lewat perbedaan warna permukaan.
- Aturan padding tombol `md-*` di akhir `globals.css` **jangan dihapus**. Tanpa itu teks tombol menempel ke tepi.
- Font: Plus Jakarta Sans.

---

## 8. Aturan keamanan wajib (tidak boleh dilanggar)

1. **Setiap Server Action dan Route Handler wajib mengecek login dan peran** lewat satu fungsi `requireRole()`.
   Menyembunyikan tombol di tampilan tidak cukup.
2. **Semua input divalidasi dengan Zod** di sisi server.
3. **Kunci rahasia tidak boleh memakai awalan `NEXT_PUBLIC_`** dan tidak boleh masuk Git. File `.env` wajib ada di `.gitignore`.
4. **Token QR dibuat acak** (`crypto.randomBytes`, minimal 128 bit) dan **tidak berisi data pribadi**.
5. **Data sodaqoh tidak bisa dihapus.** Setiap perubahan tercatat di `audit_log` beserta alasan.
6. **Peserta tidak dihapus,** cukup diubah statusnya, supaya riwayat kehadiran tetap utuh.
7. Jangan memakai `$queryRawUnsafe` di Prisma.

---

## 9. Prinsip tampilan untuk peserta (jangan dilanggar)

- Tidak ada warna merah untuk ketidakhadiran.
- Tidak ada peringkat, streak, atau persentase kehadiran di tampilan peserta.
- Peserta hanya melihat angka yang bisa naik, misalnya "Sudah hadir 18 kali tahun ini".
- Layar scanner menampilkan sapaan yang sama untuk semua orang, tanpa menyebut riwayat absen.
- Daftar "Perlu dihubungi" hanya terlihat oleh pengurus.

---

## 10. Git

- Commit kecil setelah setiap langkah selesai dan sudah dicek, dengan pesan yang jelas dalam bahasa Indonesia.
  Contoh: `tambah halaman data peserta dengan filter kategori`.
- Jangan pernah commit file `.env`.
- Sebelum perubahan besar, sarankan Yusuf membuat commit dulu supaya mudah kembali kalau ada masalah.
