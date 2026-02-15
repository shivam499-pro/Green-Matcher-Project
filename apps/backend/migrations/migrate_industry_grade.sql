-- =====================================================
-- Green Matchers - Industry-Grade Database Migration
-- Adds new columns and tables for production use
-- =====================================================

-- Run this script in MySQL:
-- mysql -u green_user -pgreen_password green_matchers < migrate_industry_grade.sql

-- =====================================================
-- PART 1: Add columns to users table
-- =====================================================
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_notifications TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS job_alerts TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS application_updates TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(50) DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
    ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light',
    ADD COLUMN IF NOT EXISTS preferences JSON;

-- =====================================================
-- PART 2: Add columns to jobs table
-- =====================================================
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS job_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS required_skills JSON,
    ADD COLUMN IF NOT EXISTS preferred_skills JSON,
    ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
    ADD COLUMN IF NOT EXISTS is_remote TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- =====================================================
-- PART 3: Add columns to careers table
-- =====================================================
ALTER TABLE careers
    ADD COLUMN IF NOT EXISTS avg_salary INT,
    ADD COLUMN IF NOT EXISTS growth_potential VARCHAR(50) DEFAULT 'Medium';

-- =====================================================
-- PART 4: Create saved_jobs table
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_job (user_id, job_id),
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id)
);

-- =====================================================
-- PART 5: Create job_alerts table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    keywords VARCHAR(255),
    location VARCHAR(255),
    job_type VARCHAR(50),
    sdg_tags JSON,
    salary_min INT,
    salary_max INT,
    is_active TINYINT(1) DEFAULT 1,
    frequency VARCHAR(20) DEFAULT 'daily',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- PART 6: Create notifications table
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'general',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- PART 7: Create browse_history table
-- =====================================================
CREATE TABLE IF NOT EXISTS browse_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_viewed_at (viewed_at)
);

-- =====================================================
-- PART 8: Update existing data
-- =====================================================

-- Update jobs with company_name from users
UPDATE jobs j
JOIN users u ON j.employer_id = u.id
SET j.company_name = u.company_name
WHERE j.company_name IS NULL;

-- Update users preferences JSON
UPDATE users 
SET preferences = JSON_OBJECT(
    'email_notifications', COALESCE(email_notifications, 1),
    'job_alerts', COALESCE(job_alerts, 1),
    'application_updates', COALESCE(application_updates, 1),
    'profile_visibility', COALESCE(profile_visibility, 'public'),
    'timezone', COALESCE(timezone, 'UTC'),
    'theme', COALESCE(theme, 'light')
)
WHERE preferences IS NULL;

-- =====================================================
-- PART 9: Verify migration
-- =====================================================
SELECT 'Migration completed successfully!' as status;

-- Show new tables
SHOW TABLES LIKE 'saved_jobs';
SHOW TABLES LIKE 'job_alerts';
SHOW TABLES LIKE 'notifications';
SHOW TABLES LIKE 'browse_history';
