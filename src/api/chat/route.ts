import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, emotion, intensity } = await request.json();

    const prompt = `You are an empathetic therapist chatbot. The user is currently feeling ${emotion} with an intensity of ${intensity * 100}%. 
    They have sent you the following message: "${message}"
    
    Please respond in a supportive and understanding way, taking into account their current emotional state. 
    Keep your response concise and focused on emotional support.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 150,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 