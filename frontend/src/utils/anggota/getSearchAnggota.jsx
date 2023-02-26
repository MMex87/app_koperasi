import axios from '../../api/axios'

const getSearchAnggota = async (search, limit, page) => {
    const response = await axios.get(`anggotaSearch?search=${search}&limit=${limit}&page=${page}`)

    return response.data
}

export default getSearchAnggota