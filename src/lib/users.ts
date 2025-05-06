import { supabase } from './supabase';

export type User = {
  id: string;
  email: string;
  role: 'user' | 'therapist' | 'admin';
  therapist_id?: string;
};

export async function createUser(userId: string, email: string, role: User['role'] = 'user') {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          role
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned after user creation');
    }

    return data;
  } catch (error: any) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
  return data;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  return data;
}

export async function getPatients(therapistId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
  return data;
} 