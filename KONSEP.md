# Konsep SIMUDA (Sistem Informasi Muda/i)

Sistem absensi dan manajemen pengajian muda/i Bendlay 2 & Bendlay 4.
Dokumen ini adalah acuan utama untuk pengembangan. Kalau ada keputusan baru, perbarui dokumen ini dulu sebelum mengubah kode.

Terakhir diperbarui: 10 Oktober 2026

---

## 1. Ringkasan

**Masalah yang diselesaikan** (hasil rapat kepengurusan):
- Data muda/i tercecer, belum ada satu daftar lengkap.
- Absensi masih manual, lama, dan catatannya mudah hilang.
- Jadwal dan materi pengajian tidak terdokumentasi.
- Rekap bulanan sulit dibuat.
- Tugas dan akses tiap pengurus belum jelas.
- Pemasukan dan pengeluaran sodaqoh belum tercatat rapi.
- Hasil musyawarah tidak ada tindak lanjutnya.
- Belum ada saluran masukan dari peserta.
- Pengurus sering tidak sadar ada peserta yang mulai jarang hadir.

**Solusi:** satu aplikasi web yang bisa dibuka lewat HP, untuk pengurus dan peserta.
Peserta absen cukup dengan menunjukkan kartu QR, tanpa mengisi form.

---

## 2. Kondisi organisasi

| Hal | Ketentuan |
|---|---|
| Jumlah peserta | Sekitar 70 orang |
| Frekuensi pengajian | 3 kali seminggu |
| Pengajian | Bersama untuk Bendlay 2 dan Bendlay 4 |
| Kepengurusan | Terpisah: Bendlay 2 dan Bendlay 4 |
| Putra dan putri | Selalu dipisah |
| Kategori | Pra-remaja (15 tahun ke bawah), Remaja (16–18 tahun), dan Pra-nikah (19 tahun ke atas), dihitung otomatis dari tanggal lahir |
| Sasaran pengajian | Bisa khusus pra-remaja, khusus remaja, khusus pra-nikah, atau gabungan |
| Penanggung jawab | Ketua Muda/i |

---

## 3. Peran pengguna dan hak akses

Setiap pengurus punya **jabatan** (tulisan yang tampil, misalnya "Wakil Ketua 1" atau "Penerobos") dan satu **peran di sistem** (yang menentukan apa yang boleh dibuka dan diubah). Hak akses diperiksa di server untuk setiap tindakan, tidak cukup dengan menyembunyikan tombol.

### 3.1 Peran

| Peran | Dipegang oleh | Fokus |
|---|---|---|
| Administrator | Pengembang/pengelola sistem | Seluruh aplikasi, termasuk akun dan pengaturan |
| Kyai | Pimpinan | Memantau semua, tidak mengubah data |
| Wakil | Pimpinan (wakil Kyai) | Mengelola kegiatan dan kepengurusan |
| Ketua | Ketua dan Wakil Ketua 1/2 tiap wilayah | Mengelola kegiatan dan kepengurusan |
| Sekretaris | Sekretaris tiap wilayah | Peserta, absensi, jadwal, rekap, musyawarah |
| Bendahara | Bendahara tiap wilayah | Sodaqoh (pemasukan dan pengeluaran) |
| Pengurus | Penerobos, Keputrian, seksi lain | Scan, izin, menghubungi peserta di wilayahnya |
| Petugas scan | Muda/i yang digilir | Hanya layar Scanner |
| Peserta (tahap 2) | Muda/i | Data dan kartu sendiri, jadwal, kirim masukan |

### 3.2 Hak akses per fitur

Kode: **L** = lihat, **T** = tambah, **U** = ubah, **S** = suspend dan pulihkan (lihat 3.3), **Ya** = boleh menjalankan, **–** = tidak ada akses. Administrator selalu punya semua hak, ditambah **H** = hapus permanen (hanya Administrator, lihat 3.4).

