// Shared elevation model, used by both the baked terrain texture
// (world-texture.ts, per-pixel over the whole globe) and the border/coastline
// rods (globe-geometry.ts, per-point along each line) — keeping both in one
// place guarantees a border rod always lands at the same height as the
// terrain directly beneath it, instead of the two drifting out of sync.

// Low frequency so only a handful of broad, continent-scale ranges appear
// per hemisphere — a higher scale here reads as noisy pixel-level static
// once actually pushed out in 3D at real displacement scale, not terrain.
export const ELEV_NOISE_SCALE = 3;

// How far vertex displacement pushes terrain relative to the sphere radius.
// Bumped up so mountain ranges read as real elevation, not just faint bump-map
// shading — kept in one place so the border rods (globe-geometry.ts) and the
// sphere mesh (globe-sculpture.tsx) always displace by the exact same amount.
export const DISPLACEMENT_SCALE_FACTOR = 0.055;

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const top = hash2(xi, yi) + (hash2(xi + 1, yi) - hash2(xi, yi)) * u;
  const bottom = hash2(xi, yi + 1) + (hash2(xi + 1, yi + 1) - hash2(xi, yi + 1)) * u;
  return top + (bottom - top) * v;
}

export function fbm(x: number, y: number, octaves: number): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.15;
  }
  return sum / norm;
}

/** Ridged mountain-range-scale relief, 0..1, for a point on land. */
export function landElevation01(u: number, v: number): number {
  const nx = u * ELEV_NOISE_SCALE;
  const ny = v * ELEV_NOISE_SCALE * 0.5;
  const raw = fbm(nx, ny, 4);
  const ridged = 1 - Math.abs(raw * 2 - 1);
  return 0.24 + Math.pow(ridged, 1.15) * 0.76;
}

/** Gentle ocean floor undulation, 0..1, for a point at sea. */
export function oceanElevation01(u: number, v: number): number {
  const nx = u * ELEV_NOISE_SCALE;
  const ny = v * ELEV_NOISE_SCALE * 0.5;
  const raw = fbm(nx, ny, 2);
  return 0.4 + (raw - 0.5) * 0.14;
}

/** Maps a 0..1 elevation value to an actual displaced radius, matching the
 * MeshPhysicalMaterial's displacementScale/displacementBias exactly. */
export function displacedRadius(radius: number, elevation01: number): number {
  const scale = radius * DISPLACEMENT_SCALE_FACTOR;
  const bias = -scale * 0.5;
  return radius + bias + elevation01 * scale;
}
