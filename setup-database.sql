-- Green Matchers - Database Setup Script
-- Run this to create database and user

-- Create database
CREATE DATABASE IF NOT EXISTS green_matchers;

-- Switch to the database
USE green_matchers;

-- Create user (replace with your desired password)
CREATE USER IF NOT EXISTS 'green_user'@'localhost' IDENTIFIED BY 'green_password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON green_matchers.* TO 'green_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show success message
SELECT 'Database and user created successfully!' AS message;
