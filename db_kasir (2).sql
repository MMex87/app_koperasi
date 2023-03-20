-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2023 at 06:31 AM
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `supplierId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pembayarancicilan`
--

CREATE TABLE `pembayarancicilan` (
  `id` int(11) NOT NULL,
  `jumlahBayar` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `penjualanbonId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `penjualanbon`
--

CREATE TABLE `penjualanbon` (
  `id` int(11) NOT NULL,
  `statusBon` varchar(255) DEFAULT NULL,
  `totalBayar` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `transPenjualanId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `returnpembelian`
--

CREATE TABLE `returnpembelian` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `barangId` int(11) DEFAULT NULL,
  `supplierId` int(11) DEFAULT NULL,
  `transPembelianId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `returnpenjualan`
--

CREATE TABLE `returnpenjualan` (
  `id` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `faktur` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `transPenjualanId` int(11) DEFAULT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `barangId` int(11) DEFAULT NULL
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `barangId` int(11) DEFAULT NULL,
  `supplierId` int(11) DEFAULT NULL,
  `statusPembelian` varchar(255) DEFAULT NULL,
  `hargaJual` int(11) DEFAULT NULL
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `barangId` int(11) DEFAULT NULL,
  `anggotaId` int(11) DEFAULT NULL,
  `statusPenjualan` varchar(255) DEFAULT NULL
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
  ADD KEY `supplierId` (`supplierId`);

--
-- Indexes for table `pembayarancicilan`
--
ALTER TABLE `pembayarancicilan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `anggotaId` (`anggotaId`),
  ADD KEY `penjualanbonId` (`penjualanbonId`);

--
-- Indexes for table `penjualanbon`
--
ALTER TABLE `penjualanbon`
  ADD PRIMARY KEY (`id`),
  ADD KEY `anggotaId` (`anggotaId`),
  ADD KEY `transPenjualanId` (`transPenjualanId`);

--
-- Indexes for table `returnpembelian`
--
ALTER TABLE `returnpembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barangId` (`barangId`),
  ADD KEY `supplierId` (`supplierId`),
  ADD KEY `transPembelianId` (`transPembelianId`);

--
-- Indexes for table `returnpenjualan`
--
ALTER TABLE `returnpenjualan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transPenjualanId` (`transPenjualanId`),
  ADD KEY `anggotaId` (`anggotaId`),
  ADD KEY `barangId` (`barangId`);

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
  ADD KEY `barangId` (`barangId`),
  ADD KEY `supplierId` (`supplierId`);

--
-- Indexes for table `transpenjualan`
--
ALTER TABLE `transpenjualan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barangId` (`barangId`),
  ADD KEY `anggotaId` (`anggotaId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `anggota`
--
ALTER TABLE `anggota`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barang`
--
ALTER TABLE `barang`
  ADD CONSTRAINT `barang_ibfk_1` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pembayarancicilan`
--
ALTER TABLE `pembayarancicilan`
  ADD CONSTRAINT `pembayarancicilan_ibfk_1` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pembayarancicilan_ibfk_2` FOREIGN KEY (`penjualanbonId`) REFERENCES `penjualanbon` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `penjualanbon`
--
ALTER TABLE `penjualanbon`
  ADD CONSTRAINT `penjualanbon_ibfk_1` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `penjualanbon_ibfk_2` FOREIGN KEY (`transPenjualanId`) REFERENCES `transpenjualan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `returnpembelian`
--
ALTER TABLE `returnpembelian`
  ADD CONSTRAINT `returnpembelian_ibfk_1` FOREIGN KEY (`barangId`) REFERENCES `barang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnpembelian_ibfk_2` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnpembelian_ibfk_3` FOREIGN KEY (`transPembelianId`) REFERENCES `transpembelian` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `returnpenjualan`
--
ALTER TABLE `returnpenjualan`
  ADD CONSTRAINT `returnpenjualan_ibfk_1` FOREIGN KEY (`transPenjualanId`) REFERENCES `transpenjualan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnpenjualan_ibfk_2` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `returnpenjualan_ibfk_3` FOREIGN KEY (`barangId`) REFERENCES `barang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transpembelian`
--
ALTER TABLE `transpembelian`
  ADD CONSTRAINT `transpembelian_ibfk_7` FOREIGN KEY (`barangId`) REFERENCES `barang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transpembelian_ibfk_8` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transpenjualan`
--
ALTER TABLE `transpenjualan`
  ADD CONSTRAINT `transpenjualan_ibfk_3` FOREIGN KEY (`barangId`) REFERENCES `barang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transpenjualan_ibfk_4` FOREIGN KEY (`anggotaId`) REFERENCES `anggota` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
