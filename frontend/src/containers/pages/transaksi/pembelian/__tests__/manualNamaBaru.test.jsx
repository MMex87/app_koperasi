// Input manual pembelian: barang baru dengan nama yang sudah diisi harus terkirim ke POST /barang.
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import axios from "../../../../../api/axios";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import TransaksiPembelian from "../index";
import getSupplier from "../../../../../utils/supplier/getSupplier";
import getBarang, { findBarang } from "../../../../../utils/barang/getBarang";
import getBarangJoin from "../../../../../utils/barang/getBarangJoin";
import getTransPembelian, { cariTransaksi } from "../../../../../utils/transaksiPembelian/getTransaksiPembelian";
import getTransPembelianJoin from "../../../../../utils/transaksiPembelian/getTransPembelianJoin";
import getBarangJoinAutoComplate from "../../../../../utils/barang/getBarangJoinAutoComplate";
import Swal from "sweetalert2";

jest.mock("../../../../../api/axios", () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock("../../../../../utils/supplier/getSupplier", () => jest.fn());
jest.mock("../../../../../utils/barang/getBarang", () => ({ __esModule: true, default: jest.fn(), findBarang: jest.fn() }));
jest.mock("../../../../../utils/barang/getBarangJoin", () => jest.fn());
jest.mock("../../../../../utils/barang/getBarangJoinAutoComplate", () => jest.fn());
jest.mock("../../../../../utils/transaksiPembelian/getTransaksiPembelian", () => ({ __esModule: true, default: jest.fn(), cariTransaksi: jest.fn() }));
jest.mock("../../../../../utils/transaksiPembelian/getTransPembelianJoin", () => jest.fn());
jest.mock("../cartList", () => () => null);
jest.mock("sweetalert2", () => ({ fire: jest.fn(), mixin: () => ({ fire: jest.fn() }) }));

beforeEach(() => {
  getSupplier.mockResolvedValue([{ id: 1, nama: "Sumber Rejeki" }]);
  getBarang.mockResolvedValue({ barang: [], count: 0 });
  getBarangJoin.mockResolvedValue([]);
  getBarangJoinAutoComplate.mockResolvedValue([]);
  getTransPembelian.mockResolvedValue([]);
  getTransPembelianJoin.mockResolvedValue([]);
  findBarang.mockResolvedValue(null);
  cariTransaksi.mockResolvedValue(null);
  axios.post.mockResolvedValue({ data: { barangId: 99 } });
});

const ubah = (id, nilai) => fireEvent.change(document.getElementById(id), { target: { value: nilai } });

test("manual: barang baru dengan nama terisi dikirim ke POST /barang dengan nama itu", async () => {
  const store = createStore(rootReducer);
  render(
    <Provider store={store}>
      <TransaksiPembelian />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 20)));

  // Pilih supplier dari daftar
  const inputSupplier = screen.getByPlaceholderText("Ketik nama supplier...");
  fireEvent.click(inputSupplier);
  fireEvent.change(inputSupplier, { target: { value: "Sumber" } });
  fireEvent.click(await screen.findByText("Sumber Rejeki"));

  // Isi barang baru secara manual
  ubah("kodeBarang", "TEH001");
  ubah("namabarang", "Teh Uji");
  ubah("jumlah", "5");
  ubah("hargaBeli", "3000");
  ubah("hargaJual", "4000");
  fireEvent.change(document.getElementById("jenis"), { target: { value: "Minuman" } });
  fireEvent.change(document.getElementById("satuan"), { target: { value: "Pcs" } });

  fireEvent.click(screen.getByRole("button", { name: /tambah ke daftar/i }));
  await act(() => new Promise((r) => setTimeout(r, 20)));

  const panggilanBarang = axios.post.mock.calls.find(([url]) => url === "/barang");
  expect(Swal.fire).not.toHaveBeenCalledWith("Error!", expect.stringContaining("wajib"), expect.anything());
  expect(panggilanBarang).toBeDefined();
  expect(panggilanBarang[1]).toMatchObject({ nama: "Teh Uji", kodeBarang: "TEH001", supplierId: 1 });
});

test("restock barang yang sudah ada: PUT /barang hanya mengirim jenis & satuan, tanpa error wajib", async () => {
  // Barang sudah terdaftar dengan nama & kode yang sama dan supplier yang sama
  getBarangJoin.mockResolvedValue([{ id: 9, nama: "Teh Uji", kodeBarang: "TEH001", hargaBeli: 3000, hargaJual: 4000, jenisBarang: "Minuman", satuan: "Pcs", supplier: { nama: "Sumber Rejeki" } }]);
  findBarang.mockResolvedValue({ id: 9 });

  const store = createStore(rootReducer);
  render(
    <Provider store={store}>
      <TransaksiPembelian />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 20)));

  const inputSupplier = screen.getByPlaceholderText("Ketik nama supplier...");
  fireEvent.click(inputSupplier);
  fireEvent.change(inputSupplier, { target: { value: "Sumber" } });
  fireEvent.click(await screen.findByText("Sumber Rejeki"));

  ubah("kodeBarang", "TEH001");
  ubah("namabarang", "Teh Uji");
  ubah("jumlah", "5");
  ubah("hargaBeli", "3000");
  ubah("hargaJual", "4000");
  fireEvent.change(document.getElementById("jenis"), { target: { value: "Minuman" } });
  fireEvent.change(document.getElementById("satuan"), { target: { value: "Pcs" } });

  fireEvent.click(screen.getByRole("button", { name: /tambah ke daftar/i }));
  await act(() => new Promise((r) => setTimeout(r, 20)));

  const panggilanPut = axios.put.mock.calls.find(([url]) => url === "/barang/9");
  expect(panggilanPut).toBeDefined();
  expect(Object.keys(panggilanPut[1]).sort()).toEqual(["jenisBarang", "satuan"]);
  expect(Swal.fire).not.toHaveBeenCalledWith("Error!", expect.anything(), expect.anything());
});
