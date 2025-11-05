-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 05, 2025 at 08:12 AM
-- Server version: 10.6.23-MariaDB
-- PHP Version: 8.4.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smshagor_cloud_storage`
--

-- --------------------------------------------------------

--
-- Table structure for table `files_metadata`
--

CREATE TABLE `files_metadata` (
  `file_id` varchar(32) NOT NULL,
  `user_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `full_path` varchar(1000) NOT NULL,
  `size` bigint(20) DEFAULT 0,
  `file_type` varchar(50) DEFAULT NULL,
  `is_directory` tinyint(1) DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `permissions` varchar(10) DEFAULT '644',
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `files_metadata`
--

INSERT INTO `files_metadata` (`file_id`, `user_id`, `filename`, `file_path`, `full_path`, `size`, `file_type`, `is_directory`, `mime_type`, `permissions`, `owner_id`, `created_at`, `updated_at`) VALUES
('005a694543b5699771ef8963d172cdd6', 1, 'README.md', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/README.md', 3298, 'md', 0, 'text/plain', '644', 1, '2025-11-04 09:15:19', '2025-11-04 09:15:19'),
('3eaefb37151af1da1649980e4ef8a52d', 1, 'script.js', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/script.js', 1006, 'js', 0, 'text/plain', '644', 1, '2025-11-04 09:15:20', '2025-11-04 09:15:20'),
('48de0ef80f23689601259fb4f888a896', 1, 'style.css', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/style.css', 2219, 'css', 0, 'text/plain', '644', 1, '2025-11-04 16:16:45', '2025-11-04 16:16:45'),
('55e08fb7cdc38eb43f914e4b8ec6f89f', 1, 'shagor.html', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/shagor.html', 66, 'html', 0, 'application/x-empty', '644', 1, '2025-11-04 07:58:17', '2025-11-04 08:16:51'),
('ad98eeb9e463be75366ad8e73624dba4', 1, 'index.html', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/index.html', 478, 'html', 0, 'text/html', '644', 1, '2025-11-04 09:15:20', '2025-11-04 09:15:20'),
('b963b527d4fdc87061c95ffeb50a9770', 1, 'styles.css', '', '/home/smshagor/cloud.coderpoint.ru/cloud_storage/smshagor/styles.css', 1469, 'css', 0, 'text/plain', '644', 1, '2025-11-04 09:15:20', '2025-11-04 09:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `storage_path` varchar(255) DEFAULT NULL,
  `storage_used` bigint(20) DEFAULT 0,
  `storage_limit` bigint(20) DEFAULT 104857600,
  `permissions` text DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `storage_path`, `storage_used`, `storage_limit`, `permissions`, `role`, `is_active`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'smshagor', 'smshagor.ru@gmail.com', '$2y$10$uZJTPAYQKug3GGfFvdBsaOtrrOQNttPsvhk6ht7Kbzwp0nzlyr.ti', '/cloud_storage/smshagor', 8536, 104857600, '{\"global\":[\"read\",\"write\",\"create\",\"delete\"]}', 'user', 1, '2025-11-01 21:27:15', '2025-11-04 22:03:28', '2025-11-04 22:03:28'),
(2, 'smshagor1', 'smshagor60@gmail.com', '$2y$10$ABLvCPbfe4ygvnY/O..RC.zpyDD0zIiC4ceeAkGAc4WlVSUjiZTmu', '/cloud_storage/smshagor1', 0, 104857600, '{\"global\":[\"read\",\"write\",\"create\",\"delete\"]}', 'user', 1, '2025-11-03 09:22:50', '2025-11-03 09:37:30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(64) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, '151bbee162ad6c4f1f8fe0654a5accc399ac56961fcb205d864eee9651afafa3', '2025-11-02 21:27:15', '185.77.216.26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-01 21:27:15'),
(9, 1, 'e3e9549d565bfc191d064b96cb4629b9ae0aa4fd0ab1e9b5115e77315537f2a2', '2025-11-03 20:39:53', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-02 20:39:53'),
(10, 1, 'e7d2a4c7ddc5b66552c22f1d32d99fa890062771ba992a64fab53ef0306e1e72', '2025-11-03 21:02:44', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-02 21:02:44'),
(16, 1, '35c98ec20a919b0f1735faa67a2efebca20dd8274721b84264e47e1c174d81bd', '2025-11-04 09:25:20', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 09:25:20'),
(17, 1, '7d95cc9c319ea20aa68da3ab48ceb67b42802cbc58b40c622dfe32e18c679b7c', '2025-12-01 10:09:32', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-03 10:09:32'),
(18, 1, '6d0581f18cad619da39f818a0829ec766888830431df9e8ddde3bc8455fcc056', '2025-11-05 15:51:09', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 15:51:09'),
(19, 1, 'b4b88429373fe23a1306b1f9a3fec7d258268c63dede98dfc017e9968ae1f3f3', '2025-11-05 22:03:28', '185.77.216.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-04 22:03:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `files_metadata`
--
ALTER TABLE `files_metadata`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_file_path` (`file_path`),
  ADD KEY `idx_file_type` (`file_type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `files_metadata`
--
ALTER TABLE `files_metadata`
  ADD CONSTRAINT `files_metadata_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
