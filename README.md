# Smart Waste Management System (SWMS)

Smart Waste Management System (SWMS) adalah aplikasi berbasis web yang dirancang untuk membantu pencatatan dan pengelolaan data sampah secara digital. Aplikasi ini dikembangkan sebagai bagian dari proyek mata kuliah Pemrograman Berorientasi Objek (PBO) dengan tujuan mendukung konsep pengelolaan sampah berkelanjutan (SDG 11 & SDG 12).

## Tujuan Aplikasi
- Mencatat data sampah secara terstruktur
- Mensimulasikan input data dari sensor
- Membedakan peran pengguna (Admin & Petugas)
- Menjadi media pembelajaran sistem berbasis web (frontend & backend)

## Fitur Utama
- Pemilihan peran pengguna (Admin / Petugas)
- Login berdasarkan peran
- Input data sampah secara manual
- Simulasi input data sampah dari sensor
- Menampilkan data sampah dalam tabel
- Hapus data satuan
- Hapus seluruh data
- Logout & reset sesi pengguna

## Teknologi yang Digunakan
- HTML5
- CSS3
- JavaScript (ES6)
- PHP (backend lokal)
- MySQL (database lokal)
- GitHub Pages (static hosting untuk demo)

---

## Arsitektur Penyimpanan Data

Aplikasi ini menggunakan **dua jenis penyimpanan data**, tergantung pada fitur dan lingkungan eksekusi.

### 1. Database (MySQL – Localhost)
Digunakan untuk:
- Input data sampah manual
- Hapus data satuan
- Hapus seluruh data
- Penyimpanan data permanen

**Hanya berjalan di localhost**, karena memerlukan backend PHP dan database MySQL.

---

### 2. Local Storage (Browser)
Digunakan untuk:
- Menyimpan sesi login
- Menyimpan data hasil simulasi sensor
- Menampilkan data simulasi pada tabel

**Simulasi sensor hanya tersimpan di localStorage**, tidak masuk ke database.

##  Catatan Penting (Batasan Sistem)

Aplikasi ini berjalan dalam **dua mode** dengan kemampuan yang berbeda:

###  Mode Localhost (Direkomendasikan)
URL: http://localhost/Smart%20Waste%20Management_PBO/


Fitur yang berfungsi:
- Input data sampah manual 
- Simulasi sensor 
- Hapus data satuan & semua data 
- Penyimpanan database MySQL 

### Mode Online (GitHub Pages)
URL: https://babyykoala.github.io/SWMS/


Keterbatasan:
- GitHub Pages **tidak mendukung PHP & database**
- Folder `api/` **tidak dieksekusi**
- Input & hapus data ke database 
- Simulasi sensor (localStorage) 

**Keterbatasan ini berasal dari platform hosting**, bukan kesalahan logika aplikasi.

## Cara Menjalankan Aplikasi

###  Menjalankan di Localhost
1. Jalankan web server lokal (XAMPP / Laragon)
2. Aktifkan Apache & MySQL
3. Pindahkan folder proyek ke direktori `htdocs`
4. Akses melalui browser: http://localhost/Smart%20Waste%20Management_PBO/

###  Menjalankan Online (Demo)
Akses melalui GitHub Pages: https://babyykoala.github.io/SWMS/

## Akun Demo
- **Admin**  
  Username: `admin`  
  Password: `admin123`

- **Petugas**  
  Username: `petugas`  
  Password: `petugas123`

## Catatan Pengembangan Lanjutan
Aplikasi ini masih dapat dikembangkan lebih lanjut dengan:
- Migrasi backend ke REST API online
- Menggunakan Firebase / Supabase
- Autentikasi berbasis token (JWT)
- Penyimpanan data berbasis cloud

## Pengembang
izul, yafi & sukma  
Proyek Mata Kuliah Pemrograman Berorientasi Objek (PBO)