| Fitur | Admin | Kyai | Wakil | Ketua | Sekretaris | Bendahara | Pengurus | Petugas scan | Peserta |
|---|---|---|---|---|---|---|---|---|---|
| **Beranda** | | | | | | | | | |
| Beranda pengurus | L | L | L | L | L | L | L | – | Beranda sendiri |
| **Peserta** | | | | | | | | | |
| Data peserta | LTUS | L | LTUS | LTUS | LTUS | L | L | – | Data sendiri: L, U (no HP, foto) |
| Impor peserta dari Excel | Ya | – | Ya | Ya | Ya | – | – | – | – |
| Kartu: cetak, ganti kartu hilang | LTS | L | LTS | LTS | LTS | – | – | – | Kartu sendiri: L |
| **Absensi** | | | | | | | | | |
| Daftar hadir per sesi | L | L | L | L | L | L | L | Sesi yang dibuka | – |
| Buka dan tutup sesi | Ya | – | Ya | Ya | Ya | – | Ya | – | – |
| Scan kehadiran | Ya | – | Ya | Ya | Ya | Ya | Ya | Ya | – |
| Input manual dan catat izin | T | – | T | T | T | – | T | – | Tahap 2: ajukan izin sendiri |
| Koreksi kehadiran (ubah status, batalkan scan salah) | US | – | US | US | US | – | – | – | – |
| **Jadwal dan materi** | | | | | | | | | |
| Sesi pengajian | LTUS | L | LTUS | LTUS | LTUS | L | L | – | L (jadwalnya sendiri) |
| Materi dan lampiran | LTUS | L | LTUS | LTUS | LTUS | L | L | – | L |
| Pemateri | LTUS | L | LTUS | LTUS | LTUS | L | L | – | – |
| **Rekap** | | | | | | | | | |
| Rekap dan grafik kehadiran | L | L | L | L | L | L | L (wilayahnya) | – | – |
| Unduh rekap Excel/PDF | Ya | Ya | Ya | Ya | Ya | – | – | – | – |
| Perlu dihubungi (tandai sudah dihubungi) | LU | L | LU | LU | LU | – | LU (wilayahnya) | – | – |
| **Sodaqoh** | | | | | | | | | |
| Pemasukan per pengajian (dua penghitung) | LTUS | L | L | L | – | LTUS | – | – | – |
| Pengeluaran (wajib foto nota) | LTUS | L | L | L | – | LTUS | – | – | – |
| Riwayat perubahan sodaqoh | L | L | L | L | – | L | – | – | – |
| **Musyawarah** | | | | | | | | | |
| Musyawarah: jadwal, agenda, hasil | LTUS | L | LTUS | LTUS | LTUS | L | L | – | – |
| Tindak lanjut | LTUS | L | LTUS | LTUS | LTUS | L, U status tugasnya | L, U status tugasnya | – | – |
| **Masukan** | | | | | | | | | |
| Masukan peserta | LS | L | LS | LS | L | – | – | – | T (kirim) |
| **Kepengurusan** | | | | | | | | | |
| Data pengurus | LTUS | L | LTUS | LTUS | – | – | – | – | – |
| Akun login: buat, reset kata sandi, suspend | Ya | – | Ya | Ya | – | – | – | – | – |
| Petugas scan: tunjuk dan cabut | Ya | – | Ya | Ya | – | – | – | – | – |
| Akun saya: ganti kata sandi sendiri | Ya | Ya | Ya | Ya | Ya | Ya | Ya | Ya | Tahap 2 (OTP) |
| **Sistem** | | | | | | | | | |
| Riwayat perubahan semua modul | L | L | L | L | – | – | – | – | – |
| Pengaturan (WhatsApp, notifikasi, backup) | Ya | – | – | – | – | – | – | – | – |

Catatan:
- Petugas scan adalah muda/i yang juga peserta. Satu orang bisa punya peran peserta dan petugas scan sekaligus.
- Peran petugas scan bisa diberikan dan dicabut kapan saja, karena digilir.
- Administrator tidak termasuk struktur pengurus Bendlay 2/4. Data dan akun Administrator hanya bisa diubah oleh Administrator.
- Tidak ada yang bisa men-suspend akun atau mengubah perannya sendiri.
- "Wilayahnya" berarti hanya peserta di wilayah (Bendlay 2 atau 4) tempat pengurus itu bertugas.
- Tabel ini masih draf dan perlu dikonfirmasi ke Ketua Muda/i.

