import axios from '../../api/axios'

const getAnggota = async () => {
    const response = await axios.get('/anggota')

    return response.data
}

export default getAnggota