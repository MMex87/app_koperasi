import axios from '../../api/axios'

// arsip: true = hanya barang yang diarsipkan, false = hanya barang aktif
// stok: "" (semua) | "tersedia" | "menipis" | "habis"
const getSearchBarang = async (search, limit, page, arsip = false, stok = '') => {
    const response = await axios.get(`/barangSearch?search=${search}&limit=${limit}&page=${page}${arsip ? '&arsip=1' : ''}${stok ? '&stok=' + stok : ''}`)
    return response.data
}

export default getSearchBarang
