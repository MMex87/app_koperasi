🚀 Cara Menjalankan Backend sebagai Windows Service

1. Install Service

Buka terminal di folder project.

Jalankan perintah:

node service.js install


Setelah berhasil, service akan otomatis muncul di Windows services.msc dengan nama BackendKoperasi.

2. Menjalankan Service

Service biasanya langsung aktif setelah di-install.

Kalau statusnya Stopped, jalankan:

node service.js start

3. Mematikan Service

Untuk menghentikan service sementara:

node service.js stop

4. Menghapus Service

Jika tidak ingin lagi menjalankan backend sebagai service:

node service.js uninstall

5. Mengecek Status Service

Tekan Win + R → ketik services.msc → Enter.

Cari service bernama BackendKoperasi.

Status akan terlihat apakah Running atau Stopped.

6. Melihat Log Service

Semua output console dan error akan dicatat di folder logs di dalam project.

Jika service gagal jalan, cek file log di folder tersebut untuk mengetahui penyebabnya.

⚠️ Troubleshooting

Service tidak mau Running

Pastikan file utama backend (server.js atau index.js) ada dan bisa dijalankan manual dengan node server.js.

Kalau gagal jalan manual, perbaiki errornya dulu.

Port sudah dipakai

Jika ada aplikasi lain pakai port 3000, service akan mati.

Solusi: ubah port di file server (misalnya pakai 4000).

Database tidak connect

Pastikan database (MySQL/PostgreSQL) sudah aktif.

Cek konfigurasi username, password, host, dan nama database.

Service tidak muncul di services.msc

Coba uninstall dulu lalu install ulang:

node service.js uninstall
node service.js install