/*
  # Create screenshots table for Screenshot Manager

  1. New Tables
    - `screenshots`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `file_name` (text)
      - `file_url` (text)
      - `extracted_text` (text)
      - `file_size` (bigint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `screenshots` table
    - Add policies for authenticated users to manage their own screenshots
*/

CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  extracted_text text DEFAULT '',
  file_size bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own screenshots"
  ON screenshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own screenshots"
  ON screenshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own screenshots"
  ON screenshots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own screenshots"
  ON screenshots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS screenshots_user_id_idx ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS screenshots_created_at_idx ON screenshots(created_at DESC);
CREATE INDEX IF NOT EXISTS screenshots_text_search_idx ON screenshots USING gin(to_tsvector('english', extracted_text));