### 3.3 Suspend, bukan hapus

Pengurus tidak punya tombol hapus. Data yang salah, sudah tidak dipakai, atau dibatalkan cukup **di-suspend**, supaya riwayat selalu utuh dan bisa dilacak.

1. **Wajib alasan.** Setiap suspend mencatat siapa, kapan, dan alasannya di `audit_log`.
2. **Tidak dihitung, tapi tetap ada.** Data yang di-suspend tidak tampil di daftar biasa dan tidak ikut dihitung (saldo, rekap, jumlah peserta sasaran). Data itu tetap bisa dilihat lewat filter "Disuspend".
3. **Bisa dipulihkan.** Yang boleh memulihkan sama dengan yang boleh men-suspend (kode S di tabel 3.2), juga dengan alasan.
4. **Mengubah data penting juga wajib alasan:** sodaqoh, kehadiran, dan data peserta. Nilai lama dan baru tersimpan.

Arti suspend untuk tiap data:

| Data | Saat di-suspend |
|---|---|
| Peserta | Tidak aktif (pindah, menikah, berhenti). Kartunya tidak bisa dipakai scan. Riwayat kehadiran tetap ada |
| Kartu | Tidak berlaku (hilang atau rusak), diganti kartu baru |
| Pengurus dan akun login | Tidak bisa masuk, semua sesi login dikeluarkan |
| Petugas scan | Peran dicabut, bisa ditunjuk lagi kapan saja |
| Sesi pengajian | Batal. Tidak dihitung di rekap |
| Kehadiran | Catatan salah (misalnya salah scan) dibatalkan |
| Materi, lampiran, pemateri | Disembunyikan dari peserta dan daftar |
| Sodaqoh | Tidak dihitung ke saldo, tetap terlihat di riwayat |
| Musyawarah dan tindak lanjut | Dibatalkan |
| Masukan | Disembunyikan (misalnya isinya tidak pantas) |

Pengecualian: data contoh (bukan data asli) boleh dihapus sekali saat aplikasi mulai memakai data asli.

### 3.4 Hapus permanen (hanya Administrator)

Hapus permanen hanya ada untuk Administrator, untuk keadaan khusus seperti data ganda, data uji, atau permintaan penghapusan data pribadi. Pengamannya:

1. **Hanya data yang sudah di-suspend** yang bisa dihapus. Jadi selalu ada dua langkah: suspend dulu, baru hapus.
2. **Konfirmasi berlapis:** Administrator mengetik ulang nama data yang akan dihapus dan mengisi alasan.
3. **Jejak tetap ada:** salinan data yang dihapus disimpan di `audit_log` (aksi = hapus). Untuk permintaan penghapusan data pribadi, salinan itu tidak berisi nama, no HP, dan foto.
4. **`audit_log` tidak pernah bisa dihapus**, termasuk oleh Administrator.
5. Menghapus peserta ikut menghapus kartu dan riwayat kehadirannya, jadi rekap bulan-bulan lalu ikut berubah. Tampilan konfirmasi wajib memberi tahu hal ini.

---

## 4. Menu dan halaman

### 4.1 Pengurus (sidebar)

