import ActionType from "./globalActionType"

const globalState = {
    anggota: '',
    typePembayaran: '',
    kodeBarang: '',
    namaBarang: '',
    jumlah: '',
    jenis: '',
    harga: '',
    faktur: '',
}

const rootReducer = (state = globalState, action) => {
    switch (action.type) {
        case ActionType.SET_ANGGOTA_PENJUALAN:
            return {
                ...state,
                anggota: action.index
            }
        case ActionType.SET_HARGA_PENJUALAN:
            return {
                ...state,
                harga: action.index
            }
        case ActionType.SET_JENIS_PENJUALAN:
            return {
                ...state,
                jenis: action.index
            }
        case ActionType.SET_JUMLAH_PENJUALAN:
            return {
                ...state,
                jumlah: action.index
            }
        case ActionType.SET_KODE_BARANG_PENJUALAN:
            return {
                ...state,
                kodeBarang: action.index
            }
        case ActionType.SET_NAMA_BARANG_PENJUALAN:
            return {
                ...state,
                namaBarang: action.index
            }
        case ActionType.SET_TYPE_BAYAR_PENJUALAN:
            return {
                ...state,
                typePembayaran: action.index
            }
        case ActionType.SET_FAKTUR_PENJUALAN:
            return {
                ...state,
                faktur: action.index
            }
        default:
            return state
    }
}

export default rootReducer