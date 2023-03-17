import axios from '../../api/axios'

const barangTerbeli = async (id, jumlah) => {
    const response = await axios.put(`/barangTerbeli/${id}`, {
        jumlah
    })

    return response.data.msg
}

export default barangTerbeli