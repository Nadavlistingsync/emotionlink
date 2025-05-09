import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type EmotionState = {
  emotion: string;
  intensity: number;
  timestamp: string;
};

const EMOTIONS = ['Calm', 'Anxious', 'Stressed', 'Focused'];

function getRandomEmotion(): EmotionState {
  const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
  const intensity = Math.random();
  return {
    emotion,
    intensity,
    timestamp: new Date().toISOString(),
  };
}

const EEGContext = createContext<EmotionState | undefined>(undefined);

export function EEGProvider({ children }: { children: ReactNode }) {
  const [emotionState, setEmotionState] = useState<EmotionState>(getRandomEmotion());

  useEffect(() => {
    const interval = setInterval(() => {
      setEmotionState(getRandomEmotion());
    }, 5000); // update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return <EEGContext.Provider value={emotionState}>{children}</EEGContext.Provider>;
}

export function useEEG() {
  const context = useContext(EEGContext);
  if (!context) throw new Error('useEEG must be used within an EEGProvider');
  return context;
} 