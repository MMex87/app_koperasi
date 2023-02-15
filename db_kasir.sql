-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 15, 2023 at 06:42 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_kasir`
--

-- --------------------------------------------------------

--
-- Table structure for table `anggota`
--

CREATE TABLE `anggota` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `noHP` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `anggota`
--

INSERT INTO `anggota` (`id`, `nama`, `noHP`) VALUES
(1, 'bayu bayu', '08998817853');

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `kodeBarang` varchar(255) DEFAULT NULL,
  `jenisBarang` varchar(255) DEFAULT NULL,
  `satuan` varchar(255) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `hargaBeli` int(11) DEFAULT NULL,
  `hargaJual` int(11) DEFAULT NULL,
  `idSupplier` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pembayarancicilan`
--

CREATE TABLE `pembayarancicilan` (
  `id` int(11) NOT NULL,
  `totalBayar` int(11) DEFAULT NULL,
  `idTransaksi` int(11) DEFAULT NULL,
  `idAnggota` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `penjualanbon`
--

CREATE TABLE `penjualanbon` (
  `id` int(11) NOT NULL,
  `totalBayar` int(11) DEFAULT NULL,
  `idPenjualan` int(11) DEFAULT NULL,
  `idSupplier` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `returnpembelian`
--

CREATE TABLE `returnpembelian` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `idTransPembelian` int(11) DEFAULT NULL,
  `idSupplier` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `returnpenjualan`
--

CREATE TABLE `returnpenjualan` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `idTransPenjualan` int(11) DEFAULT NULL,
  `idAnggota` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `noHP` varchar(255) DEFAULT NULL,
  `alamat` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `transpembelian`
--

CREATE TABLE `transpembelian` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `harga` int(11) DEFAULT NULL,
  `typePembayaran` varchar(255) DEFAULT NULL,
  `idSupplier` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `transpenjualan`
--

CREATE TABLE `transpenjualan` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `harga` int(11) DEFAULT NULL,
  `typePembayaran` varchar(255) DEFAULT NULL,
  `idAnggota` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anggota`
--
ALTER TABLE `anggota`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barang_id_supplier` (`idSupplier`);

--
-- Indexes for table `pembayarancicilan`
--
ALTER TABLE `pembayarancicilan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pembayarancicilan_id_transaksi` (`idTransaksi`),
  ADD KEY `pembayarancicilan_id_anggota` (`idAnggota`);

--
-- Indexes for table `penjualanbon`
--
ALTER TABLE `penjualanbon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penjualanbon_id_penjualan` (`idPenjualan`),
  ADD KEY `penjualanbon_id_supplier` (`idSupplier`),
  ADD KEY `penjualanbon_id_barang` (`idBarang`);

--
-- Indexes for table `returnpembelian`
--
ALTER TABLE `returnpembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_pembelian_id_trans_pembelian` (`idTransPembelian`),
  ADD KEY `return_pembelian_id_supplier` (`idSupplier`),
  ADD KEY `return_pembelian_id_barang` (`idBarang`);

--
-- Indexes for table `returnpenjualan`
--
ALTER TABLE `returnpenjualan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_penjualan_id_trans_penjualan` (`idTransPenjualan`),
  ADD KEY `return_penjualan_id_barang` (`idBarang`),
  ADD KEY `return_penjualan_id_anggota` (`idAnggota`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transpembelian`
--
ALTER TABLE `transpembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trans_pembelian_id_supplier` (`idSupplier`),
  ADD KEY `trans_pembelian_id_barang` (`idBarang`);

--
-- Indexes for table `transpenjualan`
--
ALTER TABLE `transpenjualan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trans_penjualan_id_anggota` (`idAnggota`),
  ADD KEY `trans_penjualan_id_barang` (`idBarang`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `anggota`
--
ALTER TABLE `anggota`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `barang`
--
ALTER TABLE `barang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pembayarancicilan`
--
ALTER TABLE `pembayarancicilan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `penjualanbon`
--
ALTER TABLE `penjualanbon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returnpembelian`
--
ALTER TABLE `returnpembelian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `returnpenjualan`
--
ALTER TABLE `returnpenjualan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transpembelian`
--
ALTER TABLE `transpembelian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transpenjualan`
--
ALTER TABLE `transpenjualan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
