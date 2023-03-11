import axios from '../../api/axios'

const getBarangJoin = async () => {
    const response = await axios.get('/barangJoin')
    return response.data
}

export default getBarangJoin