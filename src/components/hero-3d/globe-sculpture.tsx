"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  buildGlobePlates,
  buildBorderStrokes,
  STROKE_THICKNESS_FACTOR,
  type GlobeShard,
  type BorderStroke,
} from "./globe-geometry";
import { createWorldMaterialMaps } from "./world-texture";
import { GOLD_EMISSIVE, GLOBE_OCEAN, GLOBE_LAND, CHIP_BODY } from "./materials";
import { smoothstep, mulberry32 } from "./sculpture-math";
import { DISPLACEMENT_SCALE_FACTOR } from "./elevation";

export const GLOBE_RADIUS = 1.85;

const PLATE_STAGGER = 0.55;
const DEBRIS_STAGGER = 0.45;
const ZERO = new THREE.Vector3(0, 0, 0);
const SWIRL_AXIS = new THREE.Vector3(0, 1, 0);

function PlateMesh({
  shard,
  index,
  total,
  progressRef,
  material,
}: {
  shard: GlobeShard;
  index: number;
  total: number;
  progressRef: RefObject<number>;
  material: THREE.Material;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const { startOffset, startRotation, delay } = useMemo(() => {
    const rng = mulberry32(index * 7919 + 13);
    const dir = shard.centroid.clone().normalize();
    const jitter = new THREE.Vector3(
      (rng() - 0.5) * GLOBE_RADIUS * 0.16,
      (rng() - 0.5) * GLOBE_RADIUS * 0.16,
      (rng() - 0.5) * GLOBE_RADIUS * 0.16,
    );
    const offset = dir
      .clone()
      .multiplyScalar(GLOBE_RADIUS * (0.26 + rng() * 0.32))
      .add(jitter);
    offset.applyAxisAngle(SWIRL_AXIS, (rng() - 0.5) * 0.5);
    const rotation = new THREE.Euler((rng() - 0.5) * 0.9, (rng() - 0.5) * 0.9, (rng() - 0.5) * 0.9);
    return { startOffset: offset, startRotation: rotation, delay: (index / total) * PLATE_STAGGER };
  }, [shard, index, total]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const overall = progressRef.current;
    const local = smoothstep(THREE.MathUtils.clamp((overall - delay) / (1 - PLATE_STAGGER), 0, 1));
    const settle = 1 - local;

    const t = state.clock.elapsedTime;
    const driftSeed = index * 12.9898;
    const idleX = Math.sin(t * 0.35 + driftSeed) * 0.045 * settle;
    const idleY = Math.cos(t * 0.28 + driftSeed * 1.7) * 0.045 * settle;
    const idleZ = Math.sin(t * 0.31 + driftSeed * 0.6) * 0.045 * settle;

    mesh.position.lerpVectors(startOffset, ZERO, local);
    mesh.position.x += idleX;
    mesh.position.y += idleY;
    mesh.position.z += idleZ;

    mesh.rotation.x = THREE.MathUtils.lerp(startRotation.x, 0, local);
    mesh.rotation.y = THREE.MathUtils.lerp(startRotation.y, 0, local);
    mesh.rotation.z = THREE.MathUtils.lerp(startRotation.z, 0, local);
  });

  return <mesh ref={ref} geometry={shard.geometry} material={material} />;
}

const STROKE_THICKNESS = GLOBE_RADIUS * STROKE_THICKNESS_FACTOR;
// While a rod is still in flight (settle=1) it's stretched far past its real
// chord length so it reads as a long streak crossing the sky; as it settles
// onto the globe (settle -> 0) it shrinks back down to its true border length.
const FLIGHT_STRETCH = 9;

function LineField({
  strokes,
  progressRef,
  material,
}: {
  strokes: BorderStroke[];
  progressRef: RefObject<number>;
  material: THREE.Material;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef<THREE.Object3D | null>(null);
  const settledRef = useRef(false);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = (dummyRef.current ??= new THREE.Object3D());
    const overall = progressRef.current;
    // Once every stroke has fully arrived, its matrix is constant (idle
    // drift only plays while still settling) — skip the per-instance loop
    // entirely rather than redoing thousands of identical matrix writes
    // every frame.
    if (settledRef.current && overall >= 1) return;
    settledRef.current = overall >= 1;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < strokes.length; i++) {
      const stroke = strokes[i];
      const local = smoothstep(THREE.MathUtils.clamp((overall - stroke.delay) / (1 - DEBRIS_STAGGER), 0, 1));
      const settle = 1 - local;

      const idle = Math.sin(t * stroke.driftSpeed + stroke.driftPhase) * 0.12 * settle;

      dummy.position.lerpVectors(stroke.launchPos, stroke.homePos, local);
      dummy.position.x += idle;
      dummy.position.y += idle * 0.7;

      dummy.quaternion.slerpQuaternions(stroke.launchQuat, stroke.homeQuat, local);
      const flightStretch = 1 + settle * (FLIGHT_STRETCH - 1) * stroke.flightIntensity;
      // Only the "major" (flightIntensity 1) rods stay visible for the whole
      // flight — they're the handful of long streaks that read as motion.
      // Every other rod stays essentially invisible (thickness ~0) until it's
      // most of the way home, then thickens into a normal rod — so the sky
      // never has to hold thousands of dashes at once, only a curated few,
      // while the full final density still resolves in as everything lands.
      const thicknessScale =
        stroke.flightIntensity > 0.5 ? 1 : smoothstep(THREE.MathUtils.clamp((local - 0.35) / 0.5, 0, 1));
      const thickness = STROKE_THICKNESS * thicknessScale;
      dummy.scale.set(Math.max(stroke.length * flightStretch, 0.001), thickness, thickness);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, strokes.length]} material={material}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

