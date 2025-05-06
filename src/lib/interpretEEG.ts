import sampleEEG from '@/data/sampleEEG.json';

export type EmotionState = {
  emotion: string;
  intensity: number;
  timestamp: string;
};

export function getCurrentEmotion(): EmotionState {
  // In a real app, this would analyze real-time EEG data
  // For now, we'll simulate by cycling through our sample data
  const now = new Date();
  const data = sampleEEG.data;
  
  // Get the most recent entry before current time
  const currentEntry = data.reduce((prev, curr) => {
    const prevTime = new Date(prev.timestamp).getTime();
    const currTime = new Date(curr.timestamp).getTime();
    const nowTime = now.getTime();
    
    if (currTime <= nowTime && currTime > prevTime) {
      return curr;
    }
    return prev;
  }, data[0]);

  return {
    emotion: currentEntry.emotion,
    intensity: currentEntry.intensity,
    timestamp: currentEntry.timestamp
  };
} 