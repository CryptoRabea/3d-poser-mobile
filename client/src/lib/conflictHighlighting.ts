import * as THREE from 'three';
import type { ComparisonMetrics } from './boneComparisonAnalysis';

/**
 * Extract conflicting vertices from comparison metrics
 */
export function extractConflictingVertices(
  metrics: ComparisonMetrics,
  geometry: THREE.BufferGeometry
): Map<number, number> {
  const conflictMap = new Map<number, number>();

  // Count conflicts per vertex
  for (const conflict of metrics.conflicts) {
    const vertexIndex = conflict.vertexIndex;
    const count = conflictMap.get(vertexIndex) || 0;
    conflictMap.set(vertexIndex, count + 1);
  }

  return conflictMap;
}

/**
 * Extract conflicting vertices from multiple metrics
 */
export function extractConflictingVerticesFromBatch(
  allMetrics: ComparisonMetrics[],
  geometry: THREE.BufferGeometry
): Map<number, number> {
  const conflictMap = new Map<number, number>();

  for (const metrics of allMetrics) {
    for (const conflict of metrics.conflicts) {
      const vertexIndex = conflict.vertexIndex;
      const count = conflictMap.get(vertexIndex) || 0;
      conflictMap.set(vertexIndex, count + 1);
    }
  }

  return conflictMap;
}

/**
 * Get vertices affected by specific bones
 */
export function getVerticesAffectedByBone(
  geometry: THREE.BufferGeometry,
  boneIndex: number,
  threshold: number = 0.01
): Set<number> {
  const affectedVertices = new Set<number>();
  const skinIndex = geometry.getAttribute('skinIndex')?.array as Uint32Array | null;
  const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

  if (!skinIndex || !skinWeight) {
    return affectedVertices;
  }

  // Iterate through all vertices
  for (let i = 0; i < skinIndex.length / 4; i++) {
    const baseIdx = i * 4;

    for (let j = 0; j < 4; j++) {
      const bone = skinIndex[baseIdx + j];
      const weight = skinWeight[baseIdx + j];

      if (bone === boneIndex && weight > threshold) {
        affectedVertices.add(i);
        break;
      }
    }
  }

  return affectedVertices;
}

/**
 * Get vertices shared between two bones
 */
export function getSharedVertices(
  geometry: THREE.BufferGeometry,
  bone1Index: number,
  bone2Index: number,
  threshold: number = 0.01
): Set<number> {
  const bone1Vertices = getVerticesAffectedByBone(geometry, bone1Index, threshold);
  const bone2Vertices = getVerticesAffectedByBone(geometry, bone2Index, threshold);

  const shared = new Set<number>();
  bone1Vertices.forEach(v => {
    if (bone2Vertices.has(v)) {
      shared.add(v);
    }
  });

  return shared;
}

/**
 * Calculate vertex influence ratio for a bone
 */
export function getVertexInfluenceRatio(
  geometry: THREE.BufferGeometry,
  vertexIndex: number,
  boneIndex: number
): number {
  const skinIndex = geometry.getAttribute('skinIndex')?.array as Uint32Array | null;
  const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

  if (!skinIndex || !skinWeight) {
    return 0;
  }

  const baseIdx = vertexIndex * 4;
  let totalWeight = 0;
  let boneWeight = 0;

  for (let i = 0; i < 4; i++) {
    const bone = skinIndex[baseIdx + i];
    const weight = skinWeight[baseIdx + i];

    totalWeight += weight;

    if (bone === boneIndex) {
      boneWeight = weight;
    }
  }

  return totalWeight > 0 ? boneWeight / totalWeight : 0;
}

/**
 * Highlight vertices with specific color
 */
export function createHighlightMaterial(color: THREE.Color | number, opacity: number = 0.8): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: typeof color === 'number' ? color : color.getHex(),
    emissive: typeof color === 'number' ? color : color.getHex(),
    emissiveIntensity: 0.5,
    transparent: true,
    opacity,
    wireframe: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Create overlay material for conflict visualization
 */
export function createConflictOverlayMaterial(opacity: number = 0.6): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity,
    wireframe: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Create vertex selection geometry
 */
