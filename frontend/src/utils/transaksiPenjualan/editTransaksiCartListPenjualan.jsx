import axios from "../../api/axios"

const editTransaksiCartListPenjualan = async (data) => {
    const response = await axios.put(`/transPenjualan/${data.id}`, {
        jumlah: data.jumlah
    })
    return response.data.msg
}

export default editTransaksiCartListPenjualan