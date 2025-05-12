import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log('[API/chat] Incoming request');
    const supabase = createSupabaseServerClient();
    
    // Check if user is authenticated using getUser() for better security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('[API/chat] User:', { user, userError });
    if (userError || !user) {
      console.warn('[API/chat] Unauthorized access attempt', { userError });
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

    // Build the prompt for OpenAI
    const prompt = `You are an empathetic therapist chatbot. The user is currently feeling ${emotion} with an intensity of ${(intensity * 100).toFixed(0)}%.
They have sent you the following message: "${message}"
Your goals:
- Respond in a supportive, understanding, and non-judgmental way.
- Reference their current emotion and intensity.
- Ask gentle follow-up questions to help them open up.
- Offer actionable advice or coping strategies if appropriate.
- Keep your response concise and focused on emotional support.
- If the user seems in distress, encourage them to reach out to a trusted person or professional.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0].message.content;
    const response = { response: aiResponse };
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