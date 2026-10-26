# Panduan Setup Aplikasi Koperasi

Panduan ini memasang aplikasi koperasi di komputer user memakai **Laragon** (MySQL), dengan alamat akses **http://192.168.1.3:8800**. Backend Express menyajikan API sekaligus halaman aplikasi, jadi cukup satu port dan satu Windows service.

## Sebelum mulai

- Pastikan semua perubahan terbaru sudah di-**commit dan push** ke GitHub (branch `dev`). Yang di-clone hanya isi repo, jadi perubahan yang belum di-push tidak ikut terpasang.
- Siapkan akses internet untuk download software dan `npm install`.
- Semua perintah di bawah dijalankan di Command Prompt atau PowerShell. Langkah yang butuh hak **Administrator** ditandai.

## 1. Install software

| Software | Keterangan | Download |
| --- | --- | --- |
| Laragon (Full) | Menyediakan MySQL dan HeidiSQL | [laragon.org](https://laragon.org) |
| Node.js LTS | Install terpisah, karena Node bawaan Laragon biasanya versi lama | [nodejs.org](https://nodejs.org) |
| Git | Laragon Full biasanya sudah menyertakannya | [git-scm.com](https://git-scm.com) |

Cek hasil instalasi:

```
node -v
npm -v
git --version
```

## 2. Atur IP statis

IP komputer harus tetap **192.168.1.3**, karena semua komputer lain mengakses aplikasi lewat alamat ini.

1. Buka **Settings → Network & Internet → Ethernet/Wi-Fi → IP assignment → Edit → Manual**.
2. Isi IP address `192.168.1.3`, lalu subnet, gateway, dan DNS sesuai jaringan.
3. Cara lain: buat DHCP reservation di router untuk komputer ini.
4. Cek hasilnya dengan `ipconfig`, lalu lihat baris **IPv4 Address**.

## 3. Clone project

Clone ke `D:\app_kantin\` supaya path-nya sama dengan yang tertulis di `backend\service.js`.

```
mkdir D:\app_kantin
cd D:\app_kantin
git clone https://github.com/MMex87/app_koperasi.git
cd app_koperasi
git checkout dev
```

Kalau di-clone ke folder lain, ubah path `script` di `backend\service.js`.

## 4. Siapkan database di Laragon

1. Buka Laragon, lalu klik **Start All**.
2. Klik **Database** untuk membuka HeidiSQL, lalu login dengan user `root` dan password kosong.
3. Klik kanan koneksi, pilih **Create new → Database**, beri nama `db_kasir`, lalu klik OK.
4. Pilih database `db_kasir`, buka **File → Run SQL file...**, lalu pilih `D:\app_kantin\app_koperasi\db_kasir (2).sql`.

Cara lain lewat **Terminal** Laragon:

```
cd D:\app_kantin\app_koperasi
mysql -u root -e "CREATE DATABASE db_kasir"
mysql -u root db_kasir < "db_kasir (2).sql"
```

### Laragon jalan otomatis

Buka **Menu → Preferences → General**, lalu centang:

- **Run Laragon when Windows starts**
- **Start All automatically**

Langkah ini wajib. MySQL dari Laragon hanya jalan selama Laragon terbuka. Kalau Laragon belum jalan, aplikasi akan menampilkan error karena database tidak aktif.

## 5. Konfigurasi backend

Edit file `D:\app_kantin\app_koperasi\backend\.env`:

```
BASE_URL = http://192.168.1.3:8800

ALLOW_ORIGIN = *
ALLOW_HEADER = "Content-Type, Accept, Access-Control-Request-Method, Authorization, Origin"
ALLOW_METHOD = "GET, POST, PUT, DELETE"
ADMIN_PIN = 1234

DB_CONN = true
DB_DIAL = mysql
DB_HOST = localhost
DB_USER = root
DB_PASS =
DB_NAME = db_kasir
```

- `DB_PASS` dibiarkan kosong, karena itu bawaan Laragon.
- Ganti `ADMIN_PIN` dengan PIN admin yang diinginkan. Tanpa PIN, aksi admin (penyesuaian stok, hapus barang, batal faktur) akan ditolak.

## 6. Install dependency dan build

```
cd D:\app_kantin\app_koperasi\backend
npm install

cd D:\app_kantin\app_koperasi\frontend
npm install
npm run build
```

Pastikan folder `frontend\build` sudah terbentuk.

### Tes jalankan manual

```
cd D:\app_kantin\app_koperasi\backend
node app.js
```

Kalau berhasil, muncul `Server Running at http://192.168.1.3:8800` dan `Database connect successfull..`. Buka **http://192.168.1.3:8800** di browser untuk mengecek, lalu tekan **Ctrl+C** untuk menghentikan server.

## 7. Windows service, firewall, dan akses

### Pasang backend sebagai Windows service

Buka terminal sebagai **Administrator**:

```
cd D:\app_kantin\app_koperasi\backend
node service.js install
```

Service **BackendKoperasi** akan otomatis jalan setiap komputer menyala. Statusnya bisa dicek di `services.msc`.

### Buka port di firewall

Di PowerShell **Administrator**:

```
New-NetFirewallRule -DisplayName "Koperasi App" -Direction Inbound -Protocol TCP -LocalPort 8800 -Action Allow
```

### Akses aplikasi

- Dari komputer itu sendiri maupun komputer lain di jaringan yang sama, buka **http://192.168.1.3:8800**.
- Tidak perlu `npm start`, `npx serve`, atau port 3000.

## 8. Update kode

Jalankan dari terminal **Administrator**:

```
cd D:\app_kantin\app_koperasi
git pull
cd frontend
npm install
npm run build
cd ..\backend
npm install
node service.js stop
node service.js start
```

Setelah itu tekan **Ctrl+F5** di browser.

## Troubleshooting

| Masalah | Yang dicek |
| --- | --- |
| Halaman tidak bisa dibuka dari komputer lain | Rule firewall port 8800, dan pastikan IP masih 192.168.1.3 |
| Halaman terbuka tapi data kosong atau error | Laragon/MySQL belum jalan. Cek log di `backend\daemon\backendkoperasi.err.log` |
| Pesan "Folder build frontend tidak ditemukan" | Jalankan `npm run build` di folder `frontend` |
| Error "Cannot read properties of undefined" | Pastikan aplikasi dibuka lewat port **8800**, bukan 3000 |
| "The requested path could not be found" | Itu halaman dari `npx serve` di port 3000. Tutup proses itu dan buka port 8800 |

Catatan keamanan: `backend\.env` ikut tersimpan di Git, termasuk `ADMIN_PIN` dan password database. Kalau repo-nya publik, sebaiknya file ini dikeluarkan dari Git.
