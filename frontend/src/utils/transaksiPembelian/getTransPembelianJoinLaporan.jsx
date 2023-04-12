import axios from "../../api/axios"

const getTransPembelianJoinLaporan = async (supplier) => {
    const response = await axios.get(`/transPembelianJoinLaporan?supplier=${supplier}`)

    return response.data
}

export default getTransPembelianJoinLaporan