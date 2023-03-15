import axios from '../../api/axios'

const barangTerjual = async (id, jumlah) => {
    const response = await axios.put(`/barangTerjual/${id}/${jumlah}`)

    return response.data.msg
}

export default barangTerjual