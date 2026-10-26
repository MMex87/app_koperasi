# App Koperasi

Aplikasi kasir dan manajemen koperasi/kantin berbasis web. Fiturnya mencakup transaksi penjualan dan pembelian, retur, bon anggota, stok barang, laporan, dan dashboard.

## Fitur

- **Dashboard**: penjualan harian/bulanan, laba, grafik, barang terlaris, dan stok menipis
- **Transaksi**: penjualan (scan barcode atau input manual), pembelian, dan retur penjualan/pembelian
- **Data master**: barang, anggota, dan supplier
- **Bon anggota**: penjualan kredit dan pembayaran bon
- **Laporan** penjualan, pembelian, anggota, customer, supplier, dan barang (harian dan bulanan), dengan export Excel dan PDF
- **Aksi admin dengan PIN**: penyesuaian stok, hapus barang, dan pembatalan faktur, lengkap dengan jejak admin

## Teknologi

| Bagian | Stack |
| --- | --- |
| Backend | Node.js, Express, Sequelize, MySQL |
| Frontend | React 18 (Create React App), Redux, React Router, React Bootstrap |
| Deploy | Windows Service (`node-windows`); backend sekaligus menyajikan hasil build frontend |

## Struktur folder

```
app_koperasi/
├── backend/
│   ├── app.js              # entry point: API + menyajikan frontend/build
│   ├── service.js          # install/uninstall Windows service
│   ├── src/
│   │   ├── config/         # base URL, CORS, koneksi database
│   │   ├── controllers/
│   │   ├── middleware/     # validasi PIN admin
│   │   ├── model/          # model Sequelize
│   │   └── routes/
│   └── tests/              # Jest (unit + integration)
├── frontend/
│   └── src/
│       ├── api/axios.jsx   # base URL API
│       ├── containers/     # halaman dan layout
│       ├── redux/
│       ├── router/
│       └── utils/
├── db_kasir (2).sql        # dump database awal
└── SETUP.md                # panduan instalasi di komputer user
```

## Menjalankan untuk development

Yang perlu disiapkan: Node.js LTS dan MySQL (misalnya Laragon atau XAMPP).

1. Buat database `db_kasir`, lalu import `db_kasir (2).sql`.
2. Atur `backend/.env`:

   ```
   BASE_URL = http://localhost:8800
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

3. Jalankan backend:

   ```
   cd backend
   npm install
   npm start
   ```

4. Jalankan frontend di terminal lain:

   ```
   cd frontend
   npm install
   npm start
   ```

   Frontend terbuka di http://localhost:3000. Saat development, URL API diambil dari `frontend/.env.development` (`REACT_APP_API_URL`).

5. Jalankan test backend:

   ```
   cd backend
   npm test
   ```

## Deploy (produksi)

Pada mode produksi, frontend di-build lalu disajikan langsung oleh backend. UI dan API berjalan di satu port (8800), dan URL API otomatis mengikuti alamat yang dibuka di browser. Karena itu aplikasi bisa diakses lewat IP, misalnya `http://192.168.1.3:8800`, tanpa build ulang saat IP berganti.

```
cd frontend
npm run build

cd ../backend
node service.js install   # jalankan sebagai Administrator
```

Langkah lengkapnya (Laragon, IP statis, firewall, update, dan troubleshooting) ada di **[SETUP.md](SETUP.md)**.

### Perintah Windows service

| Perintah | Fungsi |
| --- | --- |
| `node service.js install` | Pasang service **BackendKoperasi** dan langsung menjalankannya |
| `node service.js start` | Menjalankan service |
| `node service.js stop` | Menghentikan service |
| `node service.js uninstall` | Menghapus service |

Log service ada di `backend/daemon/`.

## Lisensi

[MIT](LICENSE)
