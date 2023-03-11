import axios from "../../api/axios"

const editTransaksiCartListPembelian = async (data) => {
    const response = await axios.put(`/transPembelian/${data.id}`, {
        jumlah: data.jumlah,
        harga: data.harga
    })
    return response.data.msg
}

export default editTransaksiCartListPembelian