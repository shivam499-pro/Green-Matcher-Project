
-- Run this in your MariaDB database first

-- Users table (job seekers)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'en',
    experience_years DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    summary_text TEXT,
    skills_json JSON,
    experience_json JSON,
    education_json JSON,
    certifications_json JSON,
    embedding BLOB,  -- Vector embedding for semantic search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills table (for extracted skills)
CREATE TABLE IF NOT EXISTS user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100),
    proficiency_level VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_skill_name (skill_name)
);

-- Add indexes for better performance
CREATE INDEX idx_users_language ON users(preferred_language);
CREATE INDEX idx_users_location ON users(location);
