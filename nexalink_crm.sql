-- ====================================================================
-- NexaLink CRM — Complete Database Schema & Seed Data
-- Target Database: MySQL 8.0+ / MariaDB 10.4+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Database Initialization (Commented out for shared hosting / phpMyAdmin compatibility)
-- --------------------------------------------------------
-- CREATE DATABASE IF NOT EXISTS `nexalink_crm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `nexalink_crm`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `recommendations`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `meetings`;
DROP TABLE IF EXISTS `interactions`;
DROP TABLE IF EXISTS `goal_progress`;
DROP TABLE IF EXISTS `goals`;
DROP TABLE IF EXISTS `contact_tags`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `user_personas`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `oauth_accounts`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `display_name` VARCHAR(150) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `status` ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `oauth_accounts`
-- --------------------------------------------------------
CREATE TABLE `oauth_accounts` (
  `oauth_account_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `provider` VARCHAR(50) NOT NULL,
  `provider_user_id` VARCHAR(255) NOT NULL,
  `provider_email` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_oauth_provider_user` (`provider`, `provider_user_id`),
  KEY `idx_oauth_user` (`user_id`),
  CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `user_profiles`
-- --------------------------------------------------------
CREATE TABLE `user_profiles` (
  `profile_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `headline` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `company` VARCHAR(150) NULL,
  `job_title` VARCHAR(150) NULL,
  `location` VARCHAR(150) NULL,
  `industry` VARCHAR(100) NULL,
  `website` VARCHAR(255) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `timezone` VARCHAR(50) DEFAULT 'UTC',
  `avatar_url` VARCHAR(500) NULL,
  `skills` JSON NULL,
  `interests` JSON NULL,
  `networking_goals` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_profile_user` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `user_personas`
-- --------------------------------------------------------
CREATE TABLE `user_personas` (
  `persona_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `persona_name` VARCHAR(100) NOT NULL DEFAULT 'Default Persona',
  `communication_style` VARCHAR(100) DEFAULT 'Concise & Strategic',
  `preferred_people` TEXT NULL,
  `networking_goal` TEXT NULL,
  `interests` TEXT NULL,
  `confidence` INT DEFAULT 85,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_personas_user` (`user_id`),
  CONSTRAINT `fk_personas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `contacts`
