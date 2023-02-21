import axios from '../../api/axios'

const getBarang = async () => {
    const response = await axios.get('/barang')
    return response.data
}

export default getBarang