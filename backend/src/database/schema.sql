-- NexaLink CRM Database Schema --

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    display_name VARCHAR(150) NOT NULL,
    avatar_url LONGTEXT NULL,
    status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_accounts (
    oauth_account_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_oauth_provider_user (provider, provider_user_id),
    KEY idx_oauth_user (user_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    headline VARCHAR(255) NULL,
    bio TEXT NULL,
    company VARCHAR(150) NULL,
    job_title VARCHAR(150) NULL,
    location VARCHAR(150) NULL,
    industry VARCHAR(100) NULL,
    website VARCHAR(255) NULL,
    linkedin_url VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    avatar_url LONGTEXT NULL,
    skills JSON NULL,
    interests JSON NULL,
    networking_goals JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_profile_user (user_id),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_personas (
    persona_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    persona_name VARCHAR(100) NOT NULL DEFAULT 'Default Persona',
    communication_style VARCHAR(100) DEFAULT 'Concise & Strategic',
    preferred_people TEXT NULL,
    networking_goal TEXT NULL,
    interests TEXT NULL,
    confidence INT DEFAULT 85,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_personas_user (user_id),
    CONSTRAINT fk_personas_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contacts (
    contact_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    company VARCHAR(150) NULL,
    job_title VARCHAR(150) NULL,
    location VARCHAR(150) NULL,
    website VARCHAR(255) NULL,
    linkedin_url VARCHAR(255) NULL,
    avatar_url VARCHAR(500) NULL,
    relationship_type ENUM('friend','mentor','mentee','colleague','client','prospect','founder','investor','recruiter','partner','other') NOT NULL DEFAULT 'other',
    relationship_strength INT NOT NULL DEFAULT 50,
    last_interaction_at DATETIME NULL,
    next_follow_up_at DATETIME NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_contacts_user (user_id),
    KEY idx_contacts_followup (user_id, next_follow_up_at),
    KEY idx_contacts_strength (user_id, relationship_strength),
    CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
    tag_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_tag (user_id, name),
    KEY idx_tags_user (user_id),
    CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, tag_id),
    CONSTRAINT fk_ct_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    CONSTRAINT fk_ct_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goals (
    goal_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    goal_type VARCHAR(100) NOT NULL DEFAULT 'connections',
    target_value INT NOT NULL DEFAULT 10,
    current_value INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'people',
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_goals_user_status (user_id, status),
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goal_progress (
    progress_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    goal_id BIGINT UNSIGNED NOT NULL,
    progress_date DATE NOT NULL,
    progress_value INT NOT NULL DEFAULT 1,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_goal_progress_goal_date (goal_id, progress_date),
    CONSTRAINT fk_gp_goal FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interactions (
    interaction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NOT NULL,
    goal_id BIGINT UNSIGNED NULL,
    interaction_type ENUM('meeting','call','email','message','coffee','event','introduction','note','other') NOT NULL DEFAULT 'other',
    title VARCHAR(255) NOT NULL,
    interaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT DEFAULT 30,
    summary TEXT NULL,
    outcome TEXT NULL,
    follow_up_required TINYINT(1) NOT NULL DEFAULT 0,
    follow_up_date DATE NULL,
    sentiment ENUM('positive','neutral','negative') DEFAULT 'positive',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_interactions_contact_date (contact_id, interaction_date),
    KEY idx_interactions_user_date (user_id, interaction_date),
    CONSTRAINT fk_interactions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_interactions_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    CONSTRAINT fk_interactions_goal FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meetings (
    meeting_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NULL,
    goal_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    meeting_type ENUM('coffee','video','office','conference','phone','other') NOT NULL DEFAULT 'video',
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    location VARCHAR(255) NULL,
    meeting_url VARCHAR(500) NULL,
    agenda TEXT NULL,
    outcome TEXT NULL,
    notes TEXT NULL,
    follow_up_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_meetings_user_start (user_id, start_at),
    CONSTRAINT fk_meetings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL,
    CONSTRAINT fk_meetings_goal FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    task_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NULL,
    goal_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
    priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
    due_date DATE NULL,
    completed_at DATETIME NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_tasks_user_status (user_id, status),
    KEY idx_tasks_due_date (user_id, due_date),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_goal FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notes (
    note_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NULL,
    meeting_id BIGINT UNSIGNED NULL,
    goal_id BIGINT UNSIGNED NULL,
    task_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_notes_user (user_id),
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE SET NULL,
    CONSTRAINT fk_notes_goal FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE SET NULL,
    CONSTRAINT fk_notes_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NULL,
    recommended_name VARCHAR(150) NOT NULL,
    recommended_role VARCHAR(150) NOT NULL,
    recommended_company VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    industry VARCHAR(100) NULL,
    skills JSON NULL,
    reason TEXT NOT NULL,
    score INT NOT NULL DEFAULT 85,
    status ENUM('pending','connected','saved','dismissed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_recom_user (user_id, status),
    CONSTRAINT fk_recom_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_recom_contact FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
    post_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_title VARCHAR(150) NULL,
    author_avatar VARCHAR(500) NULL,
    content TEXT NOT NULL,
    tags JSON NULL,
    likes_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_posts_user (user_id),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('follow_up_due','meeting_reminder','goal_deadline','task_due','ai_suggestion','connection_request','system') NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id BIGINT UNSIGNED NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notif_user_read (user_id, is_read),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    metadata JSON NULL,
    ip_address VARCHAR(50) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_user (user_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_match_scores (
    match_score_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_a_id BIGINT UNSIGNED NOT NULL,
    user_b_id BIGINT UNSIGNED NOT NULL,
    score FLOAT NOT NULL DEFAULT 0,
    reasons JSON NOT NULL,
    is_mutual TINYINT(1) NOT NULL DEFAULT 0,
    computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_match_pair (user_a_id, user_b_id),
    KEY idx_user_a_score (user_a_id, score),
    CONSTRAINT fk_ums_user_a FOREIGN KEY (user_a_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ums_user_b FOREIGN KEY (user_b_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skipped_profiles (
    skip_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    skipped_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_skipped_pair (user_id, skipped_user_id),
    KEY idx_skipped_user (user_id),
    CONSTRAINT fk_skip_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_skip_skipped FOREIGN KEY (skipped_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

