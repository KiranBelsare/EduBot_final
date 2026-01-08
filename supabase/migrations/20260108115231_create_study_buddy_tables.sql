/*
  # Study Sessions Schema
  
  1. New Tables
    - `study_sessions`
      - `id` (uuid, primary key)
      - `title` (text) - Topic or title of session
      - `session_type` (text) - Type: 'explain', 'summarize', 'quiz', 'flashcard'
      - `input_content` (text) - User's input content
      - `ai_response` (text) - AI generated response
      - `created_at` (timestamptz)
      - `user_id` (uuid) - References auth.users
      
  2. Security
    - Enable RLS on `study_sessions` table
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  session_type text NOT NULL DEFAULT 'explain',
  input_content text NOT NULL,
  ai_response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON study_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access"
  ON study_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON study_sessions
  FOR DELETE
  TO anon, authenticated
  USING (true);