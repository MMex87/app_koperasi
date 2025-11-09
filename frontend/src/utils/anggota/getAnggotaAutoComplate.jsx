import axios from '../../api/axios'

const getAnggotaAutoComplate = async (search) => {
    const response = await axios.get(`anggotaAuto?search=${search}`)

    return response.data
}

export default getAnggotaAutoComplate