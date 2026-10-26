import axios from "../../api/axios"

const editTransaksiCartListPembelian = async (data) => {
    const response = await axios.put(`/transPembelian/${data.id}`, {
        jumlah: data.jumlah,
        harga: data.harga,
        hargaJual: data.hargaJual
    })
    return response.data.msg
}

export default editTransaksiCartListPembelian