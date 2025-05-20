import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with error handling
let openai: OpenAI;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
  throw error;
}

// Enhanced error feedback loop with detailed logging
const logError = (error: any, context: string) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    type: error.name,
    code: error.code,
  };
  console.error(`[${context}] Error:`, errorDetails);
  return errorDetails;
};

// Validate request body with detailed error messages
function validateRequest(body: any): { isValid: boolean; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { isValid: false, error: 'Request body must be an object' };
  }
  if (typeof body.message !== 'string') {
    return { isValid: false, error: 'Message must be a string' };
  }
  if (typeof body.emotion !== 'string') {
    return { isValid: false, error: 'Emotion must be a string' };
  }
  if (typeof body.intensity !== 'number') {
    return { isValid: false, error: 'Intensity must be a number' };
  }
  if (body.intensity < 0 || body.intensity > 1) {
    return { isValid: false, error: 'Intensity must be between 0 and 1' };
  }
  return { isValid: true };
}

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/chat] [${requestId}] Incoming request`);
  
  try {
    const body = await request.json();
    console.log(`[API/chat] [${requestId}] Request body:`, body);

    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.warn(`[API/chat] [${requestId}] Invalid request:`, validation.error);
      return NextResponse.json(
        { response: '', error: validation.error },
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

    console.log(`[API/chat] [${requestId}] Sending request to OpenAI`);
    
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
    console.log(`[API/chat] [${requestId}] Successfully generated response`);
    return NextResponse.json(response);
  } catch (error: any) {
    const errorDetails = logError(error, `API/chat [${requestId}]`);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          response: '', 
          error: 'Error communicating with AI service',
          details: errorDetails
        },
        { status: 503 }
      );
    }

    // Handle environment variable errors
    if (error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { 
          response: '', 
          error: 'AI service is not properly configured',
          details: errorDetails
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        response: '', 
        error: 'Internal server error',
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 