import { getCurrentEmotion } from './interpretEEG.tsx';

describe('getCurrentEmotion', () => {
  it('should return the most recent emotion state', () => {
    const emotionState = getCurrentEmotion();
    expect(emotionState).toHaveProperty('emotion');
    expect(emotionState).toHaveProperty('intensity');
    expect(emotionState).toHaveProperty('timestamp');
    expect(typeof emotionState.emotion).toBe('string');
    expect(typeof emotionState.intensity).toBe('number');
    expect(typeof emotionState.timestamp).toBe('string');
  });
}); 