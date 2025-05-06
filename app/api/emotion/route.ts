import { NextResponse } from 'next/server';

const emotions = ["happy", "sad", "neutral", "anxious"] as const;

export async function GET() {
  // Get random emotion
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  
  // Get random intensity between 0.4 and 1.0
  const intensity = Math.random() * 0.6 + 0.4;
  
  // Simulate a small delay to mimic real EEG processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return NextResponse.json({
    emotion,
    intensity: Number(intensity.toFixed(2))
  });
} 