-- --------------------------------------------------------
CREATE TABLE `contacts` (
  `contact_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `company` VARCHAR(150) NULL,
  `job_title` VARCHAR(150) NULL,
  `location` VARCHAR(150) NULL,
  `website` VARCHAR(255) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `avatar_url` VARCHAR(500) NULL,
  `relationship_type` ENUM('friend','mentor','mentee','colleague','client','prospect','founder','investor','recruiter','partner','other') NOT NULL DEFAULT 'other',
  `relationship_strength` INT NOT NULL DEFAULT 50,
  `last_interaction_at` DATETIME NULL,
  `next_follow_up_at` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_contacts_user` (`user_id`),
  KEY `idx_contacts_followup` (`user_id`, `next_follow_up_at`),
  KEY `idx_contacts_strength` (`user_id`, `relationship_strength`),
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `tags`
-- --------------------------------------------------------
CREATE TABLE `tags` (
  `tag_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `color` VARCHAR(20) DEFAULT '#2563EB',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_tag` (`user_id`, `name`),
  KEY `idx_tags_user` (`user_id`),
  CONSTRAINT `fk_tags_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `contact_tags`
-- --------------------------------------------------------
CREATE TABLE `contact_tags` (
  `contact_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contact_id`, `tag_id`),
  CONSTRAINT `fk_ct_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ct_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `goals`
-- --------------------------------------------------------
CREATE TABLE `goals` (
  `goal_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `goal_type` VARCHAR(100) NOT NULL DEFAULT 'connections',
  `target_value` INT NOT NULL DEFAULT 10,
  `current_value` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'people',
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `status` ENUM('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_goals_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `goal_progress`
-- --------------------------------------------------------
CREATE TABLE `goal_progress` (
  `progress_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `goal_id` BIGINT UNSIGNED NOT NULL,
  `progress_date` DATE NOT NULL,
  `progress_value` INT NOT NULL DEFAULT 1,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_goal_progress_goal_date` (`goal_id`, `progress_date`),
  CONSTRAINT `fk_gp_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `interactions`
-- --------------------------------------------------------
CREATE TABLE `interactions` (
  `interaction_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contact_id` BIGINT UNSIGNED NOT NULL,
  `goal_id` BIGINT UNSIGNED NULL,
  `interaction_type` ENUM('meeting','call','email','message','coffee','event','introduction','note','other') NOT NULL DEFAULT 'other',
  `title` VARCHAR(255) NOT NULL,
  `interaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration_minutes` INT DEFAULT 30,
  `summary` TEXT NULL,
  `outcome` TEXT NULL,
  `follow_up_required` TINYINT(1) NOT NULL DEFAULT 0,
  `follow_up_date` DATE NULL,
  `sentiment` ENUM('positive','neutral','negative') DEFAULT 'positive',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_interactions_contact_date` (`contact_id`, `interaction_date`),
  KEY `idx_interactions_user_date` (`user_id`, `interaction_date`),
  CONSTRAINT `fk_interactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interactions_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interactions_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `meetings`
-- --------------------------------------------------------
CREATE TABLE `meetings` (
  `meeting_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contact_id` BIGINT UNSIGNED NULL,
  `goal_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `meeting_type` ENUM('coffee','video','office','conference','phone','other') NOT NULL DEFAULT 'video',
  `start_at` DATETIME NOT NULL,
  `end_at` DATETIME NOT NULL,
  `location` VARCHAR(255) NULL,
  `meeting_url` VARCHAR(500) NULL,
  `agenda` TEXT NULL,
  `outcome` TEXT NULL,
  `notes` TEXT NULL,
  `follow_up_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_meetings_user_start` (`user_id`, `start_at`),
  CONSTRAINT `fk_meetings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meetings_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_meetings_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `tasks`
-- --------------------------------------------------------
CREATE TABLE `tasks` (
  `task_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contact_id` BIGINT UNSIGNED NULL,
  `goal_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
  `priority` ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `due_date` DATE NULL,
  `completed_at` DATETIME NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_tasks_user_status` (`user_id`, `status`),
  KEY `idx_tasks_due_date` (`user_id`, `due_date`),
  CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notes`
-- --------------------------------------------------------
CREATE TABLE `notes` (
  `note_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contact_id` BIGINT UNSIGNED NULL,
  `meeting_id` BIGINT UNSIGNED NULL,
  `goal_id` BIGINT UNSIGNED NULL,
  `task_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_notes_user` (`user_id`),
  CONSTRAINT `fk_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notes_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notes_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `recommendations`
-- --------------------------------------------------------
CREATE TABLE `recommendations` (
  `recommendation_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contact_id` BIGINT UNSIGNED NULL,
  `recommended_name` VARCHAR(150) NOT NULL,
  `recommended_role` VARCHAR(150) NOT NULL,
  `recommended_company` VARCHAR(150) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `industry` VARCHAR(100) NULL,
  `skills` JSON NULL,
  `reason` TEXT NOT NULL,
  `score` INT NOT NULL DEFAULT 85,
  `status` ENUM('pending','connected','saved','dismissed') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_recom_user` (`user_id`, `status`),
  CONSTRAINT `fk_recom_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recom_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`contact_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `posts`
-- --------------------------------------------------------
CREATE TABLE `posts` (
  `post_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `author_title` VARCHAR(150) NULL,
  `author_avatar` VARCHAR(500) NULL,
  `content` TEXT NOT NULL,
  `tags` JSON NULL,
  `likes_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_posts_user` (`user_id`),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notifications`
-- --------------------------------------------------------
CREATE TABLE `notifications` (
  `notification_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('follow_up_due','meeting_reminder','goal_deadline','task_due','ai_suggestion','connection_request','system') NOT NULL DEFAULT 'system',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_notif_user_read` (`user_id`, `is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
-- --------------------------------------------------------
CREATE TABLE `audit_logs` (
  `audit_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `metadata` JSON NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SEED DATA
-- ========================================================

-- 1. Demo User (Password: password123)
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `display_name`, `avatar_url`, `status`) VALUES
(1, 'demo@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Rahul Mehta', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'active');

-- 2. User Profile
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`) VALUES
(1, 1, 'Lead AI Engineer & Startup Advisor | Building the Future of SaaS', 'Passionate about distributed systems, autonomous agents, and relationship intelligence. Always open to high-signal conversations with builders and investors.', 'NexaLabs / Google Fellow', 'Staff Software Engineer', 'San Francisco, CA', 'Artificial Intelligence / SaaS', 'https://rahulmehta.dev', 'https://linkedin.com/in/rahulmehta-demo', '+1 (415) 555-0192', 'America/Los_Angeles', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '[\"React\", \"Node.js\", \"TypeScript\", \"MySQL\", \"LLMs\", \"System Architecture\", \"SaaS Growth\"]', '[\"Generative AI\", \"Startups\", \"Developer Tools\", \"Angel Investing\", \"Product Design\"]', '[\"Connect with 20 AI Founders\", \"Find 3 Enterprise Mentors\", \"Host monthly Bay Area Tech Coffee\"]');

-- 3. User Persona
INSERT INTO `user_personas` (`persona_id`, `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`) VALUES
(1, 1, 'Strategic Tech Leader & Angel Investor', 'Concise, high-signal, authentic and collaborative', 'AI Founders, CTOs, Seed/Series A VCs, Product Design Leaders', 'Build long-term strategic relationships with founders and domain experts', 'AI Infrastructure, Agentic Workflows, SaaS Unit Economics, Developer Experience', 92, 1);

-- 4. Tags
INSERT INTO `tags` (`tag_id`, `user_id`, `name`, `color`) VALUES
(1, 1, 'AI Founder', '#8B5CF6'),
(2, 1, 'High Priority', '#EF4444'),
(3, 1, 'Investor / VC', '#10B981'),
(4, 1, 'Mentor', '#F59E0B'),
(5, 1, 'Tech Lead', '#3B82F6'),
(6, 1, 'Client Prospect', '#EC4899'),
(7, 1, 'Conference Met', '#06B6D4'),
(8, 1, 'Follow-up Due', '#F97316');

-- 5. Contacts
INSERT INTO `contacts` (`contact_id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `company`, `job_title`, `location`, `website`, `linkedin_url`, `avatar_url`, `relationship_type`, `relationship_strength`, `last_interaction_at`, `next_follow_up_at`, `notes`) VALUES
(1, 1, 'Priya', 'Sharma', 'priya.sharma@google.com', '+1 (415) 555-2341', 'Google', 'Director of Product, AI Ecosystems', 'Mountain View, CA', NULL, 'https://linkedin.com/in/priya-sharma-demo', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'mentor', 88, '2026-09-14 11:30:00', '2026-09-22 10:00:00', 'Priya gave incredible advice on agentic API design. Discussed potential collaboration on open standards.'),
(2, 1, 'Amit', 'Patel', 'amit@synthai.tech', '+1 (650) 555-8912', 'SynthAI', 'Co-Founder & CEO', 'San Francisco, CA', NULL, 'https://linkedin.com/in/amit-patel-synthai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'founder', 78, '2026-09-12 15:00:00', '2026-09-19 14:00:00', 'Building multimodal agents for enterprise workflows. Currently raising $4M Seed round.'),
(3, 1, 'Neha', 'Verma', 'neha@horizonvc.io', '+1 (415) 555-7734', 'Horizon Capital', 'General Partner', 'San Francisco, CA', NULL, 'https://linkedin.com/in/neha-verma-vc', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'investor', 82, '2026-09-10 16:30:00', '2026-09-25 09:30:00', 'Active early-stage investor in developer tools and AI infrastructure. Wants introduction to Amit Patel.'),
(4, 1, 'Vikram', 'Singh', 'vikram@scaleops.dev', '+1 (408) 555-3211', 'ScaleOps Systems', 'VP of Engineering', 'San Jose, CA', NULL, 'https://linkedin.com/in/vikram-singh-eng', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'colleague', 70, '2026-09-08 14:00:00', '2026-09-24 11:00:00', 'Ex-Stripe colleague. Great contact for scaling Kubernetes infrastructure and database sharding.'),
(5, 1, 'Elena', 'Rostova', 'elena@devsphere.io', '+1 (415) 555-6611', 'DevSphere', 'Head of Developer Relations', 'Seattle, WA', NULL, 'https://linkedin.com/in/elena-rostova', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'partner', 65, '2026-09-02 10:00:00', '2026-09-20 15:00:00', 'Organizing AI Developer Summit in November. Invited me to deliver a keynote on full-stack AI CRM architectures.'),
(6, 1, 'Alex', 'Morgan', 'alex@morgancap.com', '+1 (212) 555-9011', 'Morgan Ventures', 'Managing Director', 'New York, NY', NULL, 'https://linkedin.com/in/alex-morgan-investor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'investor', 60, '2026-08-28 17:00:00', '2026-09-28 16:00:00', 'Met at NYC Tech Week. Interested in our relationship graph engine and market expansion.'),
(7, 1, 'David', 'Chen', 'david.chen@vercel-labs.com', '+1 (415) 555-4500', 'Vercel Labs', 'Principal Architect', 'San Francisco, CA', NULL, 'https://linkedin.com/in/david-chen-arch', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'colleague', 75, '2026-09-11 12:15:00', '2026-09-23 14:30:00', 'Co-collaborator on Next/React edge rendering patterns. Discussed optimizing CRM client latency.'),
(8, 1, 'Maya', 'Lin', 'maya@studiomatrix.co', '+1 (312) 555-8833', 'Studio Matrix', 'Founder & Chief Design Officer', 'Chicago, IL', NULL, 'https://linkedin.com/in/maya-lin-design', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'client', 55, '2026-08-25 13:00:00', '2026-09-18 17:00:00', 'Looking for a custom CRM & workflow automation pipeline for her 35-person design studio.');

-- 6. Contact Tags
INSERT INTO `contact_tags` (`contact_id`, `tag_id`) VALUES
(1, 1), (1, 2), (1, 4),
(2, 1), (2, 2),
(3, 2), (3, 3),
(4, 5), (4, 7),
(5, 7), (5, 8),
(6, 3),
(7, 5),
(8, 6), (8, 8);

-- 7. Goals
INSERT INTO `goals` (`goal_id`, `user_id`, `title`, `description`, `goal_type`, `target_value`, `current_value`, `unit`, `start_date`, `end_date`, `status`) VALUES
(1, 1, 'Connect with 20 AI Founders', 'Expand our network of seed & growth stage founders building generative AI and autonomous workflows.', 'connections', 20, 14, 'founders', '2026-09-01', '2026-09-30', 'active'),
(2, 1, '5 In-Depth Coffee Strategy Chats', 'Meet high-impact advisors and technical peers for meaningful 1-on-1 strategy discussions.', 'interactions', 5, 4, 'meetings', '2026-09-01', '2026-09-30', 'active'),
(3, 1, 'Complete 15 Timely Follow-ups', 'Ensure zero networking opportunities drop through timely follow-ups within 5 days of meeting.', 'follow_ups', 15, 11, 'follow-ups', '2026-09-01', '2026-09-30', 'active'),
(4, 1, 'Attend 4 Tech Conferences / Meetups', 'Participate actively in SF tech ecosystem events and demo sessions.', 'events', 4, 2, 'events', '2026-09-01', '2026-10-31', 'active');

-- 8. Goal Progress
INSERT INTO `goal_progress` (`progress_id`, `goal_id`, `progress_date`, `progress_value`, `notes`) VALUES
(1, 1, '2026-09-10', 5, 'Great progress from SF Tech Week introductions.'),
(2, 1, '2026-09-15', 3, 'Added 3 founders from AI Demo Night.');

-- 9. Interactions
INSERT INTO `interactions` (`interaction_id`, `user_id`, `contact_id`, `goal_id`, `interaction_type`, `title`, `interaction_date`, `duration_minutes`, `summary`, `outcome`, `follow_up_required`, `follow_up_date`, `sentiment`) VALUES
(1, 1, 1, 2, 'coffee', 'Coffee Strategy Chat at Blue Bottle SF', '2026-09-14 11:30:00', 45, 'Deep dive into AI-driven CRM architectures and privacy standards. Priya shared valuable insights on user-controlled AI agents.', 'Agreed to collaborate on open-source agent integration schemas. Scheduled follow-up for next week.', 1, '2026-09-22', 'positive'),
(2, 1, 2, 1, 'meeting', 'Product Architecture & Seed Deck Review', '2026-09-12 15:00:00', 60, 'Walked through SynthAI architecture diagram. Discussed latency benchmarks and angel investor intros.', 'Introduced Amit to Neha Verma at Horizon Capital.', 1, '2026-09-19', 'positive'),
(3, 1, 3, 1, 'call', 'Angel Syndicate Sync & Market Thesis Call', '2026-09-10 16:30:00', 30, 'Discussed Q3 investment trends in B2B AI tooling. Neha confirmed interest in reviewing SynthAI seed round.', 'Sent SynthAI memo and introductory email.', 1, '2026-09-25', 'positive'),
(4, 1, 7, 2, 'meeting', 'React Server Actions & Edge Caching Deep Dive', '2026-09-11 12:15:00', 40, 'Brainstormed real-time updates for Kanban boards and optimistic UI patterns with MySQL read replicas.', 'Implemented TanStack Query cache invalidation strategy.', 0, NULL, 'positive'),
(5, 1, 8, 3, 'email', 'Studio Matrix CRM Workflow Discovery Proposal', '2026-08-25 13:00:00', 15, 'Sent detailed capabilities summary of NexaLink custom fields, calendar sync, and Kanban views.', 'Awaiting Maya confirmation for demo walkthrough.', 1, '2026-09-18', 'neutral');

-- 10. Meetings
INSERT INTO `meetings` (`meeting_id`, `user_id`, `contact_id`, `goal_id`, `title`, `meeting_type`, `start_at`, `end_at`, `location`, `meeting_url`, `agenda`, `outcome`, `follow_up_date`) VALUES
(1, 1, 1, 2, 'Follow-up on AI Agent Protocols', 'video', '2026-09-22 10:00:00', '2026-09-22 10:45:00', 'Google Meet', 'https://meet.google.com/nex-crm-sync', '1. Review draft agent schemas\n2. Discuss privacy isolation for enterprise CRM\n3. Schedule joint workshop', NULL, '2026-09-25'),
(2, 1, 2, 1, 'SynthAI Demo Walkthrough & Pitch Prep', 'coffee', '2026-09-19 14:00:00', '2026-09-19 15:00:00', 'Sightglass Coffee, SOMA, SF', NULL, 'Review final live demo before VC pitches next week.', NULL, '2026-09-21'),
(3, 1, 8, 3, 'Design Studio CRM Workflow Demo', 'video', '2026-09-18 17:00:00', '2026-09-18 17:30:00', 'Zoom', 'https://zoom.us/j/918237465', 'Walkthrough Kanban board, interaction timeline, and automated follow-up reminders for design clients.', NULL, '2026-09-20'),
(4, 1, 3, 1, 'Quarterly Venture Portfolio Round Table', 'office', '2026-09-25 09:30:00', '2026-09-25 11:00:00', 'Horizon Capital, 101 California St, SF', NULL, 'Quarterly review of emerging AI infra startups and syndication opportunities.', NULL, '2026-09-27');

-- 11. Tasks
INSERT INTO `tasks` (`task_id`, `user_id`, `contact_id`, `goal_id`, `title`, `description`, `status`, `priority`, `due_date`, `sort_order`) VALUES
(1, 1, 8, 3, 'Follow up with Maya Lin on CRM demo agenda', 'Send Zoom link and pre-read notes on Studio Matrix requirements.', 'todo', 'urgent', '2026-09-18', 10),
(2, 1, 3, 1, 'Send SynthAI memo to Neha Verma', 'Include 1-pager summary, traction metrics, and founder bios.', 'in_progress', 'high', '2026-09-19', 20),
(3, 1, 1, 2, 'Prepare discussion points for Priya Sharma follow-up', 'Use AI Conversation Assistant to formulate 3 high-impact questions on agent safety.', 'in_progress', 'medium', '2026-09-21', 30),
(4, 1, 5, 4, 'Review Elena Rostova AI Keynote outline', 'Confirm 30-minute speaking slot at DevSphere Conference.', 'todo', 'medium', '2026-09-20', 40),
(5, 1, 2, 1, 'Met with Amit Patel & reviewed Seed pitch', 'Completed 60-min in-person feedback session.', 'done', 'high', '2026-09-12', 50),
(6, 1, 7, 2, 'Shared open-source React agent repo with David Chen', 'Reviewed edge rendering PR and benchmark numbers.', 'done', 'low', '2026-09-11', 60);

-- 12. Notes
INSERT INTO `notes` (`note_id`, `user_id`, `contact_id`, `title`, `content`, `is_pinned`) VALUES
(1, 1, 1, 'Key Insights: Enterprise AI Agent Architecture', 'Priya emphasized that enterprise clients prioritize deterministic control boundaries over pure autonomy. Recommended building explicit human-in-the-loop review screens for all external communication.', 1),
(2, 1, 2, 'SynthAI Investor Pitch & Unit Economics', 'Current ARR: $280k. CAC payback: 4.2 months. Seeking $4M round led by tier-1 funds. Top pipeline clients include 2 Fortune 500 financial institutions.', 1),
(3, 1, NULL, 'Q3 Networking Master Plan', 'Focus areas: 1) AI Agents 2) High-signal founder coffee chats 3) Expand angel syndication network. Keep all interactions logged in NexaLink within 24 hours.', 0);

-- 13. Recommendations
INSERT INTO `recommendations` (`recommendation_id`, `user_id`, `recommended_name`, `recommended_role`, `recommended_company`, `avatar_url`, `industry`, `skills`, `reason`, `score`, `status`) VALUES
(1, 1, 'Dr. Aris Thorne', 'Chief Scientist & Co-Founder', 'HyperScale AI', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Artificial Intelligence', '[\"Distributed Training\", \"LLM Alignment\", \"PyTorch\"]', 'You both share interests in autonomous agent architectures and have 3 mutual colleagues at Google Research.', 94, 'pending'),
(2, 1, 'Sarah Jenkins', 'Partner', 'Sequoia Surge', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Venture Capital', '[\"Seed Investing\", \"B2B SaaS\", \"Board Advisory\"]', 'Actively investing in developer infrastructure tools matching your current goal \"Connect with 20 AI Founders\".', 91, 'pending'),
(3, 1, 'Marcus Brody', 'VP of Product Engineering', 'Datastream Inc', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Cloud Infrastructure', '[\"Distributed Systems\", \"Postgres/MySQL\", \"Kubernetes\"]', 'Both located in SF Bay Area with shared focus on real-time database indexing and scalable CRM architectures.', 87, 'pending');

-- 14. Posts
INSERT INTO `posts` (`post_id`, `user_id`, `author_name`, `author_title`, `author_avatar`, `content`, `tags`, `likes_count`) VALUES
(1, 1, 'Priya Sharma', 'Director of Product, AI Ecosystems @ Google', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Excited to announce our new open benchmark for conversational CRM agents! High-signal relationships require transparent, user-controlled AI assistants.', '[\"AI\", \"Product\", \"OpenSource\"]', 42),
(2, 1, 'Amit Patel', 'Co-Founder @ SynthAI', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Productive coffee with Rahul Mehta reviewing our multi-agent architecture. The Bay Area builder energy is unmatched this month.', '[\"Startups\", \"Networking\", \"SFTech\"]', 28),
(3, 1, 'Elena Rostova', 'Head of DevRel @ DevSphere', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'Speaker lineup for the Seattle AI Summit is coming together! Topics include real-time relational caching, full-stack TypeScript, and AI-driven CRM workflows.', '[\"Conference\", \"DevRel\", \"TechEvents\"]', 19);

-- 15. Notifications
INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `entity_type`, `entity_id`, `is_read`) VALUES
(1, 1, 'follow_up_due', 'Follow-up Due Today: Maya Lin', 'You have a scheduled demo follow-up with Maya Lin (Studio Matrix).', 'contact', 8, 0),
(2, 1, 'meeting_reminder', 'Upcoming Meeting: Design Studio CRM Demo', 'Today at 5:00 PM via Zoom with Maya Lin.', 'meeting', 3, 0),
(3, 1, 'goal_deadline', 'Goal Milestone: 70% Reached', 'You have achieved 14/20 connections for \"Connect with 20 AI Founders\".', 'goal', 1, 1),
(4, 1, 'ai_suggestion', 'AI Networking Insight', 'You have not reached out to Alex Morgan in 21 days. Consider sending a reconnect note.', 'contact', 6, 0);

-- 16. Audit Logs
INSERT INTO `audit_logs` (`audit_id`, `user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `user_agent`) VALUES
(1, 1, 'SYSTEM_SEED_INITIALIZED', 'system', 1, '{\"note\": \"Production seed initialized successfully\"}', '127.0.0.1', 'NexaLink Migration Engine');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
