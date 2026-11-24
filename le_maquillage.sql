-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 24, 2026 at 03:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `le_maquillage`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `stylist_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `appointment_start` datetime NOT NULL,
  `appointment_end` datetime NOT NULL,
  `status` enum('Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery_photos`
--

CREATE TABLE `gallery_photos` (
  `photo_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `photo_type` enum('Before','After') NOT NULL,
  `photo_url` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hairstyles`
--

CREATE TABLE `hairstyles` (
  `hairstyle_id` int(11) NOT NULL,
  `hairstyle_name` varchar(150) NOT NULL,
  `recommended_face_shape` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `filter_asset_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hairstyle_recommendations`
--

CREATE TABLE `hairstyle_recommendations` (
  `recommendation_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `hairstyle_id` int(11) NOT NULL,
  `recommendation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `was_selected` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_products`
--

CREATE TABLE `inventory_products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `quantity_in_stock` int(11) NOT NULL DEFAULT 0,
  `reorder_level` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_products`
--

INSERT INTO `inventory_products` (`product_id`, `product_name`, `category`, `quantity_in_stock`, `reorder_level`, `unit_cost`) VALUES
(1, 'Moisture Shampoo', 'Shampoo', 20, 5, 180.00),
(2, 'Repair Conditioner', 'Conditioner', 18, 5, 200.00),
(3, 'Hair Color - Natural Black', 'Hair Color', 12, 4, 150.00),
(4, 'Hair Color - Chestnut Brown', 'Hair Color', 4, 4, 150.00),
(5, 'Developer 6%', 'Hair Color', 10, 3, 120.00),
(6, 'Keratin Treatment Solution', 'Treatment', 6, 2, 650.00),
(7, 'Styling Gel', 'Styling', 15, 5, 85.00),
(8, 'Hair Spray', 'Styling', 2, 4, 140.00),
(9, 'Scalp Treatment Ampoule', 'Treatment', 0, 3, 95.00);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `transaction_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `queue_id` int(11) DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `transaction_type` enum('Usage','Restock','Adjustment') NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('Cash','GCash','Card') NOT NULL,
  `payment_status` enum('Pending','Paid','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `queue_records`
--

CREATE TABLE `queue_records` (
  `queue_id` int(11) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `service_id` int(11) NOT NULL,
  `stylist_id` int(11) DEFAULT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `queue_number` int(11) NOT NULL,
  `estimated_wait_minutes` int(11) NOT NULL DEFAULT 0,
  `status` enum('Waiting','In Service','Completed','Cancelled') NOT NULL DEFAULT 'Waiting',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `sales_service_report`
-- (See below for the actual view)
--
CREATE TABLE `sales_service_report` (
`payment_id` int(11)
,`paid_at` datetime
,`appointment_id` int(11)
,`appointment_start` datetime
,`service_name` varchar(150)
,`category` varchar(100)
,`client_name` varchar(150)
,`amount` decimal(10,2)
,`payment_method` enum('Cash','GCash','Card')
,`payment_status` enum('Pending','Paid','Failed','Refunded')
);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_name`, `category`, `price`, `duration_minutes`) VALUES
(1, 'Haircut & Styling', 'Haircut', 350.00, 45),
(2, 'Full Hair Coloring', 'Coloring', 1800.00, 120),
(3, 'Keratin Hair Treatment', 'Treatment', 1500.00, 90),
(4, 'Basic Grooming', 'Grooming', 250.00, 30);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `role` enum('client','receptionist','stylist','admin') NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `face_shape` varchar(50) DEFAULT NULL,
  `hairstyle_preferences` text DEFAULT NULL,
  `work_start` time DEFAULT NULL,
  `work_end` time DEFAULT NULL,
  `break_start` time DEFAULT NULL,
  `break_end` time DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `role`, `phone`, `email`, `face_shape`, `hairstyle_preferences`, `work_start`, `work_end`, `break_start`, `break_end`, `is_active`) VALUES
(1, 'admin', '$2y$10$07Fsn7Hzzm7v.Vp5nSDeDO8Ki0BJgXtqg5hdfOldXi.No65mA6DxS', 'Salon Admin', 'admin', '0917-000-0001', 'admin@lemaquillage.test', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(2, 'reception', '$2y$10$QZvgXZ34MfKmF5gD75GR0egZDuN/YBpCFGRHuD8mcBtegZQMtwW2u', 'Front Desk', 'receptionist', '0917-000-0002', 'reception@lemaquillage.test', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(3, 'stylist', '$2y$10$4BES/Il2LZX5fllPT.lUUO3yyfLDQOt0Npgi16azyqit062uzOtYm', 'Lead Stylist', 'stylist', '0917-000-0003', 'stylist@lemaquillage.test', NULL, NULL, '09:00:00', '18:00:00', '12:00:00', '13:00:00', 1),
(4, 'client', '$2y$10$EOrgf0z1fD.Ah/GvA8WWTOvkJdzX4ALoijS3ULf9Krvtv5UmYMREu', 'Sample Client', 'client', '0917-000-0004', 'client@lemaquillage.test', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(5, 'inactive', '$2y$10$hVd7EA5Xoxr4N7S5fETX6eei.xq679yr3GZb6umn9sZ/Ir.qI3s8q', 'Inactive User', 'client', '0917-000-0005', 'inactive@lemaquillage.test', NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Structure for view `sales_service_report`
--
DROP TABLE IF EXISTS `sales_service_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `sales_service_report`  AS SELECT `p`.`payment_id` AS `payment_id`, `p`.`paid_at` AS `paid_at`, `a`.`appointment_id` AS `appointment_id`, `a`.`appointment_start` AS `appointment_start`, `s`.`service_name` AS `service_name`, `s`.`category` AS `category`, `u`.`full_name` AS `client_name`, `p`.`amount` AS `amount`, `p`.`payment_method` AS `payment_method`, `p`.`payment_status` AS `payment_status` FROM (((`payments` `p` join `appointments` `a` on(`a`.`appointment_id` = `p`.`appointment_id`)) join `services` `s` on(`s`.`service_id` = `a`.`service_id`)) join `users` `u` on(`u`.`user_id` = `a`.`client_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `fk_appt_service` (`service_id`),
  ADD KEY `idx_appt_stylist_time` (`stylist_id`,`appointment_start`),
  ADD KEY `idx_appt_client` (`client_id`);

--
-- Indexes for table `gallery_photos`
--
ALTER TABLE `gallery_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `fk_photo_client` (`client_id`);

--
-- Indexes for table `hairstyles`
--
ALTER TABLE `hairstyles`
  ADD PRIMARY KEY (`hairstyle_id`);

--
-- Indexes for table `hairstyle_recommendations`
--
ALTER TABLE `hairstyle_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `fk_rec_client` (`client_id`),
  ADD KEY `fk_rec_hairstyle` (`hairstyle_id`);

--
-- Indexes for table `inventory_products`
--
ALTER TABLE `inventory_products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `uq_product_name` (`product_name`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `fk_tx_appointment` (`appointment_id`),
  ADD KEY `fk_tx_queue` (`queue_id`),
  ADD KEY `fk_tx_user` (`recorded_by`),
  ADD KEY `idx_tx_product` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fk_pay_appointment` (`appointment_id`),
  ADD KEY `idx_pay_status` (`payment_status`);

--
-- Indexes for table `queue_records`
--
ALTER TABLE `queue_records`
  ADD PRIMARY KEY (`queue_id`),
  ADD KEY `fk_queue_service` (`service_id`),
  ADD KEY `fk_queue_stylist` (`stylist_id`),
  ADD KEY `fk_queue_appointment` (`appointment_id`),
  ADD KEY `idx_queue_status` (`status`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_username` (`username`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gallery_photos`
--
ALTER TABLE `gallery_photos`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hairstyles`
--
ALTER TABLE `hairstyles`
  MODIFY `hairstyle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hairstyle_recommendations`
--
ALTER TABLE `hairstyle_recommendations`
  MODIFY `recommendation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_products`
--
ALTER TABLE `inventory_products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `queue_records`
--
ALTER TABLE `queue_records`
  MODIFY `queue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appt_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_appt_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  ADD CONSTRAINT `fk_appt_stylist` FOREIGN KEY (`stylist_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `gallery_photos`
--
ALTER TABLE `gallery_photos`
  ADD CONSTRAINT `fk_photo_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `hairstyle_recommendations`
--
ALTER TABLE `hairstyle_recommendations`
  ADD CONSTRAINT `fk_rec_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_rec_hairstyle` FOREIGN KEY (`hairstyle_id`) REFERENCES `hairstyles` (`hairstyle_id`);

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `fk_tx_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tx_product` FOREIGN KEY (`product_id`) REFERENCES `inventory_products` (`product_id`),
  ADD CONSTRAINT `fk_tx_queue` FOREIGN KEY (`queue_id`) REFERENCES `queue_records` (`queue_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tx_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`);

--
-- Constraints for table `queue_records`
--
ALTER TABLE `queue_records`
  ADD CONSTRAINT `fk_queue_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_queue_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  ADD CONSTRAINT `fk_queue_stylist` FOREIGN KEY (`stylist_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
