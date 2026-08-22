# Soenrect Platform - Event & Video Production Management Website

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

Soenrect Platform adalah sistem manajemen operasional internal yang dirancang khusus untuk mengelola logistik event, alokasi kru & peralatan teknis (*crew & equipment allocation*), serta alur kerja pasca-produksi video (*video post-production pipeline*).

---

## ✨ Fitur Utama

1. **Executive Overview & Analytics**: Dashboard visual interaktif untuk memonitor KPI proyek, kalender agenda terintegrasi, chart alokasi kru, dan metrik utilisasi peralatan.
2. **Project & Production Management**: Papan kontrol status proyek mulai dari tahap perencanaan, pra-produksi, produksi, pasca-produksi, hingga selesai.
3. **Crew & Equipment Allocation**: Alokasi kru penanggung jawab untuk setiap proyek secara personil dan peminjaman inventaris alat (kamera, lensa, rig lampu, sound, dll) dengan validasi ketersediaan stok (*stock control*).
4. **Post-Production Pipeline & Revision Log**: Manajemen aset video hasil produksi beserta fitur *Approval QMG*, pengajuan revisi revisi, catatan instruksi sutradara (*Initial Change Notes*), serta status implementasi revisi per item.
5. **Technical Equipment Database**: Inventaris alat dengan Serial Number, status pemeliharaan (*Maintenance/Retired*), aksesoris terdaftar, unggahan foto dengan **auto-compressor** di sisi klien, serta peninjauan gambar menggunakan **Lightbox Preview Modal**.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, TypeScript, Vanilla CSS (desain modern & dinamis, Glassmorphism, kustom animasi).
* **Bundler & Dev Server**: Vite.
* **Database & Auth**: Supabase (Realtime Database & PostgreSQL).
* **Deployment Platform**: Vercel.

---

## ⚙️ Cara Memulai (Getting Started)

### Prasyarat:
* Node.js versi 18 ke atas.
* Akun database Supabase (opsional, jika ingin mengaktifkan sinkronisasi cloud database).

### 1. Klon Repositori & Instal Dependensi:
```bash
# Klon repositori ini
git clone https://github.com/dzikri098/event-management-soenrect.git

# Masuk ke folder proyek
cd event-management-soenrect

# Instal semua dependensi
npm install
```

### 2. Konfigurasi Database Supabase:
Jika Anda ingin menyiapkan basis data baru dari awal:
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Salin isi berkas `supabase/schema.sql` dan jalankan di **SQL Editor** pada dashboard Supabase Anda untuk membuat semua tabel dan relasi yang diperlukan.

### 3. Konfigurasi Environment Variables:
1. Untuk **Production**, buat file `.env` di root proyek.
2. Untuk **Local Development** (pengembangan lokal tanpa mengganggu produksi), buat file `.env.development`:
   ```bash
   cp .env.development.example .env.development
   ```
3. Masukkan kredensial URL dan Anon Key Supabase Anda ke dalam file env tersebut:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Jalankan Aplikasi:
```bash
# Jalankan server lokal untuk development
npm run dev

# Lakukan kompilasi build produksi
npm run build

# Uji coba preview hasil build produksi secara lokal
npm run preview
```

---

## 📂 Struktur Proyek (Project Structure)

```
001. Management Website/
├── public/                  # Aset publik statis (logo, video, dll)
├── src/
│   ├── assets/              # Aset gambar/ikon SVG
│   ├── components/          # Komponen UI global (Chart, Modal, Table, dll)
│   │   ├── shell/           # Tata letak utama dashboard (Header, Sidebar)
│   │   └── overlays/        # Komponen modal dialog & verifikasi hapus
│   ├── services/            # Logika integrasi Supabase & Mock Fallback
│   ├── styles/              # Sistem CSS modular (tokens, primitives, templates)
│   ├── templates/           # Halaman web dashboard & portal kru
│   ├── types/               # Definisi tipe TypeScript
│   └── main.ts              # Titik masuk utama (Entrypoint) & SPA Router
├── supabase/
│   └── schema.sql           # Struktur skema DDL SQL untuk inisialisasi basis data
├── .gitignore               # Daftar pengecualian berkas git
├── vercel.json              # Konfigurasi rewrite routing untuk Vercel
├── DEPLOYMENT.md            # Panduan lengkap deployment & setup env
└── README.md                # Dokumentasi utama proyek
```

---

## 🚀 Deployment ke Vercel

Proyek ini telah dikonfigurasi dengan berkas `vercel.json` agar routing berbasis Single Page Application (SPA) tidak memicu error 404 ketika halaman dimuat ulang (*refresh*).

Untuk panduan deployment selengkapnya, silakan baca berkas **[DEPLOYMENT.md](DEPLOYMENT.md)**.