| Menu | URL | Isi |
|---|---|---|
| Beranda | `/dashboard` | Pengajian hari ini (jumlah hadir putra dan putri), tombol buka scanner, ringkasan angka (peserta aktif, hadir terakhir, izin minggu ini, saldo sodaqoh), grafik kehadiran 8 pengajian terakhir, daftar perlu dihubungi, jadwal minggu ini, sodaqoh terbaru |
| Peserta | `/peserta` | Tab Semua / Pra-remaja / Remaja / Pra-nikah, filter Putra/Putri dan Bendlay 2/4, pencarian nama, tabel peserta, tombol Impor Excel, Cetak kartu, Tambah peserta |
| Absensi | `/absensi` | Sesi hari ini dengan progres kehadiran, tombol buka scanner, input manual, tutup sesi, riwayat sesi, daftar izin tercatat |
| Jadwal & materi | `/jadwal` | Jadwal rutin, sesi mendatang (materi dan pemateri), catatan pengajian terakhir |
| Rekap | `/rekap` | Rekap bulanan, filter kelompok dan kategori, grafik kehadiran, daftar perlu dihubungi, rincian sesi, unduh Excel/PDF |
| Sodaqoh | `/sodaqoh` | Saldo, pemasukan dan pengeluaran bulan ini, tabel transaksi dengan bukti nota, riwayat perubahan |
| Musyawarah | `/musyawarah` | Daftar musyawarah dan hasilnya, tindak lanjut (tugas, penanggung jawab, tenggat, status) |
| Masukan | `/masukan` | Masukan peserta, dengan nama atau tanpa nama |
| Kepengurusan | `/kepengurusan` | Pimpinan (Kyai, Wakil), struktur pengurus Bendlay 2 / Bendlay 4, peran di sistem |

### 4.2 Petugas scan

| Halaman | URL | Isi |
|---|---|---|
| Scanner | `/scan` | Sesi yang sedang berlangsung, kamera, sapaan "Selamat datang, [nama]", jumlah hadir dan peserta sasaran, input manual, tutup sesi |

### 4.3 Peserta (tahap 2)

| Halaman | URL | Isi |
|---|---|---|
| Beranda peserta | `/app-peserta` | Jumlah kehadiran tahun ini, pengajian berikutnya, tombol kabari izin, jadwal minggu ini |
| Navigasi bawah | – | Beranda, Jadwal, Materi, Kartu (QR di HP) |

---

## 5. Fitur per modul

### 5.1 Data peserta
- Data: nama, jenis kelamin (putra/putri), wilayah (Bendlay 2/4), tanggal lahir, no HP, foto, status.
- Kategori pra-remaja/remaja/pra-nikah **tidak diisi manual**. Dihitung dari tanggal lahir, dan otomatis berpindah saat peserta berusia 16 dan 19 tahun.
- Status: aktif atau tidak aktif. Peserta tidak pernah dihapus.
- Impor dari Excel untuk data awal.

### 5.2 Kartu peserta
- Ukuran kartu standar (85,6 × 54 mm).
- Depan: logo, nama SIMUDA, foto, nama peserta, label putra/putri, wilayah, QR code.
- Belakang: cara memakai kartu, kontak pengurus kalau kartu hilang.
- **Tidak mencetak:** kategori (karena berubah sesuai usia), no HP, alamat.
- QR hanya berisi token acak. Kartu hilang: token lama dinonaktifkan, kartu baru dicetak.
- Cetak massal: PDF, 10 kartu per lembar A4.

### 5.3 Absensi
- Petugas memindai kartu peserta dengan kamera HP.
- Satu peserta hanya bisa tercatat sekali per sesi. Scan ulang menampilkan "sudah tercatat".
- Input manual untuk peserta yang lupa membawa kartu.
- Tahap berikutnya: alat tap kartu (NFC). Kartu tahap 1 adalah kartu biasa, jadi perlu dicetak ulang saat beralih.

### 5.4 Izin
- Tahap 1: peserta mengabari pengurus, lalu pengurus mencatat izin di sistem.
- Tahap 2: peserta mengajukan sendiri dari HP.
- Izin **tidak perlu persetujuan**. Langsung tercatat.
- Izin diajukan **sebelum pengajian dimulai**.
- Peserta yang sering izin berturut-turut ikut masuk daftar "perlu dihubungi".

### 5.5 Sesi pengajian
- Setiap sesi punya: tanggal, jam, jenis kelamin (putra/putri), sasaran (pra-remaja/remaja/pra-nikah/gabungan), pemateri, materi.
- Saat sesi ditutup, peserta sasaran yang belum tercatat hadir atau izin otomatis tercatat alpa.
- Peserta di luar sasaran yang ikut hadir tetap dicatat hadir (usulan, perlu dikonfirmasi).

