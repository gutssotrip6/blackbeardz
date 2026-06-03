'use client';

import { useAudio } from '@/app/context/AudioContext';
import { getThemeColors } from '@/lib/theme';

export default function AudioToggle() {
  const { isPlaying, togglePlay, isReady } = useAudio();
  const colors = getThemeColors('primary');

  if (!isReady) return null;

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-full text-black hover:border-black transition-all duration-300 active:scale-95"
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
    >
      {isPlaying ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}