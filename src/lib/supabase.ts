import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface StudySession {
  id: string;
  title: string;
  session_type: 'explain' | 'summarize' | 'quiz' | 'flashcard';
  input_content: string;
  ai_response: string;
  created_at: string;
}