### 5.6 Rekap dan perlu dihubungi
- Rekap per sesi dan per bulan, bisa difilter kelompok dan kategori.
- Unduh Excel dan PDF.
- Daftar "perlu dihubungi": peserta aktif yang tidak hadir di 2 pengajian terakhir, atau izin berturut-turut.
  Hanya terlihat oleh pengurus, dan ditujukan ke pengurus wilayah peserta tersebut.

### 5.7 Jadwal dan materi
- Jadwal rutin 3 kali seminggu.
- Materi dan pemateri diisi sebelum pengajian.
- Catatan materi diisi setelah pengajian, bisa disertai foto atau PDF.

### 5.8 Sodaqoh
- Pemasukan (infaq lemparan per sesi) dan pengeluaran wajib dicatat.
- Setiap pemasukan dicatat oleh dua penghitung.
- Setiap pengeluaran disertai foto nota.
- Saldo dihitung otomatis.
- Pengurus tidak bisa menghapus, hanya men-suspend (tidak dihitung ke saldo). Hapus permanen hanya oleh Administrator (bagian 3.4). Setiap perubahan tercatat beserta alasan.
- Yang mengelola: Bendahara (tambah, ubah, suspend). Kyai, Wakil, dan Ketua bisa melihat.

### 5.9 Musyawarah
- Jadwal, agenda, hasil musyawarah.
- Tindak lanjut: tugas, penanggung jawab, tenggat, status.

### 5.10 Masukan
- Peserta mengirim masukan tentang pengajian, dengan nama atau tanpa nama.

### 5.11 Kepengurusan
- Pimpinan: Kyai dan Wakil.
- Struktur pengurus Bendlay 2 dan Bendlay 4: jabatan, nama, peran di sistem.

### 5.12 Notifikasi (tahap 3)
- Pengingat jadwal **sekali seminggu** lewat WhatsApp, berisi semua pengajian minggu itu.
- Login peserta dengan OTP lewat WhatsApp.
- Push notification ke HP sebagai tambahan.

### 5.13 Backup
- Backup database otomatis setiap minggu, terenkripsi.

---

## 6. Prinsip menjaga perasaan peserta

- Tidak ada peringkat, streak, atau persentase kehadiran di tampilan peserta.
- Tidak ada warna merah untuk ketidakhadiran.
- Peserta hanya melihat pencapaian positif: "Sudah hadir 18 kali tahun ini".
- Layar scanner menampilkan sapaan yang sama untuk semua orang.
- Peserta yang lama tidak hadir dihubungi pengurus secara pribadi, tidak ditegur oleh sistem.
- Pesan otomatis bernada mengajak, tidak pernah menyebut jumlah absen.
- Rekap yang dibagikan ke grup hanya berisi angka positif, tanpa daftar nama yang absen.

---

## 7. Skema data (konsep)

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `peserta` | nama, jenis_kelamin, wilayah, tanggal_lahir, no_hp, foto_url, status, tanggal_bergabung, user_id | Kategori dihitung dari tanggal_lahir, tidak disimpan |
| `kartu` | peserta_id, token, aktif, dibuat_at, dinonaktifkan_at | Token unik, maksimal satu kartu aktif per peserta |
| `pemateri` | nama, keterangan | |
| `sesi_pengajian` | tanggal, jam_mulai, jenis_kelamin, sasaran, pemateri_id, materi, catatan, status | sasaran: pra-remaja / remaja / pra-nikah / gabungan. status: terjadwal / berlangsung / selesai / batal |
| `kehadiran` | sesi_id, peserta_id, status, metode, keterangan, dicatat_oleh, waktu | Unik per (sesi_id, peserta_id). status: hadir / izin / alpa. metode: qr / manual / izin |
| `lampiran` | sesi_id, url, nama_file, tipe | File disimpan di storage, database hanya menyimpan URL |
| `pengurus` | user_id, nama, jabatan, wilayah, peran | peran: admin / kyai / wakil / ketua / sekretaris / bendahara / pengurus / petugas_scan |
| `sodaqoh` | tanggal, sesi_id, jenis, jumlah, keterangan, penghitung_1_id, penghitung_2_id, bukti_url, dicatat_oleh | jenis: pemasukan / pengeluaran. Jumlah dalam rupiah, bilangan bulat |
| `audit_log` | user_id, tabel, record_id, aksi, data_lama, data_baru, alasan, waktu | Wajib untuk setiap tambah, ubah, suspend, pulihkan, dan hapus. aksi: buat / ubah / suspend / pulihkan / hapus. Tidak pernah dihapus |
| `musyawarah` | tanggal, agenda, lokasi, hasil, notulis_id, status | |
| `tindak_lanjut` | musyawarah_id, tugas, pic_id, tenggat, status | status: belum / berjalan / selesai |
| `masukan` | sesi_id, peserta_id, isi, dibuat_at | peserta_id kosong berarti tanpa nama |
| `notifikasi_log` | penerima, kanal, jenis, isi, status, dikirim_at | Tahap 3 |
| `push_subscription` | user_id, endpoint, p256dh, auth | Tahap 3 |
| Tabel Better Auth | user, session, account, verification | Dibuat otomatis |

