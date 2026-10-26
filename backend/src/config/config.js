const dotenv = require('dotenv')

// load dotenv
dotenv.config()


const baseUrl = () => {
    let url = process.env.BASE_URL
    let base = url.replace("http://", "").replace("https://", "")
    let index = base.lastIndexOf(':')
    let port = base.substring(index).replace(":", "")

    return {
        url, port
    }
}

// ID data tetap yang dipakai laporan (bisa diubah lewat .env)
const idSupplierLaporan = process.env.ID_SUPPLIER_LAPORAN || "1" // supplier "waserda"
const idAnggotaCustomer = process.env.ID_ANGGOTA_CUSTOMER || "354" // anggota "costumer" (pelanggan umum)

module.exports = {
    baseUrl,
    idSupplierLaporan,
    idAnggotaCustomer
}