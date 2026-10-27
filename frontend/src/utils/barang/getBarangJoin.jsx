import axios from '../../api/axios'

// termasukArsip: halaman pembelian ikut menampilkan barang arsip agar bisa di-restock (kasir tidak)
const getBarangJoin = async (termasukArsip = false) => {
    const response = await axios.get('/barangJoin', { params: termasukArsip ? { termasukArsip: 1 } : {} })
    return response.data
}

export default getBarangJoin
