import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function POST(request: Request) {
  try {
    const { userId, email, role } = await request.json();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          role: role || 'user',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 