-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:55000
-- Generation Time: Jan 22, 2026 at 06:05 PM
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
-- Database: `lendora_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `crowdfunding_contributions`
--

CREATE TABLE `crowdfunding_contributions` (
  `contrib_id` int(11) NOT NULL,
  `contributor_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `contrib_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `crowdfunding_contributions`
--
DELIMITER $$
CREATE TRIGGER `trg_update_post_status_on_funding` AFTER INSERT ON `crowdfunding_contributions` FOR EACH ROW BEGIN
    DECLARE total_raised DECIMAL(10, 2);
    DECLARE post_amount DECIMAL(10, 2);
    
    SELECT COALESCE(SUM(amount), 0), (SELECT amount_needed FROM crowdfunding_posts WHERE post_id = NEW.post_id)
    INTO total_raised, post_amount
    FROM crowdfunding_contributions
    WHERE post_id = NEW.post_id AND payment_status = 'completed';
    
    IF total_raised >= post_amount AND (SELECT status FROM crowdfunding_posts WHERE post_id = NEW.post_id) = 'open' THEN
        UPDATE crowdfunding_posts 
        SET status = 'funded' 
        WHERE post_id = NEW.post_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `crowdfunding_documents`
--

CREATE TABLE `crowdfunding_documents` (
  `doc_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `doc_type` enum('student_id','nid','bill','proof','medical','other') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL CHECK (`file_size` >= 0),
  `mime_type` varchar(100) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crowdfunding_posts`
--

CREATE TABLE `crowdfunding_posts` (
  `post_id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `custom_category` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `num_people` int(11) DEFAULT NULL CHECK (`num_people` is null or `num_people` >= 0),
  `age_group` varchar(50) DEFAULT NULL,
  `amount_needed` decimal(10,2) NOT NULL CHECK (`amount_needed` > 0),
  `action_plan` text DEFAULT NULL,
  `share_receipts` enum('yes','no') DEFAULT 'yes',
  `extra_funds_handling` text DEFAULT NULL,
  `status` enum('pending','approved','open','closed','funded','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crowdfunding_ratings`
--

CREATE TABLE `crowdfunding_ratings` (
  `rating_id` int(11) NOT NULL,
  `rater_id` int(11) NOT NULL,
  `ratee_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `score` int(11) NOT NULL CHECK (`score` between 1 and 5),
  `review` text DEFAULT NULL,
  `rated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `funding_purposes`
--

CREATE TABLE `funding_purposes` (
  `purpose_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `purpose_type` varchar(50) NOT NULL,
  `custom_purpose` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fund_breakdown_items`
--

CREATE TABLE `fund_breakdown_items` (
  `breakdown_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` > 0),
  `cost_per_unit` decimal(10,2) NOT NULL CHECK (`cost_per_unit` >= 0),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_contributions`
--

CREATE TABLE `loan_contributions` (
  `contrib_id` int(11) NOT NULL,
  `contributor_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `contrib_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `loan_contributions`
--
DELIMITER $$
CREATE TRIGGER `trg_update_loan_status_on_funding` AFTER INSERT ON `loan_contributions` FOR EACH ROW BEGIN
    DECLARE total_funded DECIMAL(10, 2);
    DECLARE loan_amount DECIMAL(10, 2);
    
    SELECT COALESCE(SUM(amount), 0), (SELECT amount FROM loan_requests WHERE loan_id = NEW.loan_id)
    INTO total_funded, loan_amount
    FROM loan_contributions
    WHERE loan_id = NEW.loan_id AND payment_status = 'completed';
    
    IF total_funded >= loan_amount AND (SELECT status FROM loan_requests WHERE loan_id = NEW.loan_id) = 'approved' THEN
        UPDATE loan_requests 
        SET status = 'funded' 
        WHERE loan_id = NEW.loan_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `loan_documents`
--

CREATE TABLE `loan_documents` (
  `doc_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `doc_type` enum('student_id','nid','bill','proof','medical','other') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL CHECK (`file_size` >= 0),
  `mime_type` varchar(100) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_offers`
--

CREATE TABLE `loan_offers` (
  `offer_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `lender_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `interest_rate` decimal(5,2) DEFAULT NULL CHECK (`interest_rate` is null or `interest_rate` >= 0),
  `terms` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_ratings`
--

CREATE TABLE `loan_ratings` (
  `rating_id` int(11) NOT NULL,
  `rater_id` int(11) NOT NULL,
  `ratee_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `score` int(11) NOT NULL CHECK (`score` between 1 and 5),
  `review` text DEFAULT NULL,
  `rated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_requests`
--

CREATE TABLE `loan_requests` (
  `loan_id` int(11) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `custom_category` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `duration_months` int(11) DEFAULT NULL CHECK (`duration_months` is null or `duration_months` > 0),
  `custom_duration` varchar(50) DEFAULT NULL,
  `repayment_option` enum('installments','onetime') DEFAULT 'installments',
  `reason` text NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT 0.00 CHECK (`interest_rate` >= 0),
  `status` enum('pending','approved','funded','active','repaid','defaulted','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('loan_offer','loan_accepted','contribution','approval','rejection','repayment','rating','system') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `repayments`
--

CREATE TABLE `repayments` (
  `repay_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `repayment_number` int(11) DEFAULT NULL CHECK (`repayment_number` > 0),
  `due_date` date DEFAULT NULL,
  `repay_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','paid','overdue','partial') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `university` varchar(100) DEFAULT NULL,
  `nid_number` varchar(50) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `role` enum('student','admin','lender') DEFAULT 'student',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `student_id`, `university`, `nid_number`, `verification_status`, `role`, `profile_image`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@lendora.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', NULL, NULL, NULL, NULL, 'verified', 'admin', NULL, '2026-01-22 10:49:09', '2026-01-22 10:49:09');

-- --------------------------------------------------------

--
-- Table structure for table `user_documents`
--

CREATE TABLE `user_documents` (
  `doc_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `doc_type` enum('student_id','nid','bill','proof','medical','other') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL CHECK (`file_size` >= 0),
  `mime_type` varchar(100) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_crowdfunding_posts`
-- (See below for the actual view)
--
CREATE TABLE `vw_crowdfunding_posts` (
`post_id` int(11)
,`creator_id` int(11)
,`category` varchar(50)
,`custom_category` varchar(100)
,`title` varchar(255)
,`summary` text
,`location` varchar(255)
,`num_people` int(11)
,`age_group` varchar(50)
,`amount_needed` decimal(10,2)
,`action_plan` text
,`share_receipts` enum('yes','no')
,`extra_funds_handling` text
,`status` enum('pending','approved','open','closed','funded','rejected')
,`approved_by` int(11)
,`approval_date` timestamp
,`created_at` timestamp
,`updated_at` timestamp
,`creator_name` varchar(100)
,`creator_email` varchar(100)
,`creator_verified` enum('pending','verified','rejected')
,`amount_raised` decimal(32,2)
,`is_fully_funded` int(1)
,`funding_percentage` decimal(38,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_fund_breakdown_items`
-- (See below for the actual view)
--
CREATE TABLE `vw_fund_breakdown_items` (
`breakdown_id` int(11)
,`post_id` int(11)
,`item_name` varchar(255)
,`quantity` int(11)
,`cost_per_unit` decimal(10,2)
,`total_cost` decimal(20,2)
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_loan_requests`
-- (See below for the actual view)
--
CREATE TABLE `vw_loan_requests` (
`loan_id` int(11)
,`borrower_id` int(11)
,`category` varchar(50)
,`custom_category` varchar(100)
,`amount` decimal(10,2)
,`duration_months` int(11)
,`custom_duration` varchar(50)
,`repayment_option` enum('installments','onetime')
,`reason` text
,`interest_rate` decimal(5,2)
,`status` enum('pending','approved','funded','active','repaid','defaulted','rejected')
,`approved_by` int(11)
,`approval_date` timestamp
,`created_at` timestamp
,`updated_at` timestamp
,`borrower_name` varchar(100)
,`borrower_email` varchar(100)
,`borrower_verified` enum('pending','verified','rejected')
,`amount_funded` decimal(32,2)
,`is_fully_funded` int(1)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_crowdfunding_posts`
--
DROP TABLE IF EXISTS `vw_crowdfunding_posts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_crowdfunding_posts`  AS SELECT `cp`.`post_id` AS `post_id`, `cp`.`creator_id` AS `creator_id`, `cp`.`category` AS `category`, `cp`.`custom_category` AS `custom_category`, `cp`.`title` AS `title`, `cp`.`summary` AS `summary`, `cp`.`location` AS `location`, `cp`.`num_people` AS `num_people`, `cp`.`age_group` AS `age_group`, `cp`.`amount_needed` AS `amount_needed`, `cp`.`action_plan` AS `action_plan`, `cp`.`share_receipts` AS `share_receipts`, `cp`.`extra_funds_handling` AS `extra_funds_handling`, `cp`.`status` AS `status`, `cp`.`approved_by` AS `approved_by`, `cp`.`approval_date` AS `approval_date`, `cp`.`created_at` AS `created_at`, `cp`.`updated_at` AS `updated_at`, `u`.`full_name` AS `creator_name`, `u`.`email` AS `creator_email`, `u`.`verification_status` AS `creator_verified`, coalesce(sum(`cc`.`amount`),0) AS `amount_raised`, CASE WHEN coalesce(sum(`cc`.`amount`),0) >= `cp`.`amount_needed` THEN 1 ELSE 0 END AS `is_fully_funded`, CASE WHEN `cp`.`amount_needed` > 0 THEN round(coalesce(sum(`cc`.`amount`),0) / `cp`.`amount_needed` * 100,2) ELSE 0 END AS `funding_percentage` FROM ((`crowdfunding_posts` `cp` join `users` `u` on(`cp`.`creator_id` = `u`.`user_id`)) left join `crowdfunding_contributions` `cc` on(`cp`.`post_id` = `cc`.`post_id` and `cc`.`payment_status` = 'completed')) GROUP BY `cp`.`post_id` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_fund_breakdown_items`
--
DROP TABLE IF EXISTS `vw_fund_breakdown_items`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_fund_breakdown_items`  AS SELECT `fund_breakdown_items`.`breakdown_id` AS `breakdown_id`, `fund_breakdown_items`.`post_id` AS `post_id`, `fund_breakdown_items`.`item_name` AS `item_name`, `fund_breakdown_items`.`quantity` AS `quantity`, `fund_breakdown_items`.`cost_per_unit` AS `cost_per_unit`, `fund_breakdown_items`.`quantity`* `fund_breakdown_items`.`cost_per_unit` AS `total_cost`, `fund_breakdown_items`.`created_at` AS `created_at` FROM `fund_breakdown_items` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_loan_requests`
--
DROP TABLE IF EXISTS `vw_loan_requests`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_loan_requests`  AS SELECT `lr`.`loan_id` AS `loan_id`, `lr`.`borrower_id` AS `borrower_id`, `lr`.`category` AS `category`, `lr`.`custom_category` AS `custom_category`, `lr`.`amount` AS `amount`, `lr`.`duration_months` AS `duration_months`, `lr`.`custom_duration` AS `custom_duration`, `lr`.`repayment_option` AS `repayment_option`, `lr`.`reason` AS `reason`, `lr`.`interest_rate` AS `interest_rate`, `lr`.`status` AS `status`, `lr`.`approved_by` AS `approved_by`, `lr`.`approval_date` AS `approval_date`, `lr`.`created_at` AS `created_at`, `lr`.`updated_at` AS `updated_at`, `u`.`full_name` AS `borrower_name`, `u`.`email` AS `borrower_email`, `u`.`verification_status` AS `borrower_verified`, coalesce(sum(`lc`.`amount`),0) AS `amount_funded`, CASE WHEN coalesce(sum(`lc`.`amount`),0) >= `lr`.`amount` THEN 1 ELSE 0 END AS `is_fully_funded` FROM ((`loan_requests` `lr` join `users` `u` on(`lr`.`borrower_id` = `u`.`user_id`)) left join `loan_contributions` `lc` on(`lr`.`loan_id` = `lc`.`loan_id` and `lc`.`payment_status` = 'completed')) GROUP BY `lr`.`loan_id` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `crowdfunding_contributions`
--
ALTER TABLE `crowdfunding_contributions`
  ADD PRIMARY KEY (`contrib_id`),
  ADD KEY `idx_contributor` (`contributor_id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_status` (`payment_status`),
  ADD KEY `idx_contrib_date` (`contrib_date`);

--
-- Indexes for table `crowdfunding_documents`
--
ALTER TABLE `crowdfunding_documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_doc_type` (`doc_type`),
  ADD KEY `idx_verified` (`verified`);

--
-- Indexes for table `crowdfunding_posts`
--
ALTER TABLE `crowdfunding_posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `idx_creator` (`creator_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_approved_by` (`approved_by`);

--
-- Indexes for table `crowdfunding_ratings`
--
ALTER TABLE `crowdfunding_ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `unique_post_rating` (`post_id`,`rater_id`),
  ADD KEY `idx_rater` (`rater_id`),
  ADD KEY `idx_ratee` (`ratee_id`),
  ADD KEY `idx_post` (`post_id`);

--
-- Indexes for table `funding_purposes`
--
ALTER TABLE `funding_purposes`
  ADD PRIMARY KEY (`purpose_id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_purpose_type` (`purpose_type`);

--
-- Indexes for table `fund_breakdown_items`
--
ALTER TABLE `fund_breakdown_items`
  ADD PRIMARY KEY (`breakdown_id`),
  ADD UNIQUE KEY `unique_item_post` (`post_id`,`item_name`),
  ADD KEY `idx_post` (`post_id`);

--
-- Indexes for table `loan_contributions`
--
ALTER TABLE `loan_contributions`
  ADD PRIMARY KEY (`contrib_id`),
  ADD KEY `idx_contributor` (`contributor_id`),
  ADD KEY `idx_loan` (`loan_id`),
  ADD KEY `idx_status` (`payment_status`),
  ADD KEY `idx_contrib_date` (`contrib_date`);

--
-- Indexes for table `loan_documents`
--
ALTER TABLE `loan_documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `idx_loan` (`loan_id`),
  ADD KEY `idx_doc_type` (`doc_type`),
  ADD KEY `idx_verified` (`verified`);

--
-- Indexes for table `loan_offers`
--
ALTER TABLE `loan_offers`
  ADD PRIMARY KEY (`offer_id`),
  ADD UNIQUE KEY `unique_lender_loan` (`loan_id`,`lender_id`),
  ADD KEY `idx_loan` (`loan_id`),
  ADD KEY `idx_lender` (`lender_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `loan_ratings`
--
ALTER TABLE `loan_ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `unique_loan_rating` (`loan_id`,`rater_id`),
  ADD KEY `idx_rater` (`rater_id`),
  ADD KEY `idx_ratee` (`ratee_id`),
  ADD KEY `idx_loan` (`loan_id`);

--
-- Indexes for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `idx_borrower` (`borrower_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_approved_by` (`approved_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `repayments`
--
ALTER TABLE `repayments`
  ADD PRIMARY KEY (`repay_id`),
  ADD KEY `idx_loan` (`loan_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_repay_date` (`repay_date`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_last_activity` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_verification` (`verification_status`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`doc_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_doc_type` (`doc_type`),
  ADD KEY `idx_verified` (`verified`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crowdfunding_contributions`
--
ALTER TABLE `crowdfunding_contributions`
  MODIFY `contrib_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crowdfunding_documents`
--
ALTER TABLE `crowdfunding_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crowdfunding_posts`
--
ALTER TABLE `crowdfunding_posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crowdfunding_ratings`
--
ALTER TABLE `crowdfunding_ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `funding_purposes`
--
ALTER TABLE `funding_purposes`
  MODIFY `purpose_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fund_breakdown_items`
--
ALTER TABLE `fund_breakdown_items`
  MODIFY `breakdown_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_contributions`
--
ALTER TABLE `loan_contributions`
  MODIFY `contrib_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_documents`
--
ALTER TABLE `loan_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_offers`
--
ALTER TABLE `loan_offers`
  MODIFY `offer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_ratings`
--
ALTER TABLE `loan_ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_requests`
--
ALTER TABLE `loan_requests`
  MODIFY `loan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `repayments`
--
ALTER TABLE `repayments`
  MODIFY `repay_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `crowdfunding_contributions`
--
ALTER TABLE `crowdfunding_contributions`
  ADD CONSTRAINT `crowdfunding_contributions_ibfk_1` FOREIGN KEY (`contributor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `crowdfunding_contributions_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `crowdfunding_documents`
--
ALTER TABLE `crowdfunding_documents`
  ADD CONSTRAINT `crowdfunding_documents_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `crowdfunding_posts`
--
ALTER TABLE `crowdfunding_posts`
  ADD CONSTRAINT `crowdfunding_posts_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `crowdfunding_posts_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `crowdfunding_ratings`
--
ALTER TABLE `crowdfunding_ratings`
  ADD CONSTRAINT `crowdfunding_ratings_ibfk_1` FOREIGN KEY (`rater_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `crowdfunding_ratings_ibfk_2` FOREIGN KEY (`ratee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `crowdfunding_ratings_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `funding_purposes`
--
ALTER TABLE `funding_purposes`
  ADD CONSTRAINT `funding_purposes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `fund_breakdown_items`
--
ALTER TABLE `fund_breakdown_items`
  ADD CONSTRAINT `fund_breakdown_items_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_contributions`
--
ALTER TABLE `loan_contributions`
  ADD CONSTRAINT `loan_contributions_ibfk_1` FOREIGN KEY (`contributor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_contributions_ibfk_2` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_documents`
--
ALTER TABLE `loan_documents`
  ADD CONSTRAINT `loan_documents_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_offers`
--
ALTER TABLE `loan_offers`
  ADD CONSTRAINT `loan_offers_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_offers_ibfk_2` FOREIGN KEY (`lender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_ratings`
--
ALTER TABLE `loan_ratings`
  ADD CONSTRAINT `loan_ratings_ibfk_1` FOREIGN KEY (`rater_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_ratings_ibfk_2` FOREIGN KEY (`ratee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_ratings_ibfk_3` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD CONSTRAINT `loan_requests_ibfk_1` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `crowdfunding_posts` (`post_id`) ON DELETE SET NULL;

--
-- Constraints for table `repayments`
--
ALTER TABLE `repayments`
  ADD CONSTRAINT `repayments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan_requests` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
