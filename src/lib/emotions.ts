export type EmotionInterpretation = {
  message: string;
  explanation: string;
  suggestion: string;
};

export async function interpretEmotion(emotion: string, intensity: number): Promise<EmotionInterpretation> {
  try {
    const response = await fetch('/api/interpretEmotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotion,
        intensity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to interpret emotion');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error interpreting emotion:', error);
    throw error;
  }
} 