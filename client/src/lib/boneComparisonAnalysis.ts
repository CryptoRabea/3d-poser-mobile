import type { WeightData } from './boneWeightVisualization';
import * as THREE from 'three';

export interface BoneInfluenceData {
  boneIndex: number;
  boneName: string;
  weights: number[];
  affectedVertices: Set<number>;
  maxWeight: number;
  averageWeight: number;
}

export interface WeightConflict {
  vertexIndex: number;
  bone1Index: number;
  bone1Name: string;
  bone1Weight: number;
  bone2Index: number;
  bone2Name: string;
  bone2Weight: number;
  conflictStrength: number; // 0-1, how severe the conflict is
  position: THREE.Vector3;
}

export interface InfluenceOverlap {
  bone1Index: number;
  bone1Name: string;
  bone2Index: number;
  bone2Name: string;
  overlapVertices: number[]; // Vertices influenced by both bones
  overlapPercentage: number;
  averageConflictStrength: number;
}

export interface ComparisonMetrics {
  totalVertices: number;
  bone1: BoneInfluenceData;
  bone2: BoneInfluenceData;
  conflicts: WeightConflict[];
  overlap: InfluenceOverlap;
  conflictDensity: number; // Percentage of vertices with conflicts
  severityDistribution: {
    mild: number; // 0-0.3
    moderate: number; // 0.3-0.6
    severe: number; // 0.6-1.0
  };
}

/**
 * Extract bone influence data from weight array
 */
export function extractBoneInfluence(
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  boneIndex: number,
  boneName: string
): BoneInfluenceData {
  const weights: number[] = [];
  const affectedVertices = new Set<number>();
  const positionAttribute = geometry.getAttribute('position');
  const vertexCount = positionAttribute.count;

  if (!skinIndex || !skinWeight) {
    return {
      boneIndex,
      boneName,
      weights: Array(vertexCount).fill(0),
      affectedVertices: new Set(),
      maxWeight: 0,
      averageWeight: 0,
    };
  }

  for (let i = 0; i < vertexCount; i++) {
    let weight = 0;

    for (let j = 0; j < 4; j++) {
      const skinIndexValue = skinIndex[i * 4 + j];
      if (skinIndexValue === boneIndex) {
        weight = skinWeight[i * 4 + j];
        break;
      }
    }

    weights.push(weight);
    if (weight > 0) {
      affectedVertices.add(i);
    }
  }

  const maxWeight = Math.max(...weights);
  const averageWeight = weights.length > 0
    ? weights.reduce((a, b) => a + b, 0) / weights.length
    : 0;

  return {
    boneIndex,
    boneName,
    weights,
    affectedVertices,
    maxWeight,
    averageWeight,
  };
}

/**
 * Detect weight conflicts between two bones
 */
export function detectWeightConflicts(
  geometry: THREE.BufferGeometry,
  bone1: BoneInfluenceData,
  bone2: BoneInfluenceData,
  conflictThreshold: number = 0.1
): WeightConflict[] {
  const conflicts: WeightConflict[] = [];
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < bone1.weights.length; i++) {
    const weight1 = bone1.weights[i];
    const weight2 = bone2.weights[i];

    // Check if both bones have significant influence
    if (weight1 > conflictThreshold && weight2 > conflictThreshold) {
      const conflictStrength = Math.min(weight1, weight2) / Math.max(weight1, weight2, 0.001);

      const position = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      conflicts.push({
        vertexIndex: i,
        bone1Index: bone1.boneIndex,
        bone1Name: bone1.boneName,
        bone1Weight: weight1,
        bone2Index: bone2.boneIndex,
        bone2Name: bone2.boneName,
        bone2Weight: weight2,
        conflictStrength,
        position,
      });
    }
  }

  return conflicts;
}

/**
 * Calculate overlap between two bone influences
 */
export function calculateInfluenceOverlap(
  bone1: BoneInfluenceData,
  bone2: BoneInfluenceData
): InfluenceOverlap {
  const overlapVertices: number[] = [];
  let totalConflictStrength = 0;

  // Find vertices influenced by both bones
  for (const vertexIndex of Array.from(bone1.affectedVertices)) {
    if (bone2.affectedVertices.has(vertexIndex)) {
      overlapVertices.push(vertexIndex);

      const weight1 = bone1.weights[vertexIndex];
      const weight2 = bone2.weights[vertexIndex];
      const conflictStrength = Math.min(weight1, weight2) / Math.max(weight1, weight2, 0.001);
      totalConflictStrength += conflictStrength;
    }
  }

  const totalInfluenced = new Set(Array.from(bone1.affectedVertices).concat(Array.from(bone2.affectedVertices))).size;
  const overlapPercentage = totalInfluenced > 0 ? (overlapVertices.length / totalInfluenced) * 100 : 0;
  const averageConflictStrength = overlapVertices.length > 0
    ? totalConflictStrength / overlapVertices.length
    : 0;

  return {
    bone1Index: bone1.boneIndex,
    bone1Name: bone1.boneName,
    bone2Index: bone2.boneIndex,
    bone2Name: bone2.boneName,
    overlapVertices,
    overlapPercentage,
    averageConflictStrength,
  };
}

/**
 * Generate comprehensive comparison metrics
 */
