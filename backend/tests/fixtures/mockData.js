// Mock Data untuk Testing

const mockBarang = {
  id: 1,
  nama: "Kopi Kapal Api",
  kodeBarang: "KK001",
  jenisBarang: "Minuman",
  satuan: "Sachet",
  jumlah: 100,
  hargaBeli: 1000,
  hargaJual: 1500,
  supplierId: 1,
};

const mockAnggota = {
  id: 1,
  nama: "Budi Santoso",
  noHP: "081234567890",
};

const mockSupplier = {
  id: 1,
  nama: "PT Supplier Kopi",
  noHP: "081234567891",
  alamat: "Jl. Kopi No. 1",
};

const mockTransPenjualan = {
  id: 1,
  jumlah: 5,
  faktur: "FKJ-20240303-001",
  harga: 7500, // 5 * 1500
  typePembayaran: "Tunai",
  anggotaId: 1,
  barangId: 1,
  statusPenjualan: "onProcess",
};

const mockTransPembelian = {
  id: 1,
  jumlah: 50,
  faktur: "FKB-20240303-001",
  harga: 50000, // 50 * 1000
  hargaJual: 75000, // 50 * 1500
  supplierId: 1,
  barangId: 1,
  statusPembelian: "onProcess",
};

// Valid test data untuk create penjualan
const validPenjualanData = {
  jumlah: 5,
  faktur: "FKJ-20240303-TEST",
  harga: 7500,
  typePembayaran: "Tunai",
  anggotaId: 1,
  barangId: 1,
  statusPenjualan: "onProcess",
};

// Invalid test data - data tidak lengkap
const incompletePenjualanData = {
  jumlah: 5,
  faktur: "FKJ-20240303-TEST",
  // missing required fields
};

// Invalid test data - jumlah negatif
const negativeJumlahData = {
  jumlah: -5,
  faktur: "FKJ-20240303-TEST",
  harga: 7500,
  typePembayaran: "Tunai",
  anggotaId: 1,
  barangId: 1,
  statusPenjualan: "onProcess",
};

// Invalid test data - jumlah nol
const zeroJumlahData = {
  jumlah: 0,
  faktur: "FKJ-20240303-TEST",
  harga: 0,
  typePembayaran: "Tunai",
  anggotaId: 1,
  barangId: 1,
  statusPenjualan: "onProcess",
};

module.exports = {
  mockBarang,
  mockAnggota,
  mockSupplier,
  mockTransPenjualan,
  mockTransPembelian,
  validPenjualanData,
  incompletePenjualanData,
  negativeJumlahData,
  zeroJumlahData,
};
