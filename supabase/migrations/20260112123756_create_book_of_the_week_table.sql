/*
  # Create Book of the Week Table

  1. New Tables
    - `book_of_the_week`
      - `id` (uuid, primary key) - Unique identifier for each book entry
      - `week_start_date` (date) - Date when the week starts
      - `week_end_date` (date) - Date when the week ends
      - `book_title` (text) - Title of the featured book
      - `book_drive_url` (text) - Google Drive file ID or embed URL for the book
      - `google_form_url` (text) - URL for the weekly submission form
      - `is_active` (boolean, default false) - Marks the current active week's book
      - `past_results_url` (text, nullable) - External URL for viewing past winners
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `book_of_the_week` table
    - Add policy for public read access (anyone can view)
    - Add policy for authenticated admin users to insert/update/delete

  3. Indexes
    - Index on `is_active` for faster queries
    - Index on `week_start_date` for sorting

  4. Constraints
    - Only one book can be active at a time (enforced via trigger)
*/

-- Create the book_of_the_week table
CREATE TABLE IF NOT EXISTS book_of_the_week (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  book_title text NOT NULL,
  book_drive_url text NOT NULL,
  google_form_url text NOT NULL,
  is_active boolean DEFAULT false,
  past_results_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE book_of_the_week ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can view book of the week"
  ON book_of_the_week
  FOR SELECT
  USING (true);

-- Policy for admin insert
CREATE POLICY "Admins can insert book of the week"
  ON book_of_the_week
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Policy for admin update
CREATE POLICY "Admins can update book of the week"
  ON book_of_the_week
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Policy for admin delete
CREATE POLICY "Admins can delete book of the week"
  ON book_of_the_week
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_of_the_week_is_active ON book_of_the_week(is_active);
CREATE INDEX IF NOT EXISTS idx_book_of_the_week_week_start ON book_of_the_week(week_start_date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_book_of_the_week_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS book_of_the_week_updated_at ON book_of_the_week;
CREATE TRIGGER book_of_the_week_updated_at
  BEFORE UPDATE ON book_of_the_week
  FOR EACH ROW
  EXECUTE FUNCTION update_book_of_the_week_updated_at();

-- Create function to ensure only one active book at a time
CREATE OR REPLACE FUNCTION ensure_single_active_book()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE book_of_the_week
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one active book
DROP TRIGGER IF EXISTS ensure_single_active_book_trigger ON book_of_the_week;
CREATE TRIGGER ensure_single_active_book_trigger
  BEFORE INSERT OR UPDATE ON book_of_the_week
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_book();