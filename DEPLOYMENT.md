# Soenrect Management Dashboard - Deployment & Local Dev Guide

Panduan langkah demi langkah untuk mengunggah proyek ke GitHub, melakukan deployment ke Vercel, dan melakukan pengembangan lokal secara aman tanpa mengganggu basis data produksi.

---

## 1. Persiapan Lingkungan (Environment Setup)

Proyek ini menggunakan Vite, yang secara otomatis membedakan file konfigurasi env berdasarkan mode jalannya:
* **Produksi (Production)**: Membaca file `.env` atau `.env.production`.
* **Pengembangan Lokal (Local Development)**: Membaca file `.env.development` atau `.env.local`.

### Cara Develop Lokal Tanpa Mengganggu Produksi:
1. Salin berkas `.env.development.example` menjadi `.env.development`:
   ```bash
   cp .env.development.example .env.development
   ```
2. Buka `.env.development` dan ganti dengan URL & Anon Key dari **Supabase Project khusus development/testing** Anda.
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
   *Vite akan membaca `.env.development` secara otomatis, sehingga database produksi Anda tetap aman.*

---

## 2. Unggah ke GitHub

Kami telah menyediakan file `.gitignore` untuk mencegah berkas sensitif (seperti `.env` dan `node_modules`) terunggah ke repositori publik.

Jalankan perintah berikut di terminal Anda:
```bash
# Inisialisasi git repository
git init

# Tambahkan semua berkas ke git tracking
git add .

# Buat commit pertama Anda
git commit -m "Initial commit: Soenrect Management Dashboard"

# Hubungkan ke repositori GitHub baru Anda
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git

# Push kode ke GitHub
git push -u origin main
```

---

## 3. Deploy ke Vercel

Kami telah mengonfigurasi berkas `vercel.json` agar routing SPA (Single Page Application) berjalan mulus tanpa error 404 saat halaman di-refresh di Vercel.

### Cara Deploy Melalui Dashboard Vercel:
1. Masuk ke [Vercel](https://vercel.com) dan hubungkan akun GitHub Anda.
2. Klik **Add New** -> **Project**.
3. Impor repositori GitHub proyek ini.
4. Di bagian **Environment Variables**, masukkan kredensial produksi Anda (dari berkas `.env` lokal Anda):
   * `VITE_ADMIN_USERNAME`
   * `VITE_ADMIN_PASSWORD`
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Selesai!
