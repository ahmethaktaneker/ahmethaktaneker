import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as topojson from "topojson-client";
// 110m resolution (vs. 50m) — a decorative globe rendered at a few hundred
// pixels doesn't benefit from country-level survey precision, and the extra
// vertices only added rod count without adding anything visible. Coastline/
// border rods still trace this simpler data as tightly as the deviation
// tolerance allows (see globe-sculpture.tsx's strokeDeviation) — resolution
// dropped, tracing fidelity did not.
import worldData from "world-atlas/countries-110m.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/components/hero-3d/world-outline-data.json");

const MIN_RING_POINTS = 4;
const MIN_LINE_POINTS = 2;

// Rings that cross the antimeridian (lon jumps from ~+180 to ~-180) must be
// split, otherwise the wrap bakes as one long straight line cutting across
// the whole equirectangular texture.
function splitAtSeam(coords, minPoints) {
  const out = [];
  let sub = [];
  let prevU = null;
  for (const [lon, lat] of coords) {
    const u = (lon + 180) / 360;
    const v = (90 - lat) / 180;
    if (prevU !== null && Math.abs(u - prevU) > 0.5) {
      if (sub.length / 2 >= minPoints) out.push(sub);
      sub = [];
    }
    sub.push(Number(u.toFixed(5)), Number(v.toFixed(5)));
    prevU = u;
  }
  if (sub.length / 2 >= minPoints) out.push(sub);
  return out;
}

// Filled land shapes (per-country polygons) — used to paint the continent
// fill on the colour/roughness/metalness/bump maps.
const land = [];
const countriesGeo = topojson.feature(worldData, worldData.objects.countries);
for (const feature of countriesGeo.features) {
  const polygons =
    feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      if (ring.length < MIN_RING_POINTS) continue;
      land.push(...splitAtSeam(ring, MIN_RING_POINTS));
    }
  }
}

// Coastline: arcs bordering only one country (land/ocean edge) — the bold,
// bright stroke.
const coastlineMesh = topojson.mesh(worldData, worldData.objects.countries, (a, b) => a === b);
// Interior borders: arcs shared between two different countries — the fine,
// dim stroke that gives the globe its dense "political map" detail.
const bordersMesh = topojson.mesh(worldData, worldData.objects.countries, (a, b) => a !== b);

function meshToLines(mesh) {
  const lines = [];
  const strings = mesh.type === "MultiLineString" ? mesh.coordinates : [mesh.coordinates];
  for (const line of strings) {
    if (line.length < MIN_LINE_POINTS) continue;
    lines.push(...splitAtSeam(line, MIN_LINE_POINTS));
  }
  return lines;
}

const coastline = meshToLines(coastlineMesh);
const borders = meshToLines(bordersMesh);

writeFileSync(outPath, JSON.stringify({ land, coastline, borders }));
console.log(
  `Wrote ${land.length} land rings, ${coastline.length} coastline lines, ${borders.length} border lines to ${outPath}`,
);
