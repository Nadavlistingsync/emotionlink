import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Here you would integrate with your AI service
    // For now, we'll return a simple response
    const response = {
      message: `I understand you're saying: "${message}". As an AI therapist, I'm here to help you explore your thoughts and feelings. Could you tell me more about what's on your mind?`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 