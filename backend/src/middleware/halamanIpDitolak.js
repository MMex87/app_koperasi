// Halaman yang ditampilkan ke browser saat IP tidak terdaftar di IP_IZIN.
// HTML dibuat inline (tanpa file eksternal) agar tetap tampil walau build frontend tidak ada.

const escapeHtml = (teks) =>
  String(teks ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const halamanIpDitolak = (ip) => `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Akses Ditolak</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #f4f6f9; color: #2b2f36; }
    .kartu { background: #fff; border-radius: 14px; box-shadow: 0 4px 18px rgba(0, 0, 0, .08); padding: 36px 32px; max-width: 420px; width: calc(100% - 32px); text-align: center; }
    .ikon { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; background: #fde8e8; color: #c0392b; font-size: 34px; line-height: 64px; font-weight: 700; }
    h1 { font-size: 1.35rem; margin: 0 0 10px; }
    p { margin: 0 0 12px; line-height: 1.5; color: #555d68; }
    .ip { display: inline-block; margin-top: 6px; padding: 6px 12px; border-radius: 8px; background: #f1f3f6; font-family: ui-monospace, Consolas, monospace; color: #2b2f36; }
    .catatan { font-size: .85rem; color: #8a929c; margin-top: 18px; }
    @media (prefers-color-scheme: dark) {
      body { background: #15181d; color: #e6e8eb; }
      .kartu { background: #1e2228; box-shadow: none; }
      p { color: #a9b0ba; }
      .ip { background: #2a2f37; color: #e6e8eb; }
      .ikon { background: #3a1f1f; color: #ff7a6b; }
      .catatan { color: #7d8590; }
    }
  </style>
</head>
<body>
  <main class="kartu">
    <div class="ikon" aria-hidden="true">!</div>
    <h1>Akses Ditolak</h1>
    <p>Perangkat ini tidak terdaftar untuk mengakses aplikasi kasir.</p>
    <p>Alamat IP perangkat Anda:</p>
    <span class="ip">${escapeHtml(ip)}</span>
    <p class="catatan">Hubungi admin untuk mendaftarkan perangkat ini.</p>
  </main>
</body>
</html>
`;

module.exports = { halamanIpDitolak, escapeHtml };
