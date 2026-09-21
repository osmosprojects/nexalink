-- ====================================================================
-- NexaLink CRM — Production Database Schema & Seed Data
-- Target Database: MySQL 8.0+ / MariaDB 10.4+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Drop Tables
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

-- --------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------
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
-- 2. OAuth Accounts Table
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
-- 3. User Profiles Table
-- --------------------------------------------------------
CREATE TABLE `user_profiles` (
  `profile_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `headline` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `company` VARCHAR(150) NULL,
  `job_title` VARCHAR(150) NULL,
  `location` VARCHAR(150) NULL,
  `industry` VARCHAR(100) NULL,
  `website` VARCHAR(255) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `timezone` VARCHAR(50) DEFAULT 'Asia/Kolkata',
  `avatar_url` VARCHAR(500) NULL,
  `skills` JSON NULL,
  `interests` JSON NULL,
  `networking_goals` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. User Personas Table
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
-- 5. Contacts Table
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
-- 6. Tags Table
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
-- 7. Contact Tags Junction Table
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
-- 8. Goals Table
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
-- 9. Goal Progress Table
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
-- 10. Interactions Table
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
-- 11. Meetings Table
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
-- 12. Tasks Table
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
-- 13. Notes Table
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
-- 14. Recommendations Table
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
-- 15. Posts Table
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
-- 16. Notifications Table
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
-- 17. Audit Logs Table
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
-- SEED DATA: 8 Clean Users (Password for all: password123)
-- Password hash: $2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq
-- ========================================================

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `display_name`, `avatar_url`, `status`) VALUES
(1, 'sanjeev.sarma@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Sanjeev Sarma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'active'),
(2, 'geeta.rathod@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Geeta Rathod', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'active'),
(3, 'vinay.mishra@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Vinay Mishra', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'active'),
(4, 'abhinav.n@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Abhinav N', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'active'),
(5, 'devyani@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Devyani', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'active'),
(6, 'abhishek.tiwari@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Abhishek Tiwari', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'active'),
(7, 'hitesh.mishra@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Hitesh Mishra', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'active'),
(8, 'mayur.tiwari@nexalink.com', '$2a$10$Irgq.60J3tfUJW1TiM24LOeSvvGWRdBZsxF31BndOoptjhFApS3kq', 'Mayur Tiwari', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'active');

-- User Profiles
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, `timezone`, `skills`, `interests`, `networking_goals`) VALUES
(1, 1, 'Strategic Director & Tech Advisor', 'Building high-growth teams and strategic partnerships.', 'NexaLink Enterprise', 'Director of Strategy', 'Mumbai, India', 'Technology / SaaS', 'Asia/Kolkata', '["Leadership", "Enterprise SaaS", "Strategic Networking"]', '["AI Systems", "Team Growth"]', '["Connect with domain leaders"]'),
(2, 2, 'VP of People & Culture', 'Passionate about talent, leadership, and high-trust organizations.', 'NexaLink Enterprise', 'VP of People', 'Bengaluru, India', 'Human Resources / Talent', 'Asia/Kolkata', '["Talent Strategy", "Executive Coaching"]', '["Organizational Design", "Mentorship"]', '["Expand talent network"]'),
(3, 3, 'Lead Solutions Architect', 'Designing scalable cloud architecture and enterprise systems.', 'NexaLink Enterprise', 'Lead Solutions Architect', 'Delhi, India', 'Cloud Architecture', 'Asia/Kolkata', '["Cloud Computing", "System Design", "Node.js"]', '["Distributed Architecture", "AI Workflows"]', '["Connect with tech architects"]'),
(4, 4, 'Senior Product Manager', 'Crafting user-centric products and leading agile delivery.', 'NexaLink Enterprise', 'Senior Product Manager', 'Hyderabad, India', 'Product Management', 'Asia/Kolkata', '["Product Strategy", "User Research", "Agile"]', '["Product Analytics", "SaaS Growth"]', '["Build product leader relationships"]'),
(5, 5, 'Head of Design & UX', 'Creating intuitive, accessible, and delight-driven product experiences.', 'NexaLink Enterprise', 'Head of Design', 'Pune, India', 'Product Design / UX', 'Asia/Kolkata', '["UI/UX Design", "Design Systems", "User Psychology"]', '["Design Systems", "Creative Direction"]', '["Connect with creative leaders"]'),
(6, 6, 'Senior Engineering Manager', 'Leading engineering teams building mission-critical platforms.', 'NexaLink Enterprise', 'Senior Engineering Manager', 'Bengaluru, India', 'Software Engineering', 'Asia/Kolkata', '["Engineering Leadership", "Full-Stack Development"]', '["Scalability", "Team Mentorship"]', '["Build engineering network"]'),
(7, 7, 'Head of Business Development', 'Driving strategic revenue growth and channel partnerships.', 'NexaLink Enterprise', 'Head of Business Development', 'Gurugram, India', 'Business Development', 'Asia/Kolkata', '["Strategic Partnerships", "Enterprise Sales", "Negotiation"]', '["Venture Ecosystem", "Strategic Alliances"]', '["Connect with enterprise clients"]'),
(8, 8, 'Operations & Growth Lead', 'Optimizing cross-functional operations and execution speed.', 'NexaLink Enterprise', 'Operations & Growth Lead', 'Noida, India', 'Operations & Growth', 'Asia/Kolkata', '["Operations Management", "Growth Hacking", "Process Automation"]', '["Scalable Operations", "Startups"]', '["Connect with growth operators"]');

-- User Personas
INSERT INTO `user_personas` (`persona_id`, `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`) VALUES
(1, 1, 'Strategic Leader', 'Direct, visionary, and empowering', 'C-Suite, Founders, Investors', 'Strategic industry expansion', 'Technology Trends, High-growth Scaling', 95, 1),
(2, 2, 'People & Talent Leader', 'Empathetic, clear, and inclusive', 'HR Leaders, Executives, Coaches', 'Foster high-performance leadership', 'Organizational Culture, Leadership', 90, 1),
(3, 3, 'Technical Architect', 'Analytical, precise, and practical', 'Engineers, Architects, CTOs', 'Exchange architectural best practices', 'Cloud Computing, Distributed Systems', 92, 1),
(4, 4, 'Product Innovator', 'Curious, customer-focused, and data-driven', 'Product Managers, Design Leads, Analysts', 'Accelerate product-market fit', 'Product Strategy, UX Optimization', 88, 1),
(5, 5, 'Design Visionary', 'Visual, thoughtful, and creative', 'Designers, Product Leaders, Researchers', 'Elevate product design standards', 'Design Systems, Human-Centered Design', 94, 1),
(6, 6, 'Engineering Leader', 'Collaborative, pragmatic, and mentorship-oriented', 'Engineers, Tech Leads, Engineering Directors', 'Build resilient engineering teams', 'Software Architecture, Tech Culture', 91, 1),
(7, 7, 'Dealmaker & Strategist', 'High-energy, relationship-oriented, and persuasive', 'Business Leaders, Partners, Sales Directors', 'Drive strategic revenue growth', 'Enterprise Alliances, Growth Markets', 93, 1),
(8, 8, 'Operations Architect', 'Methodical, efficient, and execution-focused', 'Operations Leaders, Founders, COOs', 'Streamline operational velocity', 'Automation, Workflow Optimization', 89, 1);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
