import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom'
import Anggota from '../containers/pages/anggota'
import TambahAnggota from '../containers/pages/anggota/TambahAnggota'
import Barang from '../containers/pages/barang'
import Dashboard from '../containers/pages/dashboard'
import Supplier from '../containers/pages/supplier'
import TambahSupplier from '../containers/pages/supplier/TambahSupplier'
import TransPembelian from '../containers/pages/transaksi/pembelian'
import TransPenjualan from '../containers/pages/transaksi/penjualan'
import Template from '../containers/templates/Template'




const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path={ '/' } element={ <Template /> }>
            <Route index element={ <Dashboard /> } />
            <Route path={ '/anggota' } >
                <Route index element={ <Anggota /> } />
                <Route path={ '/anggota/:jenis' } element={ <TambahAnggota /> } />
                <Route path={ '/anggota/:jenis/:id' } element={ <TambahAnggota /> } />
            </Route>
            <Route path={ '/barang' } element={ <Barang /> } />
            <Route path={ '/supplier' }>
                <Route index element={ <Supplier /> } />
                <Route path={ '/supplier/:jenis' } element={ <TambahSupplier /> } />
                <Route path={ '/supplier/:jenis/:id' } element={ <TambahSupplier /> } />
            </Route>
            <Route path={ '/transPenjualan' } element={ <TransPenjualan /> } />
            <Route path={ '/transPembelian' } element={ <TransPembelian /> } />
        </Route>
    )
)


function Router() {
    return (
        <RouterProvider router={ router } />
    )
}

export default Router