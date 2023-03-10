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
    supplier: '',
    kodeBarang_beli: '',
    namaBarang_beli: '',
    jumlah_beli: '',
    jenis_beli: '',
    satuan_beli: '',
    harga_beli: '',
    harga_jual: '',
    faktur_beli: '',
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
        case ActionType.SET_SUPPLIER_PEMBELIAN:
            return {
                ...state,
                supplier: action.index
            }
        case ActionType.SET_HARGA_PEMBELIAN:
            return {
                ...state,
                harga_beli: action.index
            }
        case ActionType.SET_HARGA_JUAL_PEMBELIAN:
            return {
                ...state,
                harga_jual: action.index
            }
        case ActionType.SET_JENIS_PEMBELIAN:
            return {
                ...state,
                jenis_beli: action.index
            }
        case ActionType.SET_SATUAN_PEMBELIAN:
            return {
                ...state,
                satuan_beli: action.index
            }
        case ActionType.SET_JUMLAH_PEMBELIAN:
            return {
                ...state,
                jumlah_beli: action.index
            }
        case ActionType.SET_KODE_BARANG_PEMBELIAN:
            return {
                ...state,
                kodeBarang_beli: action.index
            }
        case ActionType.SET_NAMA_BARANG_PEMBELIAN:
            return {
                ...state,
                namaBarang_beli: action.index
            }
        case ActionType.SET_FAKTUR_PEMBELIAN:
            return {
                ...state,
                faktur_beli: action.index
            }
        default:
            return state
    }
}

export default rootReducer