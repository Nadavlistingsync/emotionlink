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