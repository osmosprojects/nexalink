-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 28, 2026 at 06:35 AM
-- Server version: 11.8.9-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u380325488_nexalink`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `audit_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_id`, `user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 11:34:10'),
(2, NULL, 'USER_LOGIN', 'user', 4, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 11:39:35'),
(3, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 11:51:55'),
(4, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 11:52:01'),
(5, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 11:52:32'),
(6, 1, 'PERSONA_UPDATED', 'persona', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 11:52:32'),
(7, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 11:52:46'),
(8, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-21 12:01:45'),
(9, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 12:07:11'),
(10, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 12:07:11'),
(11, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 12:07:11'),
(12, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-21 12:07:26'),
(13, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-21 12:17:04'),
(14, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-21 12:46:15'),
(15, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-21 12:46:37'),
(16, NULL, 'USER_LOGIN', 'user', 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-21 18:18:23'),
(17, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 03:06:26'),
(18, NULL, 'DEMO_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 05:12:14'),
(19, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-22 05:21:52'),
(20, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-22 05:46:07'),
(21, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-22 05:46:48'),
(22, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 05:54:25'),
(23, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 07:09:27'),
(24, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 07:12:22'),
(25, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 07:12:28'),
(26, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 10:26:00'),
(27, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 10:39:31'),
(28, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 10:40:32'),
(29, NULL, 'DEMO_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-22 10:52:09'),
(30, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-22 11:28:44'),
(31, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-22 11:29:29'),
(34, NULL, 'USER_LOGIN', 'user', 4, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 13:35:52'),
(35, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 13:36:48'),
(36, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-22 13:37:14'),
(37, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 04:33:50'),
(38, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 04:35:59'),
(39, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-23 04:39:05'),
(42, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 04:51:34'),
(43, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 06:26:41'),
(44, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 06:26:50'),
(45, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 06:34:58'),
(50, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 07:50:58'),
(52, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-23 08:31:19'),
(53, NULL, 'DEMO_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/153.0.0.0 Mobile Safari/537.36', '2026-09-23 08:35:19'),
(54, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 08:37:48'),
(55, NULL, 'USER_LOGIN', 'user', 6, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-23 10:13:13'),
(60, NULL, 'USER_LOGIN', 'user', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', '2026-09-23 10:34:13'),
(61, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 10:52:12'),
(62, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36', '2026-09-23 10:52:29'),
(63, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:04'),
(64, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:13'),
(65, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:20'),
(66, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:36'),
(67, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:39'),
(68, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:43'),
(69, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:53'),
(70, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:54:58'),
(71, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:07'),
(72, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:11'),
(73, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:18'),
(74, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:33'),
(75, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:37'),
(76, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:55:52'),
(77, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:56:48'),
(78, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:56:51'),
(79, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:57:05'),
(80, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:57:18'),
(81, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:57:50'),
(82, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-09-23 10:58:12'),
(83, NULL, 'USER_LOGIN', 'user', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/154.0.0.0 Mobile Safari/537.36', '2026-09-28 05:59:05'),
(84, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/154.0.0.0 Mobile Safari/537.36', '2026-09-28 06:00:26'),
(85, 9, 'PROFILE_UPDATED', 'profile', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Edg/154.0.0.0 Mobile Safari/537.36', '2026-09-28 06:01:08'),
(86, NULL, 'USER_LOGIN', 'user', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:01:56'),
(87, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:02:56'),
(88, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:03:01'),
(89, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:03:27'),
(90, 1, 'PROFILE_UPDATED', 'profile', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:04:00'),
(91, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:04:06'),
(92, NULL, 'USER_LOGIN', 'user', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:04:11'),
(93, 9, 'RECOMMENDATION_CONVERTED_TO_CONTACT', 'contact', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-09-28 06:06:49'),
(94, NULL, 'USER_LOGIN', 'user', 1, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-09-28 06:31:33'),
(95, NULL, 'USER_LOGOUT', 'user', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-09-28 06:32:16'),
(96, NULL, 'USER_LOGIN', 'user', 9, NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', '2026-09-28 06:32:19');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `job_title` varchar(150) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `relationship_type` enum('friend','mentor','mentee','colleague','client','prospect','founder','investor','recruiter','partner','other') NOT NULL DEFAULT 'other',
  `relationship_strength` int(11) NOT NULL DEFAULT 50,
  `last_interaction_at` datetime DEFAULT NULL,
  `next_follow_up_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`contact_id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `company`, `job_title`, `location`, `website`, `linkedin_url`, `avatar_url`, `relationship_type`, `relationship_strength`, `last_interaction_at`, `next_follow_up_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, 'Sanjeev', 'Sarma', NULL, NULL, 'The Networker', 'Chief at The Networker', NULL, NULL, NULL, '/uploads/avatars/avatar-1-1790575407666.avif', 'prospect', 67, NULL, NULL, 'Discovered through NexaLink Recommendation: ✓ Shared membership in BBB & BNI\n✓ Shared focus on religion\n✓ Shared target industry focus (Founders)\n✓ Both located in Mumbai', '2026-09-28 06:06:49', '2026-09-28 06:06:49');

-- --------------------------------------------------------

--
-- Table structure for table `contact_tags`
--

CREATE TABLE `contact_tags` (
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_tags`
--

INSERT INTO `contact_tags` (`contact_id`, `tag_id`, `created_at`) VALUES
(1, 9, '2026-09-28 06:29:14'),
(1, 10, '2026-09-28 06:06:49'),
(1, 11, '2026-09-28 06:06:49');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `goal_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `goal_type` varchar(100) NOT NULL DEFAULT 'connections',
  `target_value` int(11) NOT NULL DEFAULT 10,
  `current_value` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(50) NOT NULL DEFAULT 'people',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goal_progress`
--

CREATE TABLE `goal_progress` (
  `progress_id` bigint(20) UNSIGNED NOT NULL,
  `goal_id` bigint(20) UNSIGNED NOT NULL,
  `progress_date` date NOT NULL,
  `progress_value` int(11) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interactions`
--

CREATE TABLE `interactions` (
  `interaction_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED NOT NULL,
  `goal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `interaction_type` enum('meeting','call','email','message','coffee','event','introduction','note','other') NOT NULL DEFAULT 'other',
  `title` varchar(255) NOT NULL,
  `interaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `duration_minutes` int(11) DEFAULT 30,
  `summary` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `follow_up_required` tinyint(1) NOT NULL DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `sentiment` enum('positive','neutral','negative') DEFAULT 'positive',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `meeting_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `goal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `meeting_type` enum('coffee','video','office','conference','phone','other') NOT NULL DEFAULT 'video',
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `meeting_url` varchar(500) DEFAULT NULL,
  `agenda` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `note_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `meeting_id` bigint(20) UNSIGNED DEFAULT NULL,
  `goal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `task_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('follow_up_due','meeting_reminder','goal_deadline','task_due','ai_suggestion','connection_request','system') NOT NULL DEFAULT 'system',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `entity_type`, `entity_id`, `is_read`, `created_at`) VALUES
(1, 1, 'ai_suggestion', '⭐ New Strategic Match Found!', 'Abhishek Tiwari shares 4 networking goals & interests with you.', 'recommendation', 2, 0, '2026-09-28 06:01:08'),
(2, 9, 'ai_suggestion', '⭐ New Strategic Match Found!', 'Sanjeev Sarma shares 4 networking goals & interests with you.', 'recommendation', 1, 0, '2026-09-28 06:04:00'),
(3, 2, 'ai_suggestion', '⭐ New Strategic Match Found!', 'Abhishek Tiwari shares 4 networking goals & interests with you.', 'recommendation', 4, 0, '2026-09-28 06:28:49');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_accounts`
--

CREATE TABLE `oauth_accounts` (
  `oauth_account_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `provider_email` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `author_name` varchar(150) NOT NULL,
  `author_title` varchar(150) DEFAULT NULL,
  `author_avatar` varchar(500) DEFAULT NULL,
  `content` text NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `likes_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `user_id`, `author_name`, `author_title`, `author_avatar`, `content`, `tags`, `likes_count`, `created_at`) VALUES
(1, 1, 'Sanjeev Sarma', 'Passionate networker, stepping up to drive process and outcome to networking.', '/uploads/avatars/avatar-1-1790575407666.avif', 'Hello NexaLink Network! Excited to connect with leaders and peers. Active in BBB & BNI.', '[\"Networking\",\"Growth\"]', 0, '2026-09-28 06:01:09'),
(2, 9, 'Abhishek Tiwari', 'Employee at Osmos Multimedia Pvt Ltd', '/uploads/avatars/avatar-9-1790575226412.jpg', 'Hello NexaLink Network! Excited to connect with leaders and peers. Active in BBB & BNI & Lions.', '[\"Networking\",\"Growth\"]', 0, '2026-09-28 06:01:09');

-- --------------------------------------------------------

--
-- Table structure for table `recommendations`
--

CREATE TABLE `recommendations` (
  `recommendation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recommended_name` varchar(150) NOT NULL,
  `recommended_role` varchar(150) NOT NULL,
  `recommended_company` varchar(150) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `reason` text NOT NULL,
  `score` int(11) NOT NULL DEFAULT 85,
  `status` enum('pending','connected','saved','dismissed') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recommendations`
--

INSERT INTO `recommendations` (`recommendation_id`, `user_id`, `contact_id`, `recommended_name`, `recommended_role`, `recommended_company`, `avatar_url`, `industry`, `skills`, `reason`, `score`, `status`, `created_at`) VALUES
(1, 9, NULL, 'Sanjeev Sarma', 'Chief at The Networker', 'The Networker', '/uploads/avatars/avatar-1-1790575407666.avif', 'CA and CS', '[\"Politics\",\"Religion\",\"CA and CS\",\"Entrepreneurs\"]', '✓ ⭐ High Mutual Synergy Match\n✓ Shared membership in BBB & BNI\n✓ Shared focus on religion\n✓ Shared target industry focus (Founders)\n✓ Both located in Mumbai', 77, 'connected', '2026-09-28 06:01:08'),
(2, 1, NULL, 'Abhishek Tiwari', 'Employee at Osmos Multimedia Pvt Ltd', 'Osmos Multimedia Pvt Ltd', '/uploads/avatars/avatar-9-1790575226412.jpg', 'CA and CS', '[\"Politics\",\"Religion\",\"CA and CS\",\"Entrepreneurs\"]', '✓ Shared membership in BBB & BNI\n✓ Shared focus on Religion\n✓ Shared target industry focus (Founders)\n✓ Both located in Mumbai', 67, 'pending', '2026-09-28 06:01:08'),
(3, 9, NULL, 'Geeta Rathod', 'Building High-Performance Remote Teams & B2B SMB Hiring Pipelines', 'Zenith HR Solutions (SMB)', NULL, 'Connect with SMB founders hiring remote engineers', '[\"B2B SaaS Growth\",\"HR Tech Innovation\",\"Employee Retention\",\"Talent Analytics\"]', '✓ Shared target industry focus (Founders)\n✓ Offers services matching your target focus (\"help\")', 24, 'pending', '2026-09-28 06:28:49'),
(4, 2, NULL, 'Abhishek Tiwari', 'Employee at Osmos Multimedia Pvt Ltd', 'Osmos Multimedia Pvt Ltd', '/uploads/avatars/avatar-9-1790575226412.jpg', 'Connect with SMB founders hiring remote engineers', '[\"B2B SaaS Growth\",\"HR Tech Innovation\",\"Employee Retention\",\"Talent Analytics\"]', '✓ Shared target industry focus (Connect with SMB founders hiring remote engineers)\n✓ Offers services matching your target focus (\"software\")\n✓ Domain (Software) matches your target industry focus\n✓ Offers warm connection to Vinay Mishra (Software Engineer at Friend) in Software', 50, 'pending', '2026-09-28 06:28:49'),
(5, 9, NULL, 'Devyani', 'Crafting High-Converting UI/UX for B2B Apps & B2C Consumer Platforms', 'PixelCraft Studio (SME)', NULL, 'Build agency partnerships with B2B SaaS founders', '[\"Design System Architecture\",\"Micro-Interactions\",\"Mobile Accessibility\",\"Design-Driven Growth\"]', '✓ Shared target industry focus (Founders)\n✓ Offers services matching your target focus (\"app\")', 24, 'pending', '2026-09-28 06:28:49'),
(6, 5, NULL, 'Abhishek Tiwari', 'Employee at Osmos Multimedia Pvt Ltd', 'Osmos Multimedia Pvt Ltd', '/uploads/avatars/avatar-9-1790575226412.jpg', 'Build agency partnerships with B2B SaaS founders', '[\"Design System Architecture\",\"Micro-Interactions\",\"Mobile Accessibility\",\"Design-Driven Growth\"]', '✓ Shared target industry focus (Build agency partnerships with B2B SaaS founders)', 10, 'pending', '2026-09-28 06:28:49');

-- --------------------------------------------------------

--
-- Table structure for table `skipped_profiles`
--

CREATE TABLE `skipped_profiles` (
  `skip_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `skipped_user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `tag_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#2563EB',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`tag_id`, `user_id`, `name`, `color`, `created_at`) VALUES
(1, 1, '🔥 Hot', '#EF4444', '2026-09-22 10:39:44'),
(2, 1, '☀️ Warm', '#F59E0B', '2026-09-22 10:39:44'),
(3, 1, '❄️ Cold', '#3B82F6', '2026-09-22 10:39:44'),
(7, 9, '🔥 Hot', '#EF4444', '2026-09-23 10:58:26'),
(8, 9, '☀️ Warm', '#F59E0B', '2026-09-23 10:58:26'),
(9, 9, '❄️ Cold', '#3B82F6', '2026-09-23 10:58:26'),
(10, 9, 'Discovery', '#2563EB', '2026-09-28 06:06:49'),
(11, 9, 'Founders', '#2563EB', '2026-09-28 06:06:49');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contact_id` bigint(20) UNSIGNED DEFAULT NULL,
  `goal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `display_name` varchar(150) NOT NULL,
  `avatar_url` longtext DEFAULT NULL,
  `status` enum('active','inactive','blocked') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `display_name`, `avatar_url`, `status`, `created_at`, `updated_at`) VALUES
(1, 'sanjeev.sarma@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Sanjeev Sarma', '/uploads/avatars/avatar-1-1790575407666.avif', 'active', '2026-09-21 11:29:42', '2026-09-28 06:03:27'),
(2, 'geeta.rathod@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Geeta Rathod', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:14'),
(3, 'vinay.mishra@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Vinay Mishra', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:18'),
(4, 'abhinav.n@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Abhinav N', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:21'),
(5, 'devyani@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Devyani', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:25'),
(7, 'hitesh.mishra@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Hitesh Mishra', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:31'),
(8, 'mayur.tiwari@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Mayur Tiwari', NULL, 'active', '2026-09-21 11:29:42', '2026-09-22 05:38:34'),
(9, 'abhishek.tiwari@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Abhishek Tiwari', '/uploads/avatars/avatar-9-1790575226412.jpg', 'active', '2026-09-21 11:29:42', '2026-09-28 06:00:26');

-- --------------------------------------------------------

--
-- Table structure for table `user_match_scores`
--

CREATE TABLE `user_match_scores` (
  `match_score_id` bigint(20) UNSIGNED NOT NULL,
  `user_a_id` bigint(20) UNSIGNED NOT NULL,
  `user_b_id` bigint(20) UNSIGNED NOT NULL,
  `score` float NOT NULL DEFAULT 0,
  `reasons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reasons`)),
  `is_mutual` tinyint(1) NOT NULL DEFAULT 0,
  `computed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_match_scores`
--

INSERT INTO `user_match_scores` (`match_score_id`, `user_a_id`, `user_b_id`, `score`, `reasons`, `is_mutual`, `computed_at`, `updated_at`) VALUES
(1, 9, 1, 77, '[\"⭐ High Mutual Synergy Match\",\"Shared membership in BBB & BNI\",\"Shared focus on religion\",\"Shared target industry focus (Founders)\",\"Both located in Mumbai\"]', 1, '2026-09-28 06:01:08', '2026-09-28 06:28:49'),
(2, 1, 9, 67, '[\"Shared membership in BBB & BNI\",\"Shared focus on Religion\",\"Shared target industry focus (Founders)\",\"Both located in Mumbai\"]', 1, '2026-09-28 06:01:08', '2026-09-28 06:28:49'),
(11, 9, 2, 24, '[\"Shared target industry focus (Founders)\",\"Offers services matching your target focus (\\\"help\\\")\"]', 0, '2026-09-28 06:28:49', '2026-09-28 06:28:49'),
(12, 2, 9, 50, '[\"Shared target industry focus (Connect with SMB founders hiring remote engineers)\",\"Offers services matching your target focus (\\\"software\\\")\",\"Domain (Software) matches your target industry focus\",\"Offers warm connection to Vinay Mishra (Software Engineer at Friend) in Software\"]', 0, '2026-09-28 06:28:49', '2026-09-28 06:28:49'),
(13, 9, 5, 24, '[\"Shared target industry focus (Founders)\",\"Offers services matching your target focus (\\\"app\\\")\"]', 0, '2026-09-28 06:28:49', '2026-09-28 06:28:49'),
(14, 5, 9, 10, '[\"Shared target industry focus (Build agency partnerships with B2B SaaS founders)\"]', 0, '2026-09-28 06:28:49', '2026-09-28 06:28:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_personas`
--

CREATE TABLE `user_personas` (
  `persona_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `persona_name` varchar(100) NOT NULL DEFAULT 'Default Persona',
  `communication_style` varchar(100) DEFAULT 'Concise & Strategic',
  `preferred_people` text DEFAULT NULL,
  `networking_goal` text DEFAULT NULL,
  `interests` text DEFAULT NULL,
  `confidence` int(11) DEFAULT 85,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_personas`
--

INSERT INTO `user_personas` (`persona_id`, `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 'B2B SMB HR & Talent Leader', 'Empathetic, Structured & Solution-Oriented', 'SMB Founders, VP of Engineering, HR Directors, B2B SaaS Executives', 'Expand B2B talent consulting client base across growing SMBs and build strategic hiring alliances.', 'Remote Work Infrastructure, B2B Recruitment Automation, Organizational Culture', 90, 1, '2026-09-28 06:28:32', '2026-09-28 06:28:32'),
(2, 3, 'B2B SME Cloud & Technical Architect', 'Technical, Data-Driven & Precise', 'CTOs, VP of Engineering, DevOps Engineers, Enterprise IT Auditors', 'Connect with B2B SME executives needing cloud modernization, security audits, and infrastructure cost optimization.', 'Kubernetes Scaling, AWS Security Best Practices, FinOps & Infrastructure Management', 92, 1, '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(3, 4, 'B2C SMB E-Commerce Growth Specialist', 'Energetic, Metric-Driven & Creative', 'D2C Founders, E-Commerce Managers, Performance Marketers, Brand Agency Leads', 'Exchange B2C conversion tactics, evaluate customer acquisition tools, and form SMB retail partnerships.', 'Consumer Analytics, AI Personalization Engines, Viral Retention Loops', 88, 1, '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(4, 5, 'B2B/B2C Creative Product Design Leader', 'Collaborative, Visual & Insightful', 'Product Managers, SaaS Founders, Chief Marketing Officers, Mobile App Developers', 'Partner with B2B SaaS and B2C mobile apps needing end-to-end product design revamps and UI design systems.', 'User Psychology, Design-Led Growth, Interactive Prototyping', 95, 1, '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(5, 7, 'B2B SME Corporate Sales & Partnerships Lead', 'Direct, Negotiation-Oriented & Results-Focused', 'Procurement Directors, Supply Chain VPs, B2B Sales Executives, Logistics Managers', 'Secure strategic B2B supply chain contracts with growing SMEs and enterprise manufacturing clients.', 'B2B Sales Tactics, Freight Automation, High-Value Commercial Deals', 91, 1, '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(6, 8, 'B2C Fintech & SMB Merchant Growth Lead', 'Pragmatic, Process-Driven & Strategic', 'Retail Business Owners, Fintech Operations Leads, Compliance Officers, Payment Partners', 'Accelerate merchant acquisition across SMB retail sectors and build seamless digital payment operations.', 'Fintech Infrastructure, Merchant Retention, Payment Gateway Scaling', 89, 1, '2026-09-28 06:28:33', '2026-09-28 06:28:33');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `profile_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `job_title` varchar(150) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  `avatar_url` longtext DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `interests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`interests`)),
  `networking_goals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`networking_goals`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`profile_id`, `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`, `created_at`, `updated_at`) VALUES
(2, 1, 'Chief at The Networker', 'Passionate networker, stepping up to drive process and outcome to networking.', 'The Networker', 'Chief', NULL, 'PErsonal Branding', 'sanjeevsarma.com', 'linkedin.com/sanjeevsarma', '9820003103', 'UTC', '/uploads/avatars/avatar-1-1790575407666.avif', '{\"company\":\"The Networker\",\"role\":\"Chief\",\"domain\":\"PErsonal Branding\",\"servicesOffered\":\"Passionate networker, stepping up to drive process and outcome to networking.\",\"networkingGroup\":[\"BBB\",\"BNI\"],\"hobbies\":[\"Playing flute\",\"Online games\"],\"interests\":[\"Politics\",\"Religion\"],\"goals\":[\"To help people get their professional journey going using networking\"],\"networkingTargetPeriod\":\"week\",\"networkingNewConnections\":10,\"currentCity\":\"Mumbai\",\"targetCities\":[],\"socialLinks\":{\"linkedin\":\"linkedin.com/sanjeevsarma\",\"instagram\":\"\",\"website\":\"sanjeevsarma.com\"}}', '[{\"id\":\"conn-1790138152851-g55bf12cg\",\"businessDomain\":\"Reverberate LLP\",\"personName\":\"Purvang\",\"orgName\":\"Friend\",\"role\":\"Founder\",\"city\":\"Mumbai\",\"relationship\":\"Friend\"}]', '[\"CA and CS\",\"Entrepreneurs\",\"Founders\"]', '2026-09-22 07:12:22', '2026-09-28 06:04:00'),
(4, 9, 'Employee at Osmos Multimedia Pvt Ltd', 'A passionate AI Software Engineer who has great Vision to create something great remarkable feature in the AI World.', 'Osmos Multimedia Pvt Ltd', 'Employee', NULL, 'Software', 'https://mediumturquoise-dugong-405156.hostingersite.com/profile', 'https://mediumturquoise-dugong-405156.hostingersite.com/profile', '8454986145', 'UTC', '/uploads/avatars/avatar-9-1790575226412.jpg', '{\"company\":\"Osmos Multimedia Pvt Ltd\",\"role\":\"Employee\",\"domain\":\"Software\",\"servicesOffered\":\"A passionate AI Software Engineer who has great Vision to create something great remarkable feature in the AI World.\",\"networkingGroup\":[\"BBB\",\"BNI\",\"Lions\"],\"hobbies\":[\"Chess\",\"Religion\",\"Hip Hop\"],\"interests\":[\"religion\",\"Brahmin\",\"techy\"],\"goals\":[\"Help people to get there desire app\"],\"networkingTargetPeriod\":\"week\",\"networkingNewConnections\":10,\"currentCity\":\"Mumbai\",\"targetCities\":[],\"socialLinks\":{\"linkedin\":\"https://mediumturquoise-dugong-405156.hostingersite.com/profile\",\"instagram\":\"\",\"website\":\"https://mediumturquoise-dugong-405156.hostingersite.com/profile\"}}', '[{\"id\":\"conn-1790161070630-rggr1379k\",\"businessDomain\":\"Software\",\"personName\":\"Vinay Mishra\",\"orgName\":\"Friend\",\"role\":\"Software Engineer\",\"city\":\"Mumbai\",\"relationship\":\"Friend\"}]', '[\"Founders\"]', '2026-09-23 10:54:04', '2026-09-28 06:01:08'),
(5, 2, 'Building High-Performance Remote Teams & B2B SMB Hiring Pipelines', 'VP of People & Talent Solutions at Zenith HR. Passionate about helping growing SMB tech companies build remote engineering teams, optimize candidate pipelines, and design high-trust organizational cultures.', 'Zenith HR Solutions (SMB)', 'VP of People & Talent Acquisition', 'Bengaluru, India', 'B2B HR Tech & SMB Talent Services', 'https://zenithhr.example.com', 'https://linkedin.com/in/geeta-rathod-hr', '+91-9876543210', 'Asia/Kolkata', NULL, '[\"B2B Recruitment\", \"Talent Acquisition\", \"SMB Team Scaling\", \"HR Automation\", \"Remote Team Leadership\"]', '[\"B2B SaaS Growth\", \"HR Tech Innovation\", \"Employee Retention\", \"Talent Analytics\"]', '[\"Connect with SMB founders hiring remote engineers\", \"Partner with B2B HR tech software vendors\", \"Build mentor network for HR leaders\"]', '2026-09-28 06:28:32', '2026-09-28 06:28:32'),
(6, 3, 'Designing Resilient Multi-Cloud Systems & DevOps Pipelines for B2B SMEs', 'Principal Architect at CloudScale Systems. 12+ years in cloud infrastructure, microservices architecture, AWS/GCP migration, and enterprise security compliance for mid-sized business enterprises (SMEs).', 'CloudScale Systems (SME)', 'Principal Cloud Architect', 'Delhi NCR, India', 'B2B Cloud Infrastructure & SME Enterprise IT', 'https://cloudscalesystems.example.com', 'https://linkedin.com/in/vinay-mishra-cloud', '+91-9876543211', 'Asia/Kolkata', NULL, '[\"Cloud Architecture\", \"AWS & Kubernetes\", \"B2B SaaS Infrastructure\", \"DevOps Pipelines\", \"Cloud FinOps\"]', '[\"Serverless Microservices\", \"Cybersecurity Compliance\", \"Cloud Cost Optimization\", \"Infrastructure as Code\"]', '[\"Advise SME CTOs on cloud cost reduction\", \"Connect with B2B tech solution partners\", \"Explore enterprise multi-cloud tools\"]', '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(7, 4, 'Driving Retention, Customer LTV & AI Personalization for B2C Brands', 'Product & Growth Lead at UrbanLifestyle Goods. Specializing in D2C e-commerce growth strategies, customer lifecycle marketing, conversion funnel optimization, and AI-driven buyer personalization for SMB retailers.', 'UrbanLifestyle Goods (B2C SMB)', 'Growth & Product Lead', 'Hyderabad, India', 'B2C E-Commerce & Retail Tech', 'https://urbanlifestyle.example.com', 'https://linkedin.com/in/abhinav-n-growth', '+91-9876543212', 'Asia/Kolkata', NULL, '[\"B2C Marketing\", \"Funnel Optimization\", \"E-Commerce Growth\", \"Customer LTV\", \"Performance Ads\"]', '[\"D2C Brands\", \"Customer Behavior AI\", \"Omnichannel Retail\", \"Growth Hacking\"]', '[\"Discover B2C marketing automation tools\", \"Partner with shipping & payment gateways\", \"Connect with retail founders\"]', '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(8, 5, 'Crafting High-Converting UI/UX for B2B Apps & B2C Consumer Platforms', 'Founder & Creative Director at PixelCraft Studio. Leading a boutique design team empowering SMEs, B2B SaaS startups, and consumer mobile apps with user-centered interface design, UX research, and brand systems.', 'PixelCraft Studio (SME)', 'Founder & Creative Director', 'Pune, India', 'B2B & B2C Product Design Agency', 'https://pixelcraft.example.com', 'https://linkedin.com/in/devyani-design', '+91-9876543213', 'Asia/Kolkata', NULL, '[\"UI/UX Design\", \"B2C Mobile App UX\", \"Design Systems\", \"User Research\", \"Conversion UX\"]', '[\"Design System Architecture\", \"Micro-Interactions\", \"Mobile Accessibility\", \"Design-Driven Growth\"]', '[\"Build agency partnerships with B2B SaaS founders\", \"Find B2C product redesign projects\", \"Network with product leads\"]', '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(9, 7, 'Driving B2B Enterprise Alliances & SME Supply Chain Logistics', 'Head of Business Development at Apex Global Logistics. Focused on B2B enterprise deal structuring, key account management, supply chain optimization, and expanding partner logistics networks across domestic SME manufacturing hubs.', 'Apex Global Logistics (SME)', 'Head of Business Development', 'Gurugram, India', 'B2B Logistics & SME Supply Chain', 'https://apexlogistics.example.com', 'https://linkedin.com/in/hitesh-mishra-bd', '+91-9876543214', 'Asia/Kolkata', NULL, '[\"B2B Enterprise Sales\", \"Key Account Management\", \"Contract Negotiation\", \"SME Logistics\", \"Partner Alliances\"]', '[\"Supply Chain Technology\", \"Cross-Border Trade\", \"B2B Deal Structuring\", \"Sales Pipeline Automation\"]', '[\"Expand B2B enterprise client portfolio\", \"Form channel partnerships with freight software\", \"Connect with SME manufacturers\"]', '2026-09-28 06:28:33', '2026-09-28 06:28:33'),
(10, 8, 'Scaling Digital Payment Adoption for SMB Merchants & B2C Retailers', 'Head of Operations at PayQuick Solutions. Overseeing merchant onboarding, fraud risk mitigation, and operational workflow automation for a B2C payment gateway catering to local SMB retailers and digital storefronts.', 'PayQuick Solutions (SMB)', 'Head of Operations & Growth', 'Noida, India', 'B2C Fintech & SMB Payments', 'https://payquick.example.com', 'https://linkedin.com/in/mayur-tiwari-ops', '+91-9876543215', 'Asia/Kolkata', NULL, '[\"Merchant Operations\", \"SMB Payment Gateways\", \"B2C Fintech\", \"Fraud Risk Management\", \"Workflow Automation\"]', '[\"Financial Inclusion\", \"POS System Integration\", \"Digital Payment Innovations\", \"Operations Research\"]', '[\"Connect with SMB retail associations\", \"Partner with POS software developers\", \"Streamline merchant onboarding\"]', '2026-09-28 06:28:33', '2026-09-28 06:28:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_audit_user` (`user_id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`contact_id`),
  ADD KEY `idx_contacts_user` (`user_id`),
  ADD KEY `idx_contacts_followup` (`user_id`,`next_follow_up_at`),
  ADD KEY `idx_contacts_strength` (`user_id`,`relationship_strength`);

--
-- Indexes for table `contact_tags`
--
ALTER TABLE `contact_tags`
  ADD PRIMARY KEY (`contact_id`,`tag_id`),
  ADD KEY `fk_ct_tag` (`tag_id`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `idx_goals_user_status` (`user_id`,`status`);

--
-- Indexes for table `goal_progress`
--
ALTER TABLE `goal_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `idx_goal_progress_goal_date` (`goal_id`,`progress_date`);

--
-- Indexes for table `interactions`
--
ALTER TABLE `interactions`
  ADD PRIMARY KEY (`interaction_id`),
  ADD KEY `idx_interactions_contact_date` (`contact_id`,`interaction_date`),
  ADD KEY `idx_interactions_user_date` (`user_id`,`interaction_date`),
  ADD KEY `fk_interactions_goal` (`goal_id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`meeting_id`),
  ADD KEY `idx_meetings_user_start` (`user_id`,`start_at`),
  ADD KEY `fk_meetings_contact` (`contact_id`),
  ADD KEY `fk_meetings_goal` (`goal_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `idx_notes_user` (`user_id`),
  ADD KEY `fk_notes_contact` (`contact_id`),
  ADD KEY `fk_notes_meeting` (`meeting_id`),
  ADD KEY `fk_notes_goal` (`goal_id`),
  ADD KEY `fk_notes_task` (`task_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notif_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `oauth_accounts`
--
ALTER TABLE `oauth_accounts`
  ADD PRIMARY KEY (`oauth_account_id`),
  ADD UNIQUE KEY `uq_oauth_provider_user` (`provider`,`provider_user_id`),
  ADD KEY `idx_oauth_user` (`user_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `idx_posts_user` (`user_id`);

--
-- Indexes for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `idx_recom_user` (`user_id`,`status`),
  ADD KEY `fk_recom_contact` (`contact_id`);

--
-- Indexes for table `skipped_profiles`
--
ALTER TABLE `skipped_profiles`
  ADD PRIMARY KEY (`skip_id`),
  ADD UNIQUE KEY `uq_user_skipped_pair` (`user_id`,`skipped_user_id`),
  ADD KEY `idx_skipped_user` (`user_id`),
  ADD KEY `fk_skip_skipped` (`skipped_user_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `uq_user_tag` (`user_id`,`name`),
  ADD KEY `idx_tags_user` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `idx_tasks_user_status` (`user_id`,`status`),
  ADD KEY `idx_tasks_due_date` (`user_id`,`due_date`),
  ADD KEY `fk_tasks_contact` (`contact_id`),
  ADD KEY `fk_tasks_goal` (`goal_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Indexes for table `user_match_scores`
--
ALTER TABLE `user_match_scores`
  ADD PRIMARY KEY (`match_score_id`),
  ADD UNIQUE KEY `uq_user_match_pair` (`user_a_id`,`user_b_id`),
  ADD KEY `idx_user_a_score` (`user_a_id`,`score`),
  ADD KEY `fk_ums_user_b` (`user_b_id`);

--
-- Indexes for table `user_personas`
--
ALTER TABLE `user_personas`
  ADD PRIMARY KEY (`persona_id`),
  ADD KEY `idx_personas_user` (`user_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `contact_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `goal_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goal_progress`
--
ALTER TABLE `goal_progress`
  MODIFY `progress_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interactions`
--
ALTER TABLE `interactions`
  MODIFY `interaction_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `meeting_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `note_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `oauth_accounts`
--
ALTER TABLE `oauth_accounts`
  MODIFY `oauth_account_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `recommendations`
--
ALTER TABLE `recommendations`
  MODIFY `recommendation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `skipped_profiles`
--
ALTER TABLE `skipped_profiles`
  MODIFY `skip_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_match_scores`
--
ALTER TABLE `user_match_scores`
  MODIFY `match_score_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_personas`
--
ALTER TABLE `user_personas`
  MODIFY `persona_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `profile_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_tags`
--
ALTER TABLE `contact_tags`
  ADD CONSTRAINT `fk_ct_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ct_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE;

--
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `goal_progress`
--
ALTER TABLE `goal_progress`
  ADD CONSTRAINT `fk_gp_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE CASCADE;

--
-- Constraints for table `interactions`
--
ALTER TABLE `interactions`
  ADD CONSTRAINT `fk_interactions_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_interactions_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_interactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `fk_meetings_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_meetings_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_meetings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `fk_notes_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notes_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notes_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notes_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `oauth_accounts`
--
ALTER TABLE `oauth_accounts`
  ADD CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD CONSTRAINT `fk_recom_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_recom_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `skipped_profiles`
--
ALTER TABLE `skipped_profiles`
  ADD CONSTRAINT `fk_skip_skipped` FOREIGN KEY (`skipped_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_skip_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `fk_tags_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tasks_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_match_scores`
--
ALTER TABLE `user_match_scores`
  ADD CONSTRAINT `fk_ums_user_a` FOREIGN KEY (`user_a_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ums_user_b` FOREIGN KEY (`user_b_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_personas`
--
ALTER TABLE `user_personas`
  ADD CONSTRAINT `fk_personas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
