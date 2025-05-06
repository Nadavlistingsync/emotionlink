import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  role: 'user' | 'therapist';
  created_at: string;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  created_at: string;
};

export type ChatLog = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type TherapistNote = {
  id: string;
  therapist_id: string;
  user_id: string;
  content: string;
  created_at: string;
}; 