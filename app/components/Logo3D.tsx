// components/Logo3D.tsx
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

useGLTF.preload('/logo.glb');

export default function Logo3D(props: React.JSX.IntrinsicElements['group']) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF('/logo.glb');

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useMemo(() => {
    clonedScene.rotation.x = Math.PI / 2;
    clonedScene.rotation.y = 0;
    clonedScene.rotation.z = 0;
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clonedScene} scale={0.6} />
    </group>
  );
}