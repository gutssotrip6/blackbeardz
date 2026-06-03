// components/ui/LogoContainer.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import LogoFallback from './LogoFallback';

// Dynamically import Logo3D to avoid SSR issues with Three.js
const Logo3D = dynamic(() => import('../Logo3D'), {
  ssr: false,
  loading: () => null // Canvas handles its own fallback
});

export default function LogoContainer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LogoFallback />;
  }

  return (
    <Suspense fallback={<LogoFallback />}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={5} />
        <directionalLight intensity={2} position={[5, 5, 5]} />
        <directionalLight intensity={2} position={[-5, 5, 5]} />
        <Logo3D />
      </Canvas>
    </Suspense>
  );
}