import axios from '../../api/axios'

const getSupplierId = async (val) => {
    const response = await axios.get(`/supplier/${val}`)
    return response.data
}

export default getSupplierId