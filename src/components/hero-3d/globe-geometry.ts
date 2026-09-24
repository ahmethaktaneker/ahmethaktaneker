import * as THREE from "three";
import { mulberry32 } from "./sculpture-math";
import { landElevation01, oceanElevation01, displacedRadius } from "./elevation";
import outlineData from "./world-outline-data.json";

const { coastline, borders } = outlineData as {
  land: number[][];
  coastline: number[][];
  borders: number[][];
};

export type GlobeShard = {
  geometry: THREE.BufferGeometry;
  centroid: THREE.Vector3;
};

/**
 * Splits a sphere into a clean grid of latitude/longitude panels (built as
 * native partial-sphere patches, not a bucketed triangle soup) so seams
 * read as precise geodesic panel lines rather than a jagged saw-tooth tear.
 */
export function buildGlobePlates(
  radius: number,
  cols: number,
  rows: number,
  widthSegments: number,
  heightSegments: number,
): GlobeShard[] {
  const colSegs = Math.max(1, Math.round(widthSegments / cols));
  const rowSegs = Math.max(1, Math.round(heightSegments / rows));
  const shards: GlobeShard[] = [];

  for (let row = 0; row < rows; row++) {
    const thetaStart = (row / rows) * Math.PI;
    const thetaLength = Math.PI / rows;

    for (let col = 0; col < cols; col++) {
      const phiStart = (col / cols) * Math.PI * 2;
      const phiLength = (Math.PI * 2) / cols;

      const geo = new THREE.SphereGeometry(radius, colSegs, rowSegs, phiStart, phiLength, thetaStart, thetaLength);

      // SphereGeometry's uv attribute is local 0..1 within the patch, and
      // three.js stores uv.y as (1 - vLocal) internally (see
      // SphereGeometry.js: `uvs.push(u + uOffset, 1 - v)`). Undo that flip
      // before remapping back to the full equirectangular 0..1 range, or
      // every patch samples the baked world texture mirrored vertically —
      // producing a hard seam/band at every row boundary.
      const uv = geo.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) {
        const vLocal = 1 - uv.getY(i);
        const globalU = (phiStart + uv.getX(i) * phiLength) / (Math.PI * 2);
        // Inverse of uvToSphere's (1 - v) * PI flip, so the baked color/
        // elevation textures land on the exact same (now north-up) latitude
        // as the border strokes.
        const globalV = 1 - (thetaStart + vLocal * thetaLength) / Math.PI;
        uv.setXY(i, globalU, globalV);
      }
      uv.needsUpdate = true;

      const position = geo.getAttribute("position");
      const centroid = new THREE.Vector3();
      for (let i = 0; i < position.count; i++) {
        centroid.x += position.getX(i);
        centroid.y += position.getY(i);
        centroid.z += position.getZ(i);
      }
      centroid.divideScalar(position.count);

      shards.push({ geometry: geo, centroid });
    }
  }

  return shards;
}

// Single source of truth for rod cross-section thickness (relative to
// radius) — shared with globe-sculpture.tsx so the joint plugs added below
// are always sized to exactly match the rods they're patching.
export const STROKE_THICKNESS_FACTOR = 0.0033;

export type BorderStroke = {
  homePos: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  length: number;
  launchPos: THREE.Vector3;
  launchQuat: THREE.Quaternion;
  driftPhase: number;
  driftSpeed: number;
  delay: number;
  flightIntensity: number;
};

function uvToSphere(u: number, v: number, radius: number): THREE.Vector3 {
  const phi = u * Math.PI * 2;
  // v = (90 - lat) / 180 (see build-world-outline.mjs), so v=0 is the north
  // pole. THREE.SphereGeometry's own vertex formula uses theta = v*thetaLength
  // with theta=0 at +Y (top) — so theta = v*PI directly already puts the
  // north pole at the sphere's top with no flip needed. buildGlobePlates's
  // UV remap independently accounts for CanvasTexture's flipY when sampling
  // the continent texture; this function places raw 3D geometry and must
  // NOT apply that same flip, or every border/coastline point lands
  // latitude-mirrored relative to the (correctly oriented) continent map.
  const theta = v * Math.PI;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function pointSegmentDistance(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3): number {
  const ab = b.clone().sub(a);
  const lenSq = ab.lengthSq();
  if (lenSq < 1e-12) return p.distanceTo(a);
  const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / lenSq, 0, 1);
  const closest = a.clone().add(ab.multiplyScalar(t));
  return p.distanceTo(closest);
}

