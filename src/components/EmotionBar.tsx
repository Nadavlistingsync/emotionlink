import { EmotionState } from '@/lib/interpretEEG';

interface EmotionBarProps {
  emotionState: EmotionState;
}

export default function EmotionBar({ emotionState }: EmotionBarProps) {
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'calm':
        return 'bg-blue-500';
      case 'anxious':
        return 'bg-yellow-500';
      case 'stressed':
        return 'bg-red-500';
      case 'focused':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Current Emotion: {emotionState.emotion}
        </span>
        <span className="text-sm text-gray-500">
          Intensity: {(emotionState.intensity * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getEmotionColor(emotionState.emotion)} transition-all duration-500`}
          style={{ width: `${emotionState.intensity * 100}%` }}
        />
      </div>
    </div>
  );
} 