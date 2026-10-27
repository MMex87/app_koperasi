import axios from '../../api/axios'

// termasukArsip: halaman pembelian ikut menampilkan barang arsip agar bisa di-restock (kasir tidak)
const getBarangJoinAutoComplate = async (search, termasukArsip = false) => {
    const response = await axios.get('barangJoinAuto', { params: { search, ...(termasukArsip ? { termasukArsip: 1 } : {}) } })
    return response.data
}

export default getBarangJoinAutoComplate