Suspend (bagian 3.3): tabel yang sudah punya status memakai statusnya (`peserta.status`, `kartu.aktif`, `pengurus.aktif`, `sesi_pengajian.status = batal`). Tabel `kehadiran`, `lampiran`, `pemateri`, `sodaqoh`, `musyawarah`, `tindak_lanjut`, dan `masukan` mendapat kolom `disuspend_at`, `disuspend_oleh`, `alasan_suspend`. Alasan selalu tersimpan juga di `audit_log`.

Catatan:
- Persetujuan wali untuk peserta remaja **dikelola di luar sistem**, jadi tidak ada tabel wali.
- Izin disimpan sebagai baris `kehadiran` berstatus izin, dicatat sebelum sesi dimulai.

---

## 8. Alur utama

### 8.1 Pendaftaran dan kartu
1. Pengurus menambah peserta atau mengimpor dari Excel.
2. Sistem membuat token acak untuk kartu.
3. Pengurus mencetak kartu dalam PDF, lalu dilaminating dan dibagikan.

### 8.2 Scan kehadiran
1. Petugas membuka halaman scanner dan memilih sesi yang berlangsung.
2. Kamera membaca QR kartu peserta.
3. Token tidak dikenal: tampil "kartu tidak dikenal".
4. Sudah tercatat: tampil "sudah tercatat".
5. Berhasil: kehadiran tersimpan, tampil "Selamat datang, [nama]".

### 8.3 Izin
1. Peserta mengabari pengurus sebelum pengajian dimulai.
2. Pengurus mencatat izin di sistem, langsung berstatus izin.

### 8.4 Tutup sesi
1. Setelah pengajian, pengurus menekan tutup sesi.
2. Peserta sasaran yang belum tercatat hadir atau izin otomatis tercatat alpa.
3. Catatan materi diisi.
4. Daftar perlu dihubungi diperbarui.

### 8.5 Kartu hilang
1. Pengurus menonaktifkan kartu lama.
2. Sistem membuat token baru, kartu dicetak ulang.

---

## 9. Desain

- Gaya: Material Design 3, nuansa hijau seperti tampilan HP Pixel.
- Token warna: seed `#2E6B30`, tersimpan di `src/app/globals.css`.
- Font: Plus Jakarta Sans.
- Komponen: tombol dan input dari `@material/web`, sisanya Tailwind dengan token yang sama.
- Sudut membulat besar, tanpa bayangan, efek hover terangkat dengan pantulan pegas.
- Rencana ke depan: avatar karakter (Rive atau Lottie).
- Mockup: kanvas "Desain Sistem Pengajian Pemuda/i" (6 layar: scanner, halaman peserta, kartu, rekap, sodaqoh, data peserta).

---

## 10. Teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js 16 (TypeScript) |
| UI | Tailwind CSS 4, `@material/web`, `lucide-react` |
| Database | PostgreSQL: Docker di laptop, Neon saat online (region Singapura) |
| ORM | Prisma |
| Login | Better Auth |
| Validasi | Zod |
| QR | `qrcode` (buat), `@yudiel/react-qr-scanner` (pindai) |
| Cetak kartu | `@react-pdf/renderer` |
| Excel | `exceljs` |
| Hosting | Vercel (region `sin1`) |
| WhatsApp | Fonnte Lite (tahap 3) |
| Backup | GitHub Actions |