export function generateComparisonMetrics(
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  bone1Index: number,
  bone1Name: string,
  bone2Index: number,
  bone2Name: string,
  conflictThreshold: number = 0.1
): ComparisonMetrics {
  const positionAttribute = geometry.getAttribute('position');
  const totalVertices = positionAttribute.count;

  const bone1 = extractBoneInfluence(geometry, skinIndex, skinWeight, bone1Index, bone1Name);
  const bone2 = extractBoneInfluence(geometry, skinIndex, skinWeight, bone2Index, bone2Name);

  const conflicts = detectWeightConflicts(geometry, bone1, bone2, conflictThreshold);
  const overlap = calculateInfluenceOverlap(bone1, bone2);

  // Calculate severity distribution
  const severityDistribution = {
    mild: 0,
    moderate: 0,
    severe: 0,
  };

  for (const conflict of conflicts) {
    if (conflict.conflictStrength < 0.3) {
      severityDistribution.mild++;
    } else if (conflict.conflictStrength < 0.6) {
      severityDistribution.moderate++;
    } else {
      severityDistribution.severe++;
    }
  }

  const conflictDensity = (conflicts.length / totalVertices) * 100;

  return {
    totalVertices,
    bone1,
    bone2,
    conflicts,
    overlap,
    conflictDensity,
    severityDistribution,
  };
}

/**
 * Find all bones with significant overlap with a given bone
 */
export function findOverlappingBones(
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  targetBoneIndex: number,
  targetBoneName: string,
  bones: THREE.Bone[],
  minOverlapPercentage: number = 10
): InfluenceOverlap[] {
  const targetBone = extractBoneInfluence(
    geometry,
    skinIndex,
    skinWeight,
    targetBoneIndex,
    targetBoneName
  );

  const overlaps: InfluenceOverlap[] = [];

  for (let i = 0; i < bones.length; i++) {
    if (i === targetBoneIndex) continue;

    const otherBone = extractBoneInfluence(
      geometry,
      skinIndex,
      skinWeight,
      i,
      bones[i].name || `Bone_${i}`
    );

    const overlap = calculateInfluenceOverlap(targetBone, otherBone);

    if (overlap.overlapPercentage >= minOverlapPercentage) {
      overlaps.push(overlap);
    }
  }

  // Sort by overlap percentage descending
  return overlaps.sort((a, b) => b.overlapPercentage - a.overlapPercentage);
}

/**
 * Visualize conflicts as vertex colors
 */
export function createConflictColorArray(
  conflicts: WeightConflict[],
  totalVertices: number
): Float32Array {
  const colors = new Float32Array(totalVertices * 3);

  // Initialize all vertices to neutral gray
  for (let i = 0; i < totalVertices; i++) {
    colors[i * 3] = 0.5;
    colors[i * 3 + 1] = 0.5;
    colors[i * 3 + 2] = 0.5;
  }

  // Color conflict vertices based on severity
  for (const conflict of conflicts) {
    const idx = conflict.vertexIndex;
    const strength = conflict.conflictStrength;

    if (strength < 0.3) {
      // Mild: yellow
      colors[idx * 3] = 1;
      colors[idx * 3 + 1] = 1;
      colors[idx * 3 + 2] = 0;
    } else if (strength < 0.6) {
      // Moderate: orange
      colors[idx * 3] = 1;
      colors[idx * 3 + 1] = 0.5;
      colors[idx * 3 + 2] = 0;
    } else {
      // Severe: red
      colors[idx * 3] = 1;
      colors[idx * 3 + 1] = 0;
      colors[idx * 3 + 2] = 0;
    }
  }

  return colors;
}

/**
 * Generate comparison report
 */
export function generateComparisonReport(metrics: ComparisonMetrics): string {
  const lines: string[] = [];

  lines.push(`Bone Influence Comparison Report`);
  lines.push(`================================\n`);

  lines.push(`Bone 1: ${metrics.bone1.boneName}`);
  lines.push(`  Affected Vertices: ${metrics.bone1.affectedVertices.size}`);
  lines.push(`  Max Weight: ${(metrics.bone1.maxWeight * 100).toFixed(1)}%`);
  lines.push(`  Average Weight: ${(metrics.bone1.averageWeight * 100).toFixed(1)}%\n`);

  lines.push(`Bone 2: ${metrics.bone2.boneName}`);
  lines.push(`  Affected Vertices: ${metrics.bone2.affectedVertices.size}`);
  lines.push(`  Max Weight: ${(metrics.bone2.maxWeight * 100).toFixed(1)}%`);
  lines.push(`  Average Weight: ${(metrics.bone2.averageWeight * 100).toFixed(1)}%\n`);

  lines.push(`Overlap Analysis`);
  lines.push(`  Overlapping Vertices: ${metrics.overlap.overlapVertices.length}`);
  lines.push(`  Overlap Percentage: ${metrics.overlap.overlapPercentage.toFixed(1)}%`);
  lines.push(`  Average Conflict Strength: ${(metrics.overlap.averageConflictStrength * 100).toFixed(1)}%\n`);

  lines.push(`Conflict Detection`);
  lines.push(`  Total Conflicts: ${metrics.conflicts.length}`);
  lines.push(`  Conflict Density: ${metrics.conflictDensity.toFixed(2)}%`);
  lines.push(`  Mild Conflicts: ${metrics.severityDistribution.mild}`);
  lines.push(`  Moderate Conflicts: ${metrics.severityDistribution.moderate}`);
  lines.push(`  Severe Conflicts: ${metrics.severityDistribution.severe}\n`);

  if (metrics.conflicts.length > 0) {
    lines.push(`Recommendations`);
    if (metrics.severityDistribution.severe > 0) {
      lines.push(`  ⚠️  High severity conflicts detected - consider adjusting weights`);
    }
    if (metrics.overlap.overlapPercentage > 50) {
      lines.push(`  ⚠️  Significant overlap detected - bones may have conflicting influence`);
    }
    if (metrics.conflictDensity > 10) {
      lines.push(`  ⚠️  High conflict density - review skinning weights`);
    }
  } else {
    lines.push(`✅ No conflicts detected - weights appear to be well-distributed`);
  }

  return lines.join('\n');
}
