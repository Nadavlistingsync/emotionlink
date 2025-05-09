import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, emotion, intensity } = await request.json();

    const prompt = `You are an empathetic therapist chatbot. The user is currently feeling ${emotion} with an intensity of ${(intensity * 100).toFixed(0)}%.\n
    They have sent you the following message: "${message}"\n
    Your goals:\n- Respond in a supportive, understanding, and non-judgmental way.\n- Reference their current emotion and intensity.\n- Ask gentle follow-up questions to help them open up.\n- Offer actionable advice or coping strategies if appropriate.\n- Keep your response concise and focused on emotional support.\n- If the user seems in distress, encourage them to reach out to a trusted person or professional.\n`;

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