import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Anggota from "../containers/pages/anggota";
import TambahAnggota from "../containers/pages/anggota/TambahAnggota";
import Barang from "../containers/pages/barang";
import BarangAdmin from "../containers/pages/barang/indexAdmin";
import Dashboard from "../containers/pages/dashboard";
import Supplier from "../containers/pages/supplier";
import TambahSupplier from "../containers/pages/supplier/TambahSupplier";
import TransPembelian from "../containers/pages/transaksi/pembelian";
import TransPenjualan from "../containers/pages/transaksi/penjualan";
import RetrunPembelian from "../containers/pages/transaksi/retrunPembelian";
import RPembelian from "../containers/pages/transaksi/retrunPembelian/retur";
import RetrunPenjualan from "../containers/pages/transaksi/retrunPenjualan";
import RPenjualan from "../containers/pages/transaksi/retrunPenjualan/retur";
import ReportPenjualan from "../containers/pages/laporan/tPenjualan";
import ReportPenjualanBulan from "../containers/pages/laporan/tPenjualanBulan";
import ReportPembelian from "../containers/pages/laporan/tPembelian";
import ReportPembelianBulan from "../containers/pages/laporan/tPembelianBulan";
import ReportAnggota from "../containers/pages/laporan/tAnggota";
import ReportCustomer from "../containers/pages/laporan/tCustomer";
import ReportSupplier from "../containers/pages/laporan/tSupplier";
import ReportBarang from "../containers/pages/laporan/tBarang";
// import Cicilan from "../containers/pages/cicilan";
import LogPembelian from "../containers/pages/riwayat/logPembelian";
import LogPenjualan from "../containers/pages/riwayat/logPenjualan";
import Template from "../containers/templates/Template";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={"/"} element={<Template />}>
      <Route index element={<Dashboard />} />
      <Route path={"/anggota"}>
        <Route index element={<Anggota />} />
        <Route path={"/anggota/:jenis"} element={<TambahAnggota />} />
        <Route path={"/anggota/:jenis/:id"} element={<TambahAnggota />} />
      </Route>
      <Route path={"/barang"} element={<Barang />} />
      <Route path={"/barang-admin"} element={<BarangAdmin />} />
      <Route path={"/supplier"}>
        <Route index element={<Supplier />} />
        <Route path={"/supplier/:jenis"} element={<TambahSupplier />} />
        <Route path={"/supplier/:jenis/:id"} element={<TambahSupplier />} />
      </Route>
      // router Transaksi
      <Route path={"/transPenjualan"} element={<TransPenjualan />} />
      <Route path={"/retrunPenjualan"} element={<RetrunPenjualan />} />
      <Route path={"/retrunPenjualan/:id"} element={<RPenjualan />} />
      <Route path={"/transPembelian"} element={<TransPembelian />} />
      <Route path={"/retrunPembelian"} element={<RetrunPembelian />} />
      <Route path={"/retrunPembelian/:id"} element={<RPembelian />} />
      // router Log
      <Route path={"/logPembelian"} element={<LogPembelian />} />
      <Route path={"/logPenjualan"} element={<LogPenjualan />} />
      {/* <Route path={"/cicilan"} element={<Cicilan />} /> */}
      // router Laporan
      <Route path={"/reportPenjualan"} element={<ReportPenjualan />} />
      <Route path={"/reportPenjualanBulan"} element={<ReportPenjualanBulan />} />
      <Route path={"/reportPembelian"} element={<ReportPembelian />} />
      <Route path={"/reportPembelianBulan"} element={<ReportPembelianBulan />} />
      <Route path={"/reportAnggota"} element={<ReportAnggota />} />
      <Route path={"/reportCustomer"} element={<ReportCustomer />} />
      <Route path={"/reportSupplier"} element={<ReportSupplier />} />
      <Route path={"/reportBarang"} element={<ReportBarang />} />
    </Route>,
  ),
);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
