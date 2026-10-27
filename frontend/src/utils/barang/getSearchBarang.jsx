import axios from '../../api/axios'

// arsip: true = hanya barang yang diarsipkan, false = hanya barang aktif
const getSearchBarang = async (search, limit, page, arsip = false) => {
    const response = await axios.get(`/barangSearch?search=${search}&limit=${limit}&page=${page}${arsip ? '&arsip=1' : ''}`)
    return response.data
}

export default getSearchBarang