export function GlobeSculpture({
  progressRef,
  isTouch,
  reducedMotion,
}: {
  progressRef: RefObject<number>;
  isTouch: boolean;
  reducedMotion: boolean;
}) {
  const cols = isTouch ? 6 : 9;
  const rows = isTouch ? 4 : 6;
  // High enough to keep the noise-driven terrain displacement reading as
  // smooth relief rather than faceted, low-poly spikes at the silhouette.
  const widthSegments = isTouch ? 64 : 160;
  const heightSegments = isTouch ? 40 : 100;
  // Max chord deviation (fraction of radius) a rod may drift from the real
  // coastline/border curve. Kept tight for real fidelity to the actual
  // coastline/border shape — do not loosen this to cut rod count. Straight
  // stretches (coasts, borders following rivers/parallels) still naturally
  // collapse into a handful of long rods via MAX_SPAN_POINTS below; only
  // genuinely curvy stretches (deltas, straits, fjords) produce many short
  // ones, which is correct — that's real detail, not clutter.
  const strokeDeviation = GLOBE_RADIUS * (isTouch ? 0.005 : 0.0022);

  const plates = useMemo(
    () => buildGlobePlates(GLOBE_RADIUS, cols, rows, widthSegments, heightSegments),
    [cols, rows, widthSegments, heightSegments],
  );
  useEffect(() => () => plates.forEach((s) => s.geometry.dispose()), [plates]);

  const strokes = useMemo(() => buildBorderStrokes(GLOBE_RADIUS, strokeDeviation), [strokeDeviation]);

  const maps = useMemo(() => createWorldMaterialMaps(GLOBE_OCEAN, GLOBE_LAND), []);
  useEffect(
    () => () => {
      maps.colorMap.dispose();
      maps.transmissionMap.dispose();
      maps.roughnessMap.dispose();
      maps.metalnessMap.dispose();
      maps.elevationMap.dispose();
    },
    [maps],
  );

  const material = useMemo(() => {
    const displacementScale = GLOBE_RADIUS * DISPLACEMENT_SCALE_FACTOR;
    const mat = new THREE.MeshPhysicalMaterial({
      map: maps.colorMap,
      roughnessMap: maps.roughnessMap,
      metalnessMap: maps.metalnessMap,
      bumpMap: maps.elevationMap,
      bumpScale: 0.34,
      displacementMap: maps.elevationMap,
      displacementScale,
      displacementBias: -displacementScale * 0.5,
      roughness: 1,
      metalness: 0.45,
      clearcoat: 0.22,
      clearcoatRoughness: 0.4,
      clearcoatRoughnessMap: maps.roughnessMap,
      envMapIntensity: 0.55,
    });
    if (!isTouch) {
      mat.transmissionMap = maps.transmissionMap;
      mat.transmission = 1;
      mat.thickness = GLOBE_RADIUS * 0.5;
      mat.ior = 1.4;
      mat.attenuationColor = new THREE.Color("#caa86b");
      mat.attenuationDistance = GLOBE_RADIUS * 1.6;
      mat.needsUpdate = true;
    }
    return mat;
  }, [maps, isTouch]);
  useEffect(() => () => material.dispose(), [material]);

  const lineMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CHIP_BODY),
        emissive: new THREE.Color(GOLD_EMISSIVE),
        emissiveIntensity: 0.62,
        metalness: 0.55,
        roughness: 0.4,
        clearcoat: 0.25,
        clearcoatRoughness: 0.35,
        envMapIntensity: 0.6,
      }),
    [],
  );
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);

  const settledProgressRef = useRef(1);

  if (reducedMotion) {
    return (
      <>
        <mesh material={material}>
          <sphereGeometry args={[GLOBE_RADIUS, widthSegments, heightSegments]} />
        </mesh>
        <LineField strokes={strokes} progressRef={settledProgressRef} material={lineMaterial} />
      </>
    );
  }

  return (
    <>
      {plates.map((shard, i) => (
        <PlateMesh key={i} shard={shard} index={i} total={plates.length} progressRef={progressRef} material={material} />
      ))}
      <LineField strokes={strokes} progressRef={progressRef} material={lineMaterial} />
    </>
  );
}
