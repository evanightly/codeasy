# Codeasy  
*(Python Data Science Autograding System)*

Proyek ini berfokus pada pengembangan **autograding** dan **klasifikasi tingkat pemahaman** siswa dalam pembelajaran **Python untuk Data Science**, menggunakan kerangka kerja **Laravel (PHP)**, **React** (Inertia), dan **FastAPI** (Python), serta didukung oleh **Docker** untuk kemudahan pengembangan dan deployment.

## Daftar Isi
- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Struktur Teknologi](#struktur-teknologi)
- [Panduan Instalasi](#panduan-instalasi)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Struktur Direktori](#struktur-direktori)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang Proyek
Tujuan utama dari proyek ini adalah:
1. Membangun platform asinkron yang memungkinkan **analisis otomatis** terhadap hasil belajar siswa dalam pembelajaran Python Data Science.  
2. Menerapkan **Taksonomi Bloom** dan **Rule-Based Algorithm** untuk mengklasifikasikan tingkat kognitif siswa.  
3. Memberikan **feedback** instan melalui mekanisme autograding sehingga proses belajar mengajar jadi lebih efektif, interaktif, dan terukur.

Proyek ini sekaligus menjadi bagian dari penelitian skripsi untuk meningkatkan kualitas pembelajaran mandiri dan menilai efektivitas sistem dengan metode **T-Test** (Independent Sample) untuk menganalisis perbedaan kemampuan siswa sebelum dan sesudah menggunakan platform.

---

## Fitur Utama
1. **Modul Belajar Python Data Science**  
   - Materi berpedoman pada **SKKNI** (Standar Kompetensi Kerja Nasional Indonesia) serta Taksonomi Bloom.

2. **Autograding Realtime**  
   - Menggunakan **FastAPI** (Python) untuk mengeksekusi kode siswa secara otomatis.  
   - Memberikan hasil *pass/fail* unit test instan.

3. **Analisis Tingkat Pemahaman (Klasifikasi Bloom)**  
   - Setiap pengerjaan soal diklasifikasikan berdasarkan domain kognitif Bloom:  
     *Remembering, Understanding, Applying, Analyzing, Evaluating, Creating*.

4. **Deploy dengan Docker**  
   - Memudahkan proses setup environment: laravel, fastapi, mariadb, redis, dsb.  
   - *Docker Compose* agar integrasi antar layanan lebih praktis.

5. **Testing & Evaluasi**  
   - Blackbox testing dengan **Cypress**.  
   - Kuesioner **SUS** (System Usability Scale) untuk menilai kemudahan aplikasi.

6. **Student Code Isolation**  
   - Setiap siswa mendapat **kernel Python terpisah** untuk eksekusi kode.  
   - Mencegah **interferensi antar siswa** saat mengerjakan soal secara bersamaan.  
   - Dukungan **eksekusi konkuren** tanpa konflik variabel atau memori.

---

## Reminder

1. **Assign Teacher**  
   - Fitur assign teacher pada halaman admin tidak akan diimplementasikan untuk mitigasi kesalahan admin menugaskan guru ke sekolah yang salah.

## Struktur Teknologi
- **Backend**:  
  - **Laravel (PHP 8.3)** - FPM/NGINX untuk portal utama dan manajemen user.  
  - **FastAPI (Python 3.10)** - Menjalankan kode siswa (autograding).

- **Frontend**:  
  - **React + Inertia.js** (Typescript) di dalam Laravel.  
  - **Tailwind CSS** untuk styling.

- **Database**:  
  - **MariaDB** untuk data utama (user, soal, penilaian, dsb.).  
  - **Redis** (opsional) untuk cache & queue.

- **Deployment**:  
  - **Docker** + docker-compose.  
  - GHCR (GitHub Container Registry) untuk image.

- **Testing**:  
  - **Pytest** / Unittest di sisi FastAPI.  
  - **Cypress** di sisi client E2E.  
  - **Jest** (opsional) di sisi React.

---

## Panduan Instalasi
Langkah-langkah dasar untuk memulai pengembangan lokal:

1. **Clone repositori**  
   ```bash
   git clone https://github.com/username/reponame.git 
   
   cd reponame
2. **Buat file konfigurasi .env**

    Salin .env.example menjadi .env di folder laravel
3. **Build & Jalankan Docker**
    ```bash
    docker-compose up -d --build
4. **Laravel Setup**
    ```bash
    docker-compose exec laravel composer install
    
    docker-compose exec laravel php artisan key:generate
    
    docker-compose exec laravel php artisan migrate
5. **FastAPI Setup**

    Dependencies di fastapi/requirements.txt akan di-install saat build Docker.

    Endpoint default: http://localhost:8001

6. **Email Development dengan MailHog**

    Platform ini menggunakan MailHog untuk debugging email di **development environment saja**:

    ```bash
    # MailHog akan otomatis tersedia di: http://localhost:8025
    # Semua email yang dikirim aplikasi akan muncul di MailHog interface
    ```

    ⚠️ **Penting**: MailHog hanya untuk development! Di production, gunakan layanan email seperti SendGrid, SES, atau Mailgun.

    Untuk menggunakan password reset dan fitur email lainnya:
    - Pastikan MailHog service berjalan: `docker-compose ps mailhog`
    - Buka http://localhost:8025 untuk melihat email yang dikirim
    - Email tidak akan dikirim ke email sesungguhnya, hanya tampil di MailHog

7. **Akses Aplikasi**

    Laravel + Inertia di http://localhost:9001 (menyesuaikan mapping di docker-compose.yml).

---

## Panduan Penggunaan
1. Register/Sign in dengan akun guru atau siswa.
2. Guru:
    - Membuat modul & soal berdasarkan tingkatan Taksonomi Bloom.
    - Mendefinisikan testcase Python (unit testing) di folder fastapi/tests/.
3. Siswa:
    - Mengerjakan soal Data Science (Python) di interface React, lalu men-submit.
    - Mendapat feedback real-time pass/fail + analisis Bloom.
4. Klasifikasi Bloom:
    - Sistem menilai hasil berdasarkan aturan rule-based.
    - Menampilkan ringkasan per user: jumlah attempt, level taksonomi, dsb.

---

## Kontribusi
1. Fork repositori ini.
2. Buat branch baru: feature/nama-fitur.
3. Commit perubahan Anda.
4. Buat pull request ke branch main.

Kami terbuka terhadap ide, saran, dan kontribusi yang ingin menyempurnakan platform ini.
