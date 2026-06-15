import * as THREE from 'three';
import type { BoneTransform } from './poseStorage';

export interface WeightData {
  boneIndex: number;
  boneName: string;
  weights: number[]; // Per-vertex weights
  maxWeight: number;
  minWeight: number;
  averageWeight: number;
}

export interface HeatmapConfig {
  colorScheme: 'heat' | 'viridis' | 'cool' | 'rainbow';
  minColor: THREE.Color;
  maxColor: THREE.Color;
  showGrid: boolean;
  opacity: number;
}

/**
 * Calculate bone weights for a mesh based on skin bindings
 */
export function calculateBoneWeights(
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  boneIndex: number
): WeightData {
  const weights: number[] = [];
  const positionAttribute = geometry.getAttribute('position');
  const vertexCount = positionAttribute.count;

  if (!skinIndex || !skinWeight) {
    // No skin data available, return zeros
    for (let i = 0; i < vertexCount; i++) {
      weights.push(0);
    }
    return {
      boneIndex,
      boneName: `Bone_${boneIndex}`,
      weights,
      maxWeight: 0,
      minWeight: 0,
      averageWeight: 0,
    };
  }

  // Extract weights for this bone from skin data
  for (let i = 0; i < vertexCount; i++) {
    let weight = 0;

    // Check all 4 bone influences per vertex
    for (let j = 0; j < 4; j++) {
      const skinIndexValue = skinIndex[i * 4 + j];
      if (skinIndexValue === boneIndex) {
        weight = skinWeight[i * 4 + j];
        break;
      }
    }

    weights.push(weight);
  }

  // Calculate statistics
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

  return {
    boneIndex,
    boneName: `Bone_${boneIndex}`,
    weights,
    maxWeight,
    minWeight,
    averageWeight,
  };
}

/**
 * Create a color for a weight value based on heatmap scheme
 */
export function getHeatmapColor(
  value: number,
  min: number,
  max: number,
  scheme: 'heat' | 'viridis' | 'cool' | 'rainbow' = 'heat'
): THREE.Color {
  // Normalize value to 0-1
  const normalized = max === min ? 0 : (value - min) / (max - min);

  switch (scheme) {
    case 'heat':
      return heatColor(normalized);
    case 'viridis':
      return viridisColor(normalized);
    case 'cool':
      return coolColor(normalized);
    case 'rainbow':
      return rainbowColor(normalized);
    default:
      return heatColor(normalized);
  }
}

/**
 * Heat colormap: blue -> cyan -> green -> yellow -> red
 */
function heatColor(t: number): THREE.Color {
  const color = new THREE.Color();
  if (t < 0.25) {
    // Blue to cyan
    color.setRGB(0, t * 4, 1);
  } else if (t < 0.5) {
    // Cyan to green
    color.setRGB(0, 1, 1 - (t - 0.25) * 4);
  } else if (t < 0.75) {
    // Green to yellow
    color.setRGB((t - 0.5) * 4, 1, 0);
  } else {
    // Yellow to red
    color.setRGB(1, 1 - (t - 0.75) * 4, 0);
  }
  return color;
}

/**
 * Viridis colormap: purple -> green -> yellow
 */
function viridisColor(t: number): THREE.Color {
  const color = new THREE.Color();
  if (t < 0.33) {
    // Purple to blue
    const s = t / 0.33;
    color.setRGB(0.27 * (1 - s) + 0.13 * s, 0.0, 0.33 * (1 - s) + 0.56 * s);
  } else if (t < 0.66) {
    // Blue to green
    const s = (t - 0.33) / 0.33;
    color.setRGB(0.13 * (1 - s) + 0.57 * s, 0.56 * (1 - s) + 0.88 * s, 0.56 * (1 - s) + 0.14 * s);
  } else {
    // Green to yellow
    const s = (t - 0.66) / 0.34;
    color.setRGB(0.57 * (1 - s) + 0.99 * s, 0.88 * (1 - s) + 0.99 * s, 0.14 * (1 - s) + 0.15 * s);
  }
  return color;
}

/**
 * Cool colormap: blue -> cyan -> white
 */
function coolColor(t: number): THREE.Color {
  const color = new THREE.Color();
  if (t < 0.5) {
    // Blue to cyan
    color.setRGB(0, t * 2, 1);
  } else {
    // Cyan to white
    const s = (t - 0.5) * 2;
    color.setRGB(s, 1, 1);
  }
  return color;
}

