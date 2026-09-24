"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { GlobeSculpture, GLOBE_RADIUS } from "./globe-sculpture";
import { GOLD } from "./materials";

const POINTER_LERP = 0.045;
const MAX_YAW = THREE.MathUtils.degToRad(16);
const MAX_PITCH = THREE.MathUtils.degToRad(9);
const IDLE_SPIN_SPEED = 0.045;
const BASE_TILT = 0.1;
// Yaw so Turkey (~35°E) faces the camera at rest instead of the sphere's
// default seam longitude — derived from the equirectangular UV mapping
// baked into the globe texture (phi = (lon+180)*pi/180, yaw = pi/2 - phi).
const TURKEY_YAW_OFFSET = -2.1817;

export function Scene({
  scrollProgress,
  pointer,
  reducedMotion,
  isTouch,
}: {
  scrollProgress: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  isTouch: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentTilt = useRef({ x: 0, y: 0 });
  const spin = useRef(TURKEY_YAW_OFFSET);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const targetZ = THREE.MathUtils.lerp(9.5, 8.85, reducedMotion ? 1 : scrollProgress.current);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2.2, delta);

    if (reducedMotion) {
      group.rotation.set(BASE_TILT, TURKEY_YAW_OFFSET, 0);
      return;
    }

    spin.current += delta * IDLE_SPIN_SPEED;

    if (!isTouch) {
      currentTilt.current.x += (pointer.current.y * MAX_PITCH - currentTilt.current.x) * POINTER_LERP;
      currentTilt.current.y += (pointer.current.x * MAX_YAW - currentTilt.current.y) * POINTER_LERP;
    }

    group.rotation.set(BASE_TILT + currentTilt.current.x, spin.current + currentTilt.current.y, 0);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3.2, 4.8, 4.5]} intensity={1.15} color="#f5f1e8" />
      <directionalLight position={[-5.4, -1.4, -3.2]} intensity={0.5} color="#7f94bf" />
      <Environment preset="night" environmentIntensity={0.5} blur={1.4} />
      <group ref={groupRef}>
        <GlobeSculpture progressRef={scrollProgress} isTouch={isTouch} reducedMotion={reducedMotion} />
        {!isTouch && (
          <Sparkles
            count={70}
            scale={[GLOBE_RADIUS * 4.2, GLOBE_RADIUS * 3.2, GLOBE_RADIUS * 4.2]}
            size={1.4}
            speed={0.12}
            opacity={0.22}
            color={GOLD}
            noise={0.4}
          />
        )}
      </group>
      {!isTouch && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.68} luminanceSmoothing={0.35} intensity={0.28} mipmapBlur />
          <Vignette offset={0.3} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}
