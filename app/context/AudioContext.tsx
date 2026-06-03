'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  isReady: boolean;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  togglePlay: () => {},
  isReady: false,
});

// Module-level singleton - exists outside React lifecycle
let globalAudio: HTMLAudioElement | null = null;

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isSetup = useRef(false);

  useEffect(() => {
    if (isSetup.current) return;
    isSetup.current = true;

    // Create audio only once globally
    if (!globalAudio) {
      globalAudio = new Audio('/ambient.mp3');
      globalAudio.loop = true;
      globalAudio.volume = 0.3;
    }

    const audio = globalAudio;

    // State sync
    const updateState = () => setIsPlaying(!audio.paused);
    
    audio.addEventListener('play', updateState);
    audio.addEventListener('pause', updateState);

    // Auto-start immediately
    const startAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setIsReady(true);
      } catch {
        // Autoplay blocked - wait for interaction
        const handleClick = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch {}
          document.removeEventListener('click', handleClick);
        };
        document.addEventListener('click', handleClick);
        setIsReady(true);
      }
    };

    startAudio();

    return () => {
      audio.removeEventListener('play', updateState);
      audio.removeEventListener('pause', updateState);
    };
  }, []);

  // Stable toggle function
  const togglePlay = useCallback(() => {
    if (!globalAudio) return;
    
    if (globalAudio.paused) {
      globalAudio.play().catch(() => {});
    } else {
      globalAudio.pause();
    }
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay, isReady }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);