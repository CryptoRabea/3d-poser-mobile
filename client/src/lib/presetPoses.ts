/**
 * Preset Poses Library
 * Predefined bone transform configurations for common character poses
 */

import type { BoneTransform } from './poseStorage';

export interface PresetPose {
  id: string;
  name: string;
  description: string;
  category: 'idle' | 'action' | 'emotion' | 'custom';
  icon: string;
  transforms: BoneTransform[];
  thumbnail?: string;
}

/**
 * Generate a standing pose with neutral stance
 */
export function generateStandingPose(): BoneTransform[] {
  return [
    { name: 'Root', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Spine', position: { x: 0, y: 0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Chest', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Neck', position: { x: 0, y: 0.3, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Head', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftShoulder', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftArm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftForearm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHand', position: { x: -0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightShoulder', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightArm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightForearm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHand', position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHip', position: { x: -0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHip', position: { x: 0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  ];
}

/**
 * Generate a sitting pose
 */
export function generateSittingPose(): BoneTransform[] {
  return [
    { name: 'Root', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Spine', position: { x: 0, y: 0.5, z: 0 }, rotation: { x: 0.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Chest', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Neck', position: { x: 0, y: 0.3, z: 0 }, rotation: { x: -0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Head', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftShoulder', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftArm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftForearm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHand', position: { x: -0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightShoulder', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightArm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightForearm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHand', position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHip', position: { x: -0.2, y: -0.2, z: 0 }, rotation: { x: 0.8, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0.7, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHip', position: { x: 0.2, y: -0.2, z: 0 }, rotation: { x: 0.8, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0.7, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  ];
}

/**
 * Generate an idle/relaxed pose
 */
export function generateIdlePose(): BoneTransform[] {
  return [
    { name: 'Root', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Spine', position: { x: 0, y: 0.5, z: 0 }, rotation: { x: 0.05, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Chest', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: 0.05, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Neck', position: { x: 0, y: 0.3, z: 0 }, rotation: { x: -0.05, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Head', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: 0.05, y: 0.1, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftShoulder', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftArm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: -0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftForearm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: -0.05, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHand', position: { x: -0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightShoulder', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightArm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: -0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightForearm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: -0.05, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHand', position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHip', position: { x: -0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHip', position: { x: 0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  ];
}

/**
 * Generate a hands-up pose (celebration/surrender)
 */
export function generateHandsUpPose(): BoneTransform[] {
  return [
    { name: 'Root', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Spine', position: { x: 0, y: 0.5, z: 0 }, rotation: { x: -0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Chest', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: -0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Neck', position: { x: 0, y: 0.3, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Head', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftShoulder', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: -1.5, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftArm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: -1.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftForearm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: -0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHand', position: { x: -0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightShoulder', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: -1.5, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightArm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: -1.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightForearm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: -0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHand', position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHip', position: { x: -0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHip', position: { x: 0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  ];
}

/**
 * Generate a thinking/pondering pose
 */
export function generateThinkingPose(): BoneTransform[] {
  return [
    { name: 'Root', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Spine', position: { x: 0, y: 0.5, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Chest', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: 0.1, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Neck', position: { x: 0, y: 0.3, z: 0 }, rotation: { x: -0.2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'Head', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: -0.3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftShoulder', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.5, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftArm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.8, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftForearm', position: { x: -0.3, y: 0, z: 0 }, rotation: { x: 0.6, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHand', position: { x: -0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightShoulder', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightArm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightForearm', position: { x: 0.3, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHand', position: { x: 0.15, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftHip', position: { x: -0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'LeftFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightHip', position: { x: 0.2, y: -0.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightLeg', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    { name: 'RightFoot', position: { x: 0, y: -0.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  ];
}

/**
 * Get all available preset poses
 */
export function getAllPresetPoses(): PresetPose[] {
  return [
    {
      id: 'standing',
      name: 'Standing',
      description: 'Neutral standing pose',
      category: 'idle',
      icon: '🧍',
      transforms: generateStandingPose(),
    },
    {
      id: 'sitting',
      name: 'Sitting',
      description: 'Comfortable sitting position',
      category: 'idle',
      icon: '🪑',
      transforms: generateSittingPose(),
    },
    {
      id: 'idle',
      name: 'Idle',
      description: 'Relaxed idle stance',
      category: 'idle',
      icon: '😐',
      transforms: generateIdlePose(),
    },
    {
      id: 'handsup',
      name: 'Hands Up',
      description: 'Celebration or surrender pose',
      category: 'action',
      icon: '🙌',
      transforms: generateHandsUpPose(),
    },
    {
      id: 'thinking',
      name: 'Thinking',
      description: 'Pondering or thinking pose',
      category: 'emotion',
      icon: '🤔',
      transforms: generateThinkingPose(),
    },
  ];
}

/**
 * Get preset pose by ID
 */
export function getPresetPoseById(id: string): PresetPose | undefined {
  return getAllPresetPoses().find((pose) => pose.id === id);
}
