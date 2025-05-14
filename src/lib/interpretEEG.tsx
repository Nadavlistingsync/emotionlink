import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type EmotionState = {
  emotion: string;
  intensity: number;
  timestamp: string;
};

const EEGContext = createContext<EmotionState | undefined>(undefined);

export function EEGProvider({ children }: { children: ReactNode }) {
  const [emotionState, setEmotionState] = useState<EmotionState | undefined>(undefined);

  useEffect(() => {
    // Connect to real EEG WebSocket here
    const ws = new WebSocket('ws://localhost:8765'); // Update with actual device port if needed
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.emotion && typeof data.intensity === 'number') {
          setEmotionState({
            emotion: data.emotion,
            intensity: data.intensity,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Invalid EEG emotion data:', event.data);
      }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    return () => ws.close();
  }, []);

  return <EEGContext.Provider value={emotionState}>{children}</EEGContext.Provider>;
}

export function useEEG() {
  const context = useContext(EEGContext);
  if (!context) throw new Error('useEEG must be used within an EEGProvider');
  return context;
} 