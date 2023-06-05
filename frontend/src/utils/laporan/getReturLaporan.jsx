import axios from "../../api/axios"

const getReturLaporan = async (supplier) => {
    const response = await axios.get(`/returnPembelianLaporan?supplier=${supplier}`)
    return response.data
}

export default getReturLaporan