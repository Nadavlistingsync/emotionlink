import { createSupabaseBrowserClient } from './supabaseClient';

const supabase = createSupabaseBrowserClient();

export type Message = {
  userId: string;
  sender: 'user' | 'bot';
  content: string;
  emotion: string;
  intensity: number;
};

export async function saveMessage({
  userId,
  sender,
  content,
  emotion,
  intensity
}: Message) {
  const { data, error } = await supabase.from('messages').insert([
    {
      user_id: userId,
      sender,
      content,
      emotion,
      intensity
    }
  ]);

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }
  return data;
}

// Function to get messages for a user
export async function getMessages(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data;
}

// Function to get messages for a therapist's patients
export async function getPatientMessages(therapistId: string, patientId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching patient messages:', error);
    throw error;
  }
  return data;
} 