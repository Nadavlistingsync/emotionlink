import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Types for request and response
type EmotionRequest = {
  emotion: string;
  intensity: number;
};

type EmotionResponse = {
  message: string;
  explanation: string;
  suggestion: string;
};

// Validate request body
function validateRequest(body: unknown): body is EmotionRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'emotion' in body &&
    'intensity' in body &&
    typeof (body as any).emotion === 'string' &&
    typeof (body as any).intensity === 'number' &&
    (body as any).intensity >= 0 &&
    (body as any).intensity <= 100
  );
}

// Validate environment variables
function validateEnv() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return apiKey;
}

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Validate environment variables
    const apiKey = validateEnv();
    const openai = new OpenAI({ apiKey });

    // Parse and validate request body
    const body = await request.json();
    
    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: { emotion: string, intensity: number (0-100) }' },
        { status: 400 }
      );
    }

    // Create the prompt for GPT-4
    const prompt = `As a supportive AI therapist, respond to someone feeling ${body.emotion} with intensity level ${body.intensity}/100.
Please provide:
1. A brief, empathetic response (1-2 sentences)
2. A short explanation of what this emotion might mean (2-3 sentences)
3. A specific, actionable suggestion for managing this emotion (1-2 sentences)

Format your response exactly like this:
MESSAGE: [your empathetic response]
EXPLANATION: [your explanation]
SUGGESTION: [your suggestion]`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an empathetic AI therapist who provides supportive, personalized responses to help people understand and manage their emotions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse the response
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI model');
    }

    // Extract the different parts using regex
    const messageMatch = response.match(/MESSAGE: (.*?)(?=EXPLANATION:|$)/s);
    const explanationMatch = response.match(/EXPLANATION: (.*?)(?=SUGGESTION:|$)/s);
    const suggestionMatch = response.match(/SUGGESTION: (.*?)$/s);

    if (!messageMatch || !explanationMatch || !suggestionMatch) {
      throw new Error('Failed to parse AI response');
    }

    const emotionResponse: EmotionResponse = {
      message: messageMatch[1].trim(),
      explanation: explanationMatch[1].trim(),
      suggestion: suggestionMatch[1].trim(),
    };

    return NextResponse.json(emotionResponse);
  } catch (error) {
    console.error('Error in emotion interpretation:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'Error communicating with AI service' },
        { status: 503 }
      );
    }

    // Handle environment variable errors
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 