/**
 * Walks every real coastline/border polyline and turns it into a chain of
 * straight rods, extending each rod through as many source points as
 * possible while every skipped point stays within `maxDeviation` of the
 * straight chord (in 3D, on the sphere) — so rods run long across genuinely
 * straight stretches (reading as clean lines, not dots) but stay short
 * through tight curves like straits and deltas, instead of a fixed skip
 * cutting a chord straight across open water. Every rod in a chain shares
 * its neighbour's endpoint, so once flown in they abut into a single
 * continuous outline that actually hugs the real coastline.
 */
export function buildBorderStrokes(radius: number, maxDeviation: number): BorderStroke[] {
  const rng = mulberry32(90210);

  // Interior political borders sit deep inside land on both sides, so the
  // land elevation formula matches the rendered surface right under them.
  // A coastline is different: it's the exact seam between the land and
  // ocean textures, and the baked mask/texture right at that seam often
  // rasterizes a given pixel as ocean (lower, flatter elevation) even where
  // our vector data calls it land — so a coastline rod that always assumes
  // the (usually taller) land formula ends up perched above the actually-
  // rendered surface right beneath it. Averaging land and ocean elevation
  // for coastline points keeps the rod close to sea level, which is where
  // real coastlines sit anyway, so it hugs whichever texture the GPU
  // actually paints there instead of floating above it.
  // Interior land uses the ridged fbm formula at full amplitude (0.24..1.0,
  // steep peak-to-peak swings), so the rendered mesh — a coarse 160x100
  // vertex grid interpolating that same noise — can locally land a hair
  // above what this rod's own two straight-line endpoints computed, sinking
  // the rod invisibly into the terrain mid-span (seen on long interior
  // borders like Brazil's or India's). Coastal points blend down to a much
  // gentler ocean-level curve, so they need only a thin margin to avoid
  // floating; interior land needs a much more generous one to never be
  // swallowed by its own higher-amplitude relief.
  const coastalClearance = radius * 0.0004;
  const landClearance = radius * 0.002;
  const pointRadius = (u: number, v: number, coastal: boolean) => {
    const elevation = coastal ? (landElevation01(u, v) + oceanElevation01(u, v)) / 2 : landElevation01(u, v);
    const clearance = coastal ? coastalClearance : landClearance;
    return displacedRadius(radius, elevation) + clearance;
  };
  const strokes: BorderStroke[] = [];

  // Shared by both a straight rod and a corner joint plug: handles the
  // flight-in launch scatter and drift so every piece of the outline
  // (whether a long chord or a tiny corner cube) animates consistently.
  const pushStroke = (homePos: THREE.Vector3, homeQuat: THREE.Quaternion, drawLength: number) => {
    const normal = homePos.clone().normalize();

    // Only a minority of rods play the dramatic long-streak flight — with
    // every rod doing it at once, the pre-assembly sky reads as a dense ball
    // of yarn instead of a handful of clean streaks. The rest still fly in,
    // just held close to their own home patch of sky (see flightIntensity
    // use in globe-sculpture.tsx), so the scene stays readable while still
    // showing motion everywhere.
    const flightIntensity = rng() < 0.05 ? 1 : 0.1 + rng() * 0.12;

    // Keep the launch scatter tight and local to each rod's own patch of
    // sky above the globe (a small cone + modest outward push), not a
    // wide-angle scatter that reads as a screen-filling dust storm.
    const scatterAxis = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
    const launchPos = normal
      .clone()
      .applyAxisAngle(scatterAxis, rng() * 0.55 * flightIntensity)
      .multiplyScalar(radius * (1.08 + rng() * 0.4 * flightIntensity));
    // A fully random 3D orientation makes a thin rod look end-on (a dot)
    // from the camera as often as it looks like a line. Instead keep the
    // rod lying flat against its own little patch of sky — tangent to the
    // radial direction at the launch point, just spun to a random angle
    // within that tangent plane — so it always reads as a short streak,
    // never a foreshortened speck, while still looking scattered.
    const launchNormal = launchPos.clone().normalize();
    const seed = Math.abs(launchNormal.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const launchTangent = seed.clone().cross(launchNormal).normalize();
    const launchBinormal = launchNormal.clone().cross(launchTangent).normalize();
    const spin = rng() * Math.PI * 2;
    launchTangent.applyAxisAngle(launchNormal, spin);
    launchBinormal.applyAxisAngle(launchNormal, spin);
    const launchQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(launchTangent, launchBinormal, launchNormal),
    );

    strokes.push({
      homePos,
      homeQuat,
      length: drawLength,
      launchPos,
      launchQuat,
      driftPhase: rng() * Math.PI * 2,
      driftSpeed: 0.12 + rng() * 0.22,
      delay: rng() * 0.45,
      flightIntensity,
    });
  };

  const addStroke = (u0: number, v0: number, u1: number, v1: number, coastal: boolean) => {
    const startPos = uvToSphere(u0, v0, pointRadius(u0, v0, coastal));
    const endPos = uvToSphere(u1, v1, pointRadius(u1, v1, coastal));
    const length = startPos.distanceTo(endPos);
    if (length < radius * 0.001) return;

    // Adjoining rods meet at a shared vertex but are flat-capped boxes, so
    // at every bend in the coastline/border (i.e. almost everywhere on a
    // real, jagged coastline) the outer corner of the turn isn't covered by
    // either rod, reading as a tiny broken gap right at that vertex. Drawing
    // each rod a hair longer than its true chord helps on shallow bends, but
    // a joint cube (added separately at every chain vertex, see addJoint)
    // is what actually plugs sharp corners, since stretching a rod along
    // its own axis can't reach sideways into a steep turn.
    const jointOverlap = radius * 0.0045;
    const drawLength = length + jointOverlap;

    const homePos = startPos.clone().add(endPos).multiplyScalar(0.5);
    const normal = homePos.clone().normalize();
    const binormal = normal.clone().cross(endPos.clone().sub(startPos).normalize()).normalize();
    const tangent = binormal.clone().cross(normal).normalize();
    const homeQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(tangent, binormal, normal),
    );

    pushStroke(homePos, homeQuat, drawLength);
  };

  // Rods are flat-capped boxes, so at any bend sharper than a shallow curve
  // — a real coastline's normal state, not an edge case — the two adjoining
  // rods each extend only along their own straight direction and never
  // actually cover the wedge-shaped notch at the outer corner. A small cube
  // dropped exactly on the shared vertex, sized to the rod thickness, plugs
  // that notch regardless of how sharp the turn is, since it doesn't depend
  // on either rod's direction to cover the point.
  const jointSide = radius * STROKE_THICKNESS_FACTOR * 1.6;
  const addJoint = (u: number, v: number, coastal: boolean) => {
    const pos = uvToSphere(u, v, pointRadius(u, v, coastal));
    const normal = pos.clone().normalize();
    const seed = Math.abs(normal.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangent = seed.clone().cross(normal).normalize();
    const binormal = normal.clone().cross(tangent).normalize();
    const homeQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(tangent, binormal, normal),
    );
    pushStroke(pos, homeQuat, jointSide);
  };

  // Caps how many source points a single rod may swallow even when the
  // chord stays within tolerance, so a very long dead-straight border
  // doesn't collapse into one giant rod.
  const MAX_SPAN_POINTS = 90;

  const walk = (lines: number[][], coastal: boolean, deviation: number) => {
    for (const line of lines) {
      const n = line.length / 2;
      if (n < 2) continue;
      const pos = (idx: number) =>
        uvToSphere(line[idx * 2], line[idx * 2 + 1], pointRadius(line[idx * 2], line[idx * 2 + 1], coastal));

      // A real coastline isn't one continuous polyline in the source data —
      // topojson.mesh splits it into many separate arcs that meet at
      // junction points (anywhere 3+ boundaries touch, which is constant
      // along a real coast). Two arcs meeting end-to-end at the same
      // physical point are two different `line` entries here, so without a
      // joint at every line's start and end too — not just at internal
      // simplification points — every one of those junctions is an
      // unplugged notch, reading as the coastline being broken up
      // everywhere rather than at a few sharp turns.
      addJoint(line[0], line[1], coastal);

      let startIdx = 0;
      while (startIdx < n - 1) {
        let end = startIdx + 1;
        const a = pos(startIdx);
        while (end + 1 < n && end - startIdx < MAX_SPAN_POINTS) {
          const nextEnd = end + 1;
          const b = pos(nextEnd);
          let withinTolerance = true;
          for (let k = startIdx + 1; k < nextEnd; k++) {
            if (pointSegmentDistance(pos(k), a, b) > deviation) {
              withinTolerance = false;
              break;
            }
          }
          if (!withinTolerance) break;
          end = nextEnd;
        }
        addStroke(line[startIdx * 2], line[startIdx * 2 + 1], line[end * 2], line[end * 2 + 1], coastal);
        addJoint(line[end * 2], line[end * 2 + 1], coastal);
        startIdx = end;
      }
    }
  };

  // Small, intricate coastlines (Madagascar, the Aegean, fjords) carry most
  // of their real shape in tight zig-zags that are only a little larger than
  // a straight-continent border's typical wiggle — tracing them at the same
  // tolerance as interior borders collapses those zig-zags into chords that
  // visibly cut across bays and peninsulas. Interior borders don't have this
  // problem (their bends are broad, country-scale curves), so only the
  // coastline pass needs the tighter trace.
  walk(coastline, true, maxDeviation * 0.4);
  walk(borders, false, maxDeviation);
  return strokes;
}
