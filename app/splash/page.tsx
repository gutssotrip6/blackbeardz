'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Logo3D from '../components/Logo3D';

// Detect iOS and Mobile - use feature detection for more reliability
const IS_IOS = typeof navigator !== 'undefined' && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

// Check if mobile using user agent for iOS, screen size for others
const IS_MOBILE_DEVICE = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const IS_SMALL_SCREEN = typeof window !== 'undefined' && window.innerWidth < 768;

const LIGHTS = (
  <>
    <ambientLight intensity={2} />
    <directionalLight position={[5, 5, 5]} intensity={3} />
    <pointLight position={[0, 0, 10]} intensity={4} />
  </>
);

// Memoized 3D scene - frameloop always to prevent pausing
const LogoScene = memo(function LogoScene() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ 
        alpha: true, 
        antialias: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 1.5]}
      frameloop="always"
    >
      {LIGHTS}
      <Logo3D />
    </Canvas>
  );
});

// Optimized canvas fallback
const FallbackCanvas = memo(function FallbackCanvas({ onReady }: { onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let resizeTimeout: NodeJS.Timeout;
    const resize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);
      }, 100);
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting && frameRef.current === undefined) animate();
    });
    observer.observe(canvas);

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let hue = 220;
    let lastTime = performance.now();
    
    const animate = (currentTime = performance.now()) => {
      if (currentTime - lastTime < 33) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;
      if (!isVisibleRef.current) { frameRef.current = undefined; return; }

      hue = (hue + 0.3) % 360;
      const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      gradient.addColorStop(0, `hsl(${hue}, 60%, 10%)`);
      gradient.addColorStop(0.5, `hsl(${hue + 20}, 50%, 5%)`);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    const timer = setTimeout(onReady, 1200);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [onReady]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10"
      style={{ contain: 'strict' }}
    />
  );
});

export default function Page() {
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedRef = useRef(false);
  const router = useRouter();

  // Determine video source once on mount - prioritize iOS detection
  const getVideoSrc = useCallback(() => {
    // Force mobile version for iOS regardless of screen size
    if (IS_IOS || IS_MOBILE_DEVICE) {
      return { src: '/splashmob.mp4', type: 'video/mp4', isMobile: true };
    }
    // Desktop gets webm for better quality, mp4 fallback
    return { src: '/splashdesk.webm#t=0.1', type: 'video/webm;codecs=vp9,opus', isMobile: false };
  }, []);

  const videoConfig = getVideoSrc();

  const handleEnter = useCallback(() => {
    document.cookie = 'visited=true; path=/; max-age=2592000; SameSite=Lax';
    localStorage.setItem('visited', 'true');
    setIsExiting(true);
    setTimeout(() => window.location.href = '/', 500);
  }, []);

  useEffect(() => {
    router.prefetch('/');
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari specific attributes
    if (IS_IOS) {
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('muted', 'true');
    }

    const handlers = {
      canplay: () => setVideoLoaded(true),
      error: () => !hasEndedRef.current && setVideoError(true),
      ended: () => {
        if (!hasEndedRef.current) {
          hasEndedRef.current = true;
          setShowContent(true);
        }
      },
      timeupdate: () => {
        if (hasEndedRef.current || !video.duration) return;
        if (video.duration - video.currentTime < 0.25) {
          hasEndedRef.current = true;
          setShowContent(true);
        }
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    const attemptPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.log('Video play failed:', err);
        // On iOS, if autoplay fails, trigger fallback
        if (IS_IOS) {
          setVideoError(true);
        } else {
          const unlock = () => {
            video.play().catch(() => {});
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('click', unlock);
          };
          document.addEventListener('touchstart', unlock, { once: true, passive: true });
          document.addEventListener('click', unlock, { once: true });
        }
      }
    };

    // Delay play attempt slightly for iOS
    const playTimer = setTimeout(attemptPlay, IS_IOS ? 300 : 100);
    
    // Fallback timer - show content after 8 seconds regardless
    const fallbackTimer = setTimeout(() => {
      if (!hasEndedRef.current) {
        hasEndedRef.current = true;
        setShowContent(true);
      }
    }, 8000);

    return () => {
      clearTimeout(playTimer);
      clearTimeout(fallbackTimer);
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [router]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black touch-none isolate">
      
      <div 
        className={`absolute inset-0 bg-black z-50 will-change-opacity transition-opacity duration-500 ${
          isExiting ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {videoError && <FallbackCanvas onReady={() => setShowContent(true)} />}

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/splash-poster.jpg"
        crossOrigin="anonymous"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 h-full w-full object-cover z-10 splash-video"
        style={{
          opacity: videoLoaded && !videoError ? 1 : 0,
          transition: 'opacity 300ms ease-out',
          display: videoError ? 'none' : 'block',
          willChange: 'opacity',
        }}
        // Use direct src attribute for iOS reliability instead of only source tags
        src={videoConfig.src}
      >
        {/* Fallback sources for non-iOS browsers */}
        {!videoConfig.isMobile && (
          <>
            <source src="/splashdesk.webm#t=0.1" type="video/webm;codecs=vp9,opus" />
            <source src="/splashdesk.mp4" type="video/mp4" />
          </>
        )}
        {videoConfig.isMobile && (
          <source src="/splashmob.mp4" type="video/mp4" />
        )}
      </video>

      {/* REMOVED: Loading spinner that was here */}

      {showContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 animate-fade-in">
          <div className="relative w-[min(80vw,500px)] aspect-square">
            <LogoScene />
          </div>

          <button
            onClick={handleEnter}
            className="relative z-50 mt-8 px-10 py-3 text-base md:text-lg tracking-[0.3em] uppercase text-white rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-200 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer will-change-transform"
          >
            <span className="relative z-10">Enter Experience</span>
            <span className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-60 animate-pulse" />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { 
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .splash-video {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .splash-video::-webkit-media-controls {
          display: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none; opacity: 1; }
          .animate-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}
