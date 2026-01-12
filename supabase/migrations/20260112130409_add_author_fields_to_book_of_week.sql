/*
  # Add Author Information to Book of the Week

  1. Changes
    - Add `author_name` column to store the book author's name
    - Add `author_social_link` column to store optional social media link (Twitter, Instagram, etc.)
  
  2. Details
    - `author_name` is required (NOT NULL with default empty string for existing records)
    - `author_social_link` is optional (can be NULL)
    - Both columns are text type
*/

-- Add author name column (required field)
ALTER TABLE book_of_the_week 
ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT '';

-- Add author social link column (optional field)
ALTER TABLE book_of_the_week 
ADD COLUMN IF NOT EXISTS author_social_link text;

-- Update the default for author_name to be NULL for future inserts (empty string was just for existing records)
ALTER TABLE book_of_the_week 
ALTER COLUMN author_name DROP DEFAULT;