import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function POST(request: Request) {
  try {
    console.log('[API/chat] Incoming request');
    const supabase = createSupabaseServerClient();
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[API/chat] Session:', { session, sessionError });
    if (sessionError || !session) {
      console.warn('[API/chat] Unauthorized access attempt', { sessionError });
      return NextResponse.json(
        { response: '', error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[API/chat] Request body:', body);
    const { message, emotion, intensity } = body;

    if (!message) {
      console.warn('[API/chat] No message provided');
      return NextResponse.json(
        { response: '', error: 'Message is required' },
        { status: 400 }
      );
    }

    // Here you would integrate with your AI service
    // For now, we'll return a simple response
    const responseText = `I understand you're saying: "${message}". As an AI therapist, I'm here to help you explore your thoughts and feelings. Could you tell me more about what's on your mind?`;
    const response = { response: responseText };
    console.log('[API/chat] Response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API/chat] Chat API error:', error);
    return NextResponse.json(
      { response: '', error: 'Internal server error' },
      { status: 500 }
    );
  }
} 