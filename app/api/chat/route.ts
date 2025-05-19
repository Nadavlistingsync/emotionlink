import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Error feedback loop with detailed logging
const logError = (error: any, context: string) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

// Validate request body
function validateRequest(body: any): body is { message: string; emotion: string; intensity: number } {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof body.message === 'string' &&
    typeof body.emotion === 'string' &&
    typeof body.intensity === 'number' &&
    body.intensity >= 0 &&
    body.intensity <= 1
  );
}

export async function POST(request: Request) {
  try {
    console.log('[API/chat] Incoming request');
    
    const body = await request.json();
    console.log('[API/chat] Request body:', body);

    if (!validateRequest(body)) {
      console.warn('[API/chat] Invalid request body');
      return NextResponse.json(
        { response: '', error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { message, emotion, intensity } = body;

    // Enhanced prompt for more consistent AI responses
    const prompt = `You are an empathetic AI therapist chatbot. The user is currently feeling ${emotion} with an intensity of ${(intensity * 100).toFixed(0)}%.
They have sent you the following message: "${message}"

Your response should:
1. Be 100% AI-generated and maintain a consistent therapeutic tone
2. Acknowledge their current emotion and intensity level
3. Provide empathetic support and understanding
4. Ask relevant follow-up questions to encourage deeper conversation
5. Offer practical coping strategies if appropriate
6. Keep responses concise (2-3 sentences) and focused
7. If the user seems in distress, encourage professional help
8. Never reveal that you are an AI - maintain the role of a supportive therapist

Format your response in a natural, conversational way.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system',
          content: 'You are an empathetic AI therapist focused on providing supportive, understanding responses while maintaining a consistent therapeutic presence.'
        },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      max_tokens: 200,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error('No response generated from AI model');
    }

    const response = { response: aiResponse };
    console.log('[API/chat] Response:', response);
    return NextResponse.json(response);
  } catch (error) {
    logError(error, 'API/chat');
    return NextResponse.json(
      { response: '', error: 'Internal server error' },
      { status: 500 }
    );
  }
} 