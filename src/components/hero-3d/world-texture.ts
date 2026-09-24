import * as THREE from "three";
import outlineData from "./world-outline-data.json";
import { landElevation01, oceanElevation01 } from "./elevation";

const { land } = outlineData as { land: number[][] };

const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 1024;

function traceFill(
  ctx: CanvasRenderingContext2D,
  rings: number[][],
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
) {
  for (const ring of rings) {
    ctx.beginPath();
    for (let i = 0; i < ring.length; i += 2) {
      const x = ring[i] * width;
      const y = ring[i + 1] * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function makeCanvas(width = CANVAS_WIDTH, height = CANVAS_HEIGHT) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Per-pixel luminance noise, blended with "overlay" so it reads as fine
 * surface grain (terrain relief on the bump map, brushed variation on the
 * roughness map) instead of flat, plastic-looking fills.
 */
function addGrain(ctx: CanvasRenderingContext2D, alpha: number) {
  const grainCanvas = makeCanvas();
  const gctx = grainCanvas.getContext("2d")!;
  const imageData = gctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255;
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  gctx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(grainCanvas, 0, 0);
  ctx.restore();
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export type WorldMaterialMaps = {
  colorMap: THREE.CanvasTexture;
  transmissionMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  metalnessMap: THREE.CanvasTexture;
  elevationMap: THREE.CanvasTexture;
};

const ELEV_WIDTH = 1024;
const ELEV_HEIGHT = 512;

/**
 * Procedural relief: ridged fractal noise masked by the real land
 * silhouette, so continents rise into sharp mountain-range-scale terrain
 * (high contrast, ridge-shaped peaks) and ocean floor keeps a gentle
 * trench/shelf undulation — driving true vertex displacement and bump
 * shading, not just a barely-there grain.
 */
function createElevationMap(): THREE.CanvasTexture {
  const maskCanvas = makeCanvas(ELEV_WIDTH, ELEV_HEIGHT);
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.fillStyle = "#000000";
  maskCtx.fillRect(0, 0, ELEV_WIDTH, ELEV_HEIGHT);
  maskCtx.fillStyle = "#ffffff";
  traceFill(maskCtx, land, ELEV_WIDTH, ELEV_HEIGHT);
  const maskData = maskCtx.getImageData(0, 0, ELEV_WIDTH, ELEV_HEIGHT).data;

  const elevCanvas = makeCanvas(ELEV_WIDTH, ELEV_HEIGHT);
  const elevCtx = elevCanvas.getContext("2d")!;
  const elevData = elevCtx.createImageData(ELEV_WIDTH, ELEV_HEIGHT);

  for (let y = 0; y < ELEV_HEIGHT; y++) {
    for (let x = 0; x < ELEV_WIDTH; x++) {
      const idx = (y * ELEV_WIDTH + x) * 4;
      const isLand = maskData[idx] > 128;
      const u = x / ELEV_WIDTH;
      const v = y / ELEV_HEIGHT;

      const elevation = isLand ? landElevation01(u, v) : oceanElevation01(u, v);
      const g = Math.round(THREE.MathUtils.clamp(elevation, 0, 1) * 255);
      elevData.data[idx] = g;
      elevData.data[idx + 1] = g;
      elevData.data[idx + 2] = g;
      elevData.data[idx + 3] = 255;
    }
  }
  elevCtx.putImageData(elevData, 0, 0);

  return toTexture(elevCanvas, false);
}

/**
 * Bakes flat equirectangular land/ocean maps with no coastline or border
 * linework — that network is drawn exclusively by the flying BorderStroke
 * instances in globe-sculpture.tsx, so it reads as forming the globe rather
 * than duplicating lines already baked into the surface.
 */
export function createWorldMaterialMaps(oceanColor: string, landColor: string): WorldMaterialMaps {
  // Base colour: land metal over near-black glass ocean.
  const colorCanvas = makeCanvas();
  const colorCtx = colorCanvas.getContext("2d")!;
  colorCtx.fillStyle = oceanColor;
  colorCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  colorCtx.fillStyle = landColor;
  traceFill(colorCtx, land);

  // Transmission: white = glass ocean (see-through), black = opaque land.
  const transCanvas = makeCanvas();
  const transCtx = transCanvas.getContext("2d")!;
  transCtx.fillStyle = "#ffffff";
  transCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  transCtx.fillStyle = "#000000";
  traceFill(transCtx, land);

  // Roughness: glossy glass ocean, brushed-metal land.
  const roughCanvas = makeCanvas();
  const roughCtx = roughCanvas.getContext("2d")!;
  roughCtx.fillStyle = "#202020";
  roughCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  roughCtx.fillStyle = "#8c8c8c";
  traceFill(roughCtx, land);
  addGrain(roughCtx, 0.16);

  // Metalness: metallic land, non-metal glass ocean.
  const metalCanvas = makeCanvas();
  const metalCtx = metalCanvas.getContext("2d")!;
  metalCtx.fillStyle = "#0d0d0d";
  metalCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  metalCtx.fillStyle = "#e0e0e0";
  traceFill(metalCtx, land);

  return {
    colorMap: toTexture(colorCanvas, true),
    transmissionMap: toTexture(transCanvas, false),
    roughnessMap: toTexture(roughCanvas, false),
    metalnessMap: toTexture(metalCanvas, false),
    elevationMap: createElevationMap(),
  };
}