export function createVertexSelectionGeometry(
  geometry: THREE.BufferGeometry,
  vertexIndices: Set<number>,
  radius: number = 0.05
): THREE.BufferGeometry {
  const positions = geometry.getAttribute('position');

  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }

  const sphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
  const mergedGeometry = new THREE.BufferGeometry();
  const vertices: number[] = [];

  vertexIndices.forEach((vertexIndex) => {
    if (vertexIndex * 3 + 2 < positions.array.length) {
      const x = (positions.array as Float32Array)[vertexIndex * 3];
      const y = (positions.array as Float32Array)[vertexIndex * 3 + 1];
      const z = (positions.array as Float32Array)[vertexIndex * 3 + 2];

      vertices.push(x, y, z);
    }
  });

  mergedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

  return mergedGeometry;
}

/**
 * Create highlight mesh for vertices
 */
export function createVertexHighlightMesh(
  geometry: THREE.BufferGeometry,
  vertexIndices: Set<number>,
  color: THREE.Color | number = 0xff0000,
  radius: number = 0.05
): THREE.Mesh {
  const selectionGeometry = createVertexSelectionGeometry(geometry, vertexIndices, radius);
  const material = createHighlightMaterial(color, 0.8);

  return new THREE.Mesh(selectionGeometry, material);
}

/**
 * Create conflict region overlay
 */
export function createConflictRegionOverlay(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number>,
  maxConflicts: number = 100
): THREE.Mesh {
  const positions = geometry.getAttribute('position');

  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }

  // Create color array based on conflict severity
  const colors = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i++) {
    const conflictCount = conflictVertices.get(i) || 0;
    const severity = Math.min(conflictCount / maxConflicts, 1.0);

    let r = 0.5,
      g = 0.5,
      b = 0.5;

    if (severity > 0) {
      if (severity < 0.33) {
        // Gray to Yellow
        const t = severity / 0.33;
        r = 0.5 + t * 0.5;
        g = 0.5 + t * 0.5;
        b = 0.5 - t * 0.5;
      } else if (severity < 0.66) {
        // Yellow to Orange
        const t = (severity - 0.33) / 0.33;
        r = 1.0;
        g = 1.0 - t * 0.35;
        b = 0;
      } else {
        // Orange to Red
        const t = (severity - 0.66) / 0.34;
        r = 1.0;
        g = 0.65 - t * 0.65;
        b = 0;
      }
    }

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  const overlayGeometry = new THREE.BufferGeometry();
  overlayGeometry.setAttribute('position', positions.clone());
  overlayGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  if (geometry.getIndex()) {
    overlayGeometry.setIndex(geometry.getIndex()!.clone());
  }

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(overlayGeometry, material);
}

/**
 * Create conflict heatmap visualization
 */
export function createConflictHeatmap(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number>,
  maxConflicts: number = 100
): THREE.Mesh {
  return createConflictRegionOverlay(geometry, conflictVertices, maxConflicts);
}

/**
 * Blend two materials for smooth transition
 */
export function createBlendedMaterial(
  material1: THREE.Material,
  material2: THREE.Material,
  blendFactor: number = 0.5
): THREE.MeshStandardMaterial {
  const color1 = (material1 as any).color || new THREE.Color(0xffffff);
  const color2 = (material2 as any).color || new THREE.Color(0x000000);

  const blendedColor = new THREE.Color();
  blendedColor.copy(color1).lerp(color2, blendFactor);

  return new THREE.MeshStandardMaterial({
    color: blendedColor,
    transparent: true,
    opacity: 0.8,
  });
}

/**
 * Animate conflict visualization
 */
export function createConflictAnimationMaterial(
  baseColor: THREE.Color | number = 0xff0000
): THREE.ShaderMaterial {
  const vertexShader = `
    varying float vTime;
    
    void main() {
      vTime = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying float vTime;
    
    void main() {
      float pulse = sin(uTime * 3.0 + vTime * 10.0) * 0.5 + 0.5;
      gl_FragColor = vec4(1.0, 0.0, 0.0, pulse * 0.8);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
