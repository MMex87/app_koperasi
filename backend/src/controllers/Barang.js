const barangModel = require('../model/BarangModel.js')


const getBarang = async (req, res) => {
    try {
        const barang = await barangModel.findAll({
            order: [
                ['nama', 'ASC']
            ]
        })
        res.status(200).json(barang)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data! " + error })
    }
}
const getBarangId = async (req, res) => {
    try {
        const barang = await barangModel.findOne({
            order: [
                ['nama', 'ASC']
            ],
            where: {
                id: req.params.id
            }
        })
        res.status(200).json(barang)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data! " + error })
    }
}

const tambahBarang = async (req, res) => {
    try {
        const { nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, idSupplier } = req.body

        await barangModel.create({
            nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, idSupplier
        })

        res.status(200).json({ msg: 'Data Berhasil Ditambahakan' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Menambah Data! " + error })
    }
}

const editBarang = async (req, res) => {
    try {
        const { nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, idSupplier } = req.body

        await barangModel.update({
            nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, idSupplier
        }, {
            where: {
                id: req.params.id
            }
        })

        res.status(200).json({ msg: 'Data Berhasil Diubah' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengedit Data! " + error })
    }
}

const hapusBarang = async (req, res) => {
    try {

        await barangModel.destroy({
            where: {
                id: req.params.id
            }
        })

        res.status(200).json({ msg: 'Data Berhasil Dihapus' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Menghapus Data! " + error })
    }
}

module.exports = {
    getBarang,
    getBarangId,
    tambahBarang,
    editBarang,
    hapusBarang
}