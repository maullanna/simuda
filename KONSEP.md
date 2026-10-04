# Konsep SIMUDA (Sistem Informasi Muda/i)

Sistem absensi dan manajemen pengajian muda/i Bendlay 2 & Bendlay 4.
Dokumen ini adalah acuan utama untuk pengembangan. Kalau ada keputusan baru, perbarui dokumen ini dulu sebelum mengubah kode.

Terakhir diperbarui: 4 Oktober 2026

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
| Kategori | Remaja (18 tahun ke bawah) dan Pra-nikah (19 tahun ke atas), dihitung otomatis dari tanggal lahir |
| Sasaran pengajian | Bisa khusus remaja, khusus pra-nikah, atau gabungan |
| Penanggung jawab | Ketua Muda/i |

---

## 3. Peran pengguna dan hak akses

| Akses | Kyai | Wakil | Ketua | Sekretaris | Bendahara | Pengurus | Petugas scan | Peserta |
|---|---|---|---|---|---|---|---|---|
| Beranda pengurus | Lihat | Lihat | Lihat | Lihat | Lihat | Lihat | – | – |
| Data peserta | Lihat | Kelola | Kelola | Kelola | Lihat | Lihat | – | Data sendiri |
| Scan kehadiran | – | Ya | Ya | Ya | Ya | Ya | Ya | – |
| Catat izin | – | Ya | Ya | Ya | – | Ya | – | Tahap 2: ajukan sendiri |
| Jadwal & materi | Lihat | Kelola | Kelola | Kelola | Lihat | Lihat | – | Lihat |
| Rekap & perlu dihubungi | Lihat | Lihat | Lihat | Kelola | Lihat | Wilayahnya | – | – |
| Sodaqoh | Lihat | Lihat | Lihat | – | Kelola | – | – | – |
| Musyawarah | Lihat | Kelola | Kelola | Kelola | Lihat | Lihat | – | – |
| Masukan | Lihat | Lihat | Lihat | Lihat | – | – | – | Kirim |
| Kepengurusan & akun | Lihat | Kelola | Kelola | – | – | – | – | – |

Catatan:
- Petugas scan adalah muda/i yang juga peserta. Satu orang bisa punya peran peserta dan petugas scan sekaligus.
- Peran petugas scan bisa diberikan dan dicabut kapan saja, karena digilir.
- Tabel ini masih draf dan perlu dikonfirmasi ke Ketua Muda/i.

---

## 4. Menu dan halaman

### 4.1 Pengurus (sidebar)

| Menu | URL | Isi |
|---|---|---|
| Beranda | `/dashboard` | Pengajian hari ini (jumlah hadir putra dan putri), tombol buka scanner, ringkasan angka (peserta aktif, hadir terakhir, izin minggu ini, saldo sodaqoh), grafik kehadiran 8 pengajian terakhir, daftar perlu dihubungi, jadwal minggu ini, sodaqoh terbaru |
| Peserta | `/peserta` | Tab Semua / Remaja / Pra-nikah, filter Putra/Putri dan Bendlay 2/4, pencarian nama, tabel peserta, tombol Impor Excel, Cetak kartu, Tambah peserta |
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
- Kategori remaja/pra-nikah **tidak diisi manual**. Dihitung dari tanggal lahir, dan otomatis berpindah saat peserta berusia 19 tahun.
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
- Setiap sesi punya: tanggal, jam, jenis kelamin (putra/putri), sasaran (remaja/pra-nikah/gabungan), pemateri, materi.
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
- Data tidak bisa dihapus. Setiap perubahan tercatat beserta alasan.

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
| `sesi_pengajian` | tanggal, jam_mulai, jenis_kelamin, sasaran, pemateri_id, materi, catatan, status | sasaran: remaja / pra-nikah / gabungan. status: terjadwal / berlangsung / selesai / batal |
| `kehadiran` | sesi_id, peserta_id, status, metode, keterangan, dicatat_oleh, waktu | Unik per (sesi_id, peserta_id). status: hadir / izin / alpa. metode: qr / manual / izin |
| `lampiran` | sesi_id, url, nama_file, tipe | File disimpan di storage, database hanya menyimpan URL |
| `pengurus` | user_id, nama, jabatan, wilayah, peran | peran: kyai / wakil / ketua / sekretaris / bendahara / pengurus / petugas_scan |
| `sodaqoh` | tanggal, sesi_id, jenis, jumlah, keterangan, penghitung_1_id, penghitung_2_id, bukti_url, dicatat_oleh | jenis: pemasukan / pengeluaran. Jumlah dalam rupiah, bilangan bulat |
| `audit_log` | user_id, tabel, record_id, aksi, data_lama, data_baru, alasan, waktu | Wajib untuk perubahan sodaqoh dan data peserta |
| `musyawarah` | tanggal, agenda, lokasi, hasil, notulis_id, status | |
| `tindak_lanjut` | musyawarah_id, tugas, pic_id, tenggat, status | status: belum / berjalan / selesai |
| `masukan` | sesi_id, peserta_id, isi, dibuat_at | peserta_id kosong berarti tanpa nama |
| `notifikasi_log` | penerima, kanal, jenis, isi, status, dikirim_at | Tahap 3 |
| `push_subscription` | user_id, endpoint, p256dh, auth | Tahap 3 |
| Tabel Better Auth | user, session, account, verification | Dibuat otomatis |

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
| Remaja/pra-nikah | Dihitung otomatis dari tanggal lahir, kadang gabung kadang pisah |
| Kepengurusan | Terpisah Bendlay 2 dan Bendlay 4, pengajian bersama |
| Pengeluaran sodaqoh | Wajib dicatat |
| Penanggung jawab | Ketua Muda/i |
| Petugas scan | Muda/i yang juga peserta, digilir |
| Kartu | Kartu biasa: nama, foto, QR |
| Persetujuan wali | Di luar sistem |
| Pengingat WhatsApp | Sekali seminggu |

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
- [ ] Hak akses pada bagian 3 sudah sesuai?