/**
 * Rainbow colormap: red -> yellow -> green -> cyan -> blue -> magenta
 */
function rainbowColor(t: number): THREE.Color {
  const color = new THREE.Color();
  const hue = t * 6; // 0-6 range for hue
  const x = 1 - Math.abs((hue % 2) - 1);

  if (hue < 1) {
    color.setRGB(1, x, 0);
  } else if (hue < 2) {
    color.setRGB(x, 1, 0);
  } else if (hue < 3) {
    color.setRGB(0, 1, x);
  } else if (hue < 4) {
    color.setRGB(0, x, 1);
  } else if (hue < 5) {
    color.setRGB(x, 0, 1);
  } else {
    color.setRGB(1, 0, x);
  }
  return color;
}

/**
 * Create a texture for the heatmap visualization
 */
export function createHeatmapTexture(
  width: number = 256,
  height: number = 1,
  scheme: 'heat' | 'viridis' | 'cool' | 'rainbow' = 'heat'
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  for (let x = 0; x < width; x++) {
    const t = x / width;
    const color = getHeatmapColor(t, 0, 1, scheme);
    ctx.fillStyle = color.getStyle();
    ctx.fillRect(x, 0, 1, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Apply weight visualization to mesh material
 */
export function createWeightVisualizationMaterial(
  weightData: WeightData,
  config: HeatmapConfig
): THREE.ShaderMaterial {
  const heatmapTexture = createHeatmapTexture(256, 1, config.colorScheme);

  const vertexShader = `
    attribute float boneWeight;
    varying float vWeight;

    void main() {
      vWeight = boneWeight;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D heatmapTexture;
    uniform float opacity;
    varying float vWeight;

    void main() {
      vec4 heatColor = texture2D(heatmapTexture, vec2(vWeight, 0.5));
      gl_FragColor = vec4(heatColor.rgb, heatColor.a * opacity);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      heatmapTexture: { value: heatmapTexture },
      opacity: { value: config.opacity },
    },
    transparent: true,
    side: THREE.DoubleSide,
  });

  return material;
}

/**
 * Apply weight data as vertex colors to geometry
 */
export function applyWeightColorsToGeometry(
  geometry: THREE.BufferGeometry,
  weightData: WeightData,
  config: HeatmapConfig
): void {
  const colors: number[] = [];
  const { weights, maxWeight, minWeight } = weightData;

  for (const weight of weights) {
    const color = getHeatmapColor(weight, minWeight, maxWeight, config.colorScheme);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
}

/**
 * Create a legend canvas for the heatmap
 */
export function createHeatmapLegend(
  width: number = 300,
  height: number = 30,
  scheme: 'heat' | 'viridis' | 'cool' | 'rainbow' = 'heat',
  minLabel: string = '0%',
  maxLabel: string = '100%'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw gradient
  const gradientHeight = height * 0.6;
  for (let x = 0; x < width; x++) {
    const t = x / width;
    const color = getHeatmapColor(t, 0, 1, scheme);
    ctx.fillStyle = color.getStyle();
    ctx.fillRect(x, 0, 1, gradientHeight);
  }

  // Draw labels
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(minLabel, 0, height - 2);
  ctx.textAlign = 'right';
  ctx.fillText(maxLabel, width, height - 2);

  return canvas;
}

/**
 * Get weight statistics for a bone
 */
export function getWeightStatistics(weightData: WeightData): {
  affectedVertices: number;
  affectedPercentage: number;
  distribution: { min: number; max: number; avg: number; median: number; stdDev: number };
} {
  const affectedVertices = weightData.weights.filter(w => w > 0).length;
  const affectedPercentage = (affectedVertices / weightData.weights.length) * 100;

  const nonZeroWeights = weightData.weights.filter(w => w > 0).sort((a, b) => a - b);
  const median = nonZeroWeights.length > 0
    ? nonZeroWeights[Math.floor(nonZeroWeights.length / 2)]
    : 0;

  const avg = nonZeroWeights.length > 0
    ? nonZeroWeights.reduce((a, b) => a + b, 0) / nonZeroWeights.length
    : 0;

  const variance = nonZeroWeights.length > 0
    ? nonZeroWeights.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / nonZeroWeights.length
    : 0;

  const stdDev = Math.sqrt(variance);

  return {
    affectedVertices,
    affectedPercentage,
    distribution: {
      min: weightData.minWeight,
      max: weightData.maxWeight,
      avg,
      median,
      stdDev,
    },
  };
}
