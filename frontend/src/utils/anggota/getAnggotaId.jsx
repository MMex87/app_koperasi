import axios from '../../api/axios'

const getAnggotaId = async (val) => {
    const response = await axios.get(`/anggota/${val}`)

    return response.data
}

export default getAnggotaId