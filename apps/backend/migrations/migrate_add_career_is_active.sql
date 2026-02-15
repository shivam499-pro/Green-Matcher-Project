-- Migration: Add is_active column to careers table
-- Date: 2026-02-11
-- Purpose: Fix AttributeError when querying Career.is_active in matching service
-- =====================================================
-- STEP 1: Add is_active column to careers table
-- =====================================================
ALTER TABLE careers
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
-- =====================================================
-- STEP 2: Verify existing records have is_active = TRUE
-- =====================================================
UPDATE careers
SET is_active = TRUE
WHERE is_active IS NULL;
-- =====================================================
-- STEP 3: Add index for better query performance
-- =====================================================
CREATE INDEX ix_careers_is_active ON careers(is_active);
-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check column exists
-- DESCRIBE careers;
-- Verify all records are active
-- SELECT COUNT(*) FROM careers WHERE is_active = TRUE;
-- Check index was created
-- SHOW INDEX FROM careers WHERE Key_name = 'ix_careers_is_active';