import axios from "../../api/axios"

const getTransPembelian = async () => {
    const response = await axios.get('/transPembelian')

    return response.data
}

export default getTransPembelian