import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

// Struktur menu: item tunggal punya `to`, grup punya `children`
const MENU = [
  { to: "/", label: "Dashboard", icon: "bi-grid-1x2", end: true },
  { heading: "Master" },
  { to: "/barang", label: "Barang", icon: "bi-box-seam" },
  { to: "/anggota", label: "Anggota", icon: "bi-people" },
  { to: "/supplier", label: "Supplier", icon: "bi-shop" },
  { heading: "Transaksi" },
  {
    key: "penjualan",
    label: "Penjualan",
    icon: "bi-cart3",
    children: [
      { to: "/transPenjualan", label: "Kasir Penjualan" },
      { to: "/retrunPenjualan", label: "Retur Penjualan" },
    ],
  },
  {
    key: "pembelian",
    label: "Pembelian",
    icon: "bi-truck",
    children: [
      { to: "/transPembelian", label: "Pembelian Barang" },
      { to: "/retrunPembelian", label: "Retur Pembelian" },
    ],
  },
  { heading: "Laporan" },
  {
    key: "laporan",
    label: "Laporan",
    icon: "bi-file-earmark-bar-graph",
    children: [
      { to: "/reportPenjualan", label: "Penjualan" },
      { to: "/reportPembelian", label: "Pembelian" },
      { to: "/reportAnggota", label: "Anggota" },
      { to: "/reportCustomer", label: "Customer" },
      { to: "/reportSupplier", label: "Retur ke Supplier" },
      { to: "/reportBarang", label: "Stok Barang" },
    ],
  },
];

// Path aktif termasuk sub-halaman, mis. /barang/12 aktif untuk /barang
const cocok = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);
const grupAktif = (pathname) => MENU.find((m) => m.children?.some((c) => cocok(pathname, c.to)))?.key;

const SideBar = () => {
  const { pathname } = useLocation();
  const [terbuka, setTerbuka] = useState(() => grupAktif(pathname));

  useEffect(() => {
    // Buka grup halaman aktif, dan tutup sidebar mode mobile setelah pindah halaman
    const aktif = grupAktif(pathname);
    if (aktif) setTerbuka(aktif);
    document.body.classList.remove("toggle-sidebar");
  }, [pathname]);

  return (
    <>
      <aside id="sidebar" className="sidebar app-sidebar">
        <Link to="/transPenjualan" className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-cart-plus" />
          Transaksi Baru
        </Link>

        <ul className="sidebar-nav" id="sidebar-nav">
          {MENU.map((m, i) => {
            if (m.heading) {
              return (
                <li key={`h-${i}`} className="nav-heading">
                  {m.heading}
                </li>
              );
            }

            if (!m.children) {
              return (
                <li key={m.to} className="nav-item">
                  <NavLink to={m.to} end={m.end} className={({ isActive }) => `nav-link ${isActive ? "active" : "collapsed"}`}>
                    <i className={`bi ${m.icon}`} />
                    <span>{m.label}</span>
                  </NavLink>
                </li>
              );
            }

            const open = terbuka === m.key;
            const adaAktif = m.children.some((c) => cocok(pathname, c.to));
            return (
              <li key={m.key} className="nav-item">
                <button type="button" className={`nav-link w-100 border-0 text-start ${adaAktif ? "parent-active" : ""} ${open ? "" : "collapsed"}`} aria-expanded={open} onClick={() => setTerbuka(open ? null : m.key)}>
                  <i className={`bi ${m.icon}`} />
                  <span>{m.label}</span>
                  <i className="bi bi-chevron-down ms-auto" />
                </button>
                <ul className={`nav-content collapse ${open ? "show" : ""}`}>
                  {m.children.map((c) => (
                    <li key={c.to}>
                      <NavLink to={c.to} className={() => (cocok(pathname, c.to) ? "active" : "")}>
                        <span>{c.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer small text-muted">
          <i className="bi bi-building me-1" />
          Koperasi Karyawan Harta Wijaya
        </div>
      </aside>

      {/* Latar gelap saat sidebar dibuka di layar kecil */}
      <div className="sidebar-backdrop" onClick={() => document.body.classList.remove("toggle-sidebar")} />

      <style>{`
        .app-sidebar { display: flex; flex-direction: column; padding: 16px 12px; }
        .app-sidebar .sidebar-nav { flex: 1; }
        .app-sidebar .sidebar-nav .nav-heading { margin: 16px 0 6px 12px; letter-spacing: .05em; }
        .app-sidebar .sidebar-nav .nav-item { margin-bottom: 2px; }
        .app-sidebar .sidebar-nav .nav-link {
          position: relative; font-size: 14px; padding: 9px 12px; border-radius: 8px;
          transition: background-color .15s ease, color .15s ease;
        }
        .app-sidebar .sidebar-nav .nav-link i { font-size: 17px; }
        .app-sidebar .sidebar-nav .nav-link.active { background: rgba(13,110,253,.1); color: var(--bs-primary); }
        .app-sidebar .sidebar-nav .nav-link.active i { color: var(--bs-primary); }
        .app-sidebar .sidebar-nav .nav-link.active::before {
          content: ""; position: absolute; left: -12px; top: 8px; bottom: 8px;
          width: 4px; border-radius: 0 4px 4px 0; background: var(--bs-primary);
        }
        .app-sidebar .sidebar-nav .nav-link.parent-active,
        .app-sidebar .sidebar-nav .nav-link.parent-active i:first-child { color: var(--bs-primary); }
        .app-sidebar .sidebar-nav .nav-link .bi-chevron-down { font-size: 12px; }
        .app-sidebar .sidebar-nav .nav-content {
          margin: 2px 0 6px 21px; padding: 0; border-left: 2px solid #e9edf5;
        }
        .app-sidebar .sidebar-nav .nav-content a {
          padding: 7px 0 7px 18px; margin-left: -2px; font-size: 13.5px; font-weight: 500;
          color: #4b5b7a; border-left: 2px solid transparent;
        }
        .app-sidebar .sidebar-nav .nav-content a:hover { color: var(--bs-primary); }
        .app-sidebar .sidebar-nav .nav-content a.active {
          color: var(--bs-primary); font-weight: 700; border-left-color: var(--bs-primary);
        }
        .app-sidebar .sidebar-footer {
          border-top: 1px solid #e9edf5; padding: 12px 8px 0; margin-top: 12px; font-size: 12px;
        }
        .sidebar-backdrop { display: none; }
        @media (max-width: 1199px) {
          .app-sidebar { z-index: 998; width: 260px; }
          .toggle-sidebar .sidebar-backdrop {
            display: block; position: fixed; inset: 60px 0 0 0; z-index: 997;
            background: rgba(1, 41, 112, .35);
          }
        }
      `}</style>
    </>
  );
};

export default SideBar;