Aturan pengembangan lengkap ada di `AI_RULES.md`.

---

## 11. Perkiraan biaya

| Komponen | Biaya |
|---|---|
| Hosting Vercel dan database Neon | Gratis (selama dikerjakan sukarela) |
| WhatsApp (Fonnte Lite, 1.000 pesan/bulan) | ±Rp 25.000 per bulan |
| Domain `.my.id` | ±Rp 50.000 per tahun |
| **Total** | **±Rp 350.000 per tahun** |
| Cetak kartu | Sekali di awal, ±Rp 1.000–3.000 per peserta |

---

## 12. Tahapan

| Tahap | Isi | Target |
|---|---|---|
| 1 | Data peserta, kartu, absensi, izin (dicatat pengurus), rekap, akun pengurus, backup | Go-live Selasa, 17 November 2026 |
| 2 | Halaman peserta, login OTP, izin mandiri, jadwal, materi, catatan | Setelah tahap 1 |
| 3 | Pengingat WhatsApp mingguan, push notification, rekap lengkap | Setelah tahap 2 |
| 4 | Sodaqoh, musyawarah, masukan | Setelah tahap 3 |

Detail harian ada di file `Timeline-Sistem-Pengajian.xlsx`.

---

## 13. Keputusan yang sudah diambil

| Hal | Keputusan |
|---|---|
| Nama sistem | SIMUDA (Sistem Informasi Muda/i) |
| Izin | Tidak perlu persetujuan, diajukan sebelum pengajian |
| Putra/putri | Selalu dipisah |
| Kategori | Pra-remaja (≤15), remaja (16–18), pra-nikah (≥19), dihitung otomatis dari tanggal lahir, kadang gabung kadang pisah |
| Kepengurusan | Terpisah Bendlay 2 dan Bendlay 4, pengajian bersama |
| Pengeluaran sodaqoh | Wajib dicatat |
| Penanggung jawab | Ketua Muda/i |
| Petugas scan | Muda/i yang juga peserta, digilir |
| Administrator | Satu peran khusus yang boleh mengelola seluruh aplikasi (diputuskan 10 Oktober 2026) |
| Kartu | Kartu biasa: nama, foto, QR |
| Persetujuan wali | Di luar sistem |
| Pengingat WhatsApp | Sekali seminggu |
| Hapus data | Pengurus hanya bisa suspend (dengan alasan, bisa dipulihkan). Hapus permanen hanya oleh Administrator, untuk data yang sudah di-suspend (diputuskan 10 Oktober 2026) |
| Peran per fitur | Hak akses diatur per fitur dan per tindakan (lihat, tambah, ubah, suspend), bagian 3.2 |

---

## 14. Pertanyaan terbuka

- [ ] Siapa saja muda/i yang menjadi petugas scan?
- [ ] Hari apa saja pengajian rutin 3 kali seminggu itu? (mockup memakai Selasa, Kamis, Sabtu sebagai contoh)
- [ ] Pengajian putra dan putri berlangsung di waktu yang sama atau berbeda?
- [ ] Foto di kartu wajib, atau boleh dikosongkan bagi yang keberatan?
- [ ] Siapa yang mengumpulkan data dan foto peserta?
- [ ] Siapa yang menyediakan nomor WhatsApp khusus?
- [ ] Peserta pra-nikah yang sudah menikah: tidak aktif, atau status lain?
- [ ] Siapa yang menyimpan bukti persetujuan wali untuk peserta remaja?
- [ ] Peserta di luar sasaran yang ikut hadir: tetap dicatat hadir?
- [ ] Hak akses pada bagian 3.2 sudah sesuai? (perlu dikonfirmasi ke Ketua Muda/i)
- [x] Kalau peserta atau walinya meminta datanya dihapus: Administrator men-suspend lalu menghapus permanen (bagian 3.4).
