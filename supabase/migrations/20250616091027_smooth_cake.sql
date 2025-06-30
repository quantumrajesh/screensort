/*
  # Add Computer Vision Columns to Screenshots

  1. New Columns
    - `detected_objects` (text array) - Objects detected by AI
    - `dominant_colors` (text array) - Dominant colors in the image  
    - `tags` (text array) - Combined tags from all analysis

  2. Indexes
    - GIN indexes for efficient array searching on all new columns
    - Keep existing text search index separate for better performance

  3. Notes
    - Uses simpler indexing strategy to avoid IMMUTABLE function issues
    - Maintains backward compatibility with existing data
*/

-- Add new columns for computer vision data
DO $$
BEGIN
  -- Add detected_objects column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'screenshots' AND column_name = 'detected_objects'
  ) THEN
    ALTER TABLE screenshots ADD COLUMN detected_objects text[] DEFAULT '{}';
  END IF;

  -- Add dominant_colors column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'screenshots' AND column_name = 'dominant_colors'
  ) THEN
    ALTER TABLE screenshots ADD COLUMN dominant_colors text[] DEFAULT '{}';
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'screenshots' AND column_name = 'tags'
  ) THEN
    ALTER TABLE screenshots ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for efficient array searching
CREATE INDEX IF NOT EXISTS screenshots_tags_idx ON screenshots USING gin(tags);
CREATE INDEX IF NOT EXISTS screenshots_objects_idx ON screenshots USING gin(detected_objects);
CREATE INDEX IF NOT EXISTS screenshots_colors_idx ON screenshots USING gin(dominant_colors);

-- Keep the existing text search index for extracted_text
-- We'll handle multi-field search in the application layer for better flexibility
CREATE INDEX IF NOT EXISTS screenshots_text_search_idx ON screenshots USING gin(to_tsvector('english', coalesce(extracted_text, '')));