import axios from '../../api/axios'

const getBarangJoinAutoComplate = async (search) => {
    const response = await axios.get(`barangJoinAuto?search=${search}`)
    return response.data
}

export default getBarangJoinAutoComplate