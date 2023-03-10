import axios from "../../api/axios"

const getTransPembelianJoin = async () => {
    const response = await axios.get('/transPembelianJoin')

    return response.data
}

export default getTransPembelianJoin