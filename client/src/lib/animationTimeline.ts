/**
 * Animation Timeline System
 * Records poses at keyframes and plays back animations with interpolation
 */

import type { BoneTransform, CharacterPose } from './poseStorage';

export type { BoneTransform };

export interface Keyframe {
  frameNumber: number;
  timestamp: number;
  pose: BoneTransform[];
}

export interface Animation {
  id: string;
  name: string;
  description: string;
  fps: number;
  totalFrames: number;
  keyframes: Keyframe[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentFrame: number;
  currentTime: number;
  duration: number;
  speed: number;
}

/**
 * Create a new animation
 */
export function createAnimation(
  name: string,
  description: string,
  fps: number = 30
): Animation {
  return {
    id: `anim_${Date.now()}`,
    name,
    description,
    fps,
    totalFrames: 0,
    keyframes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Add a keyframe to animation
 */
export function addKeyframe(
  animation: Animation,
  frameNumber: number,
  pose: BoneTransform[]
): Animation {
  const keyframe: Keyframe = {
    frameNumber,
    timestamp: frameNumber / animation.fps,
    pose,
  };

  const updated = { ...animation };
  updated.keyframes = [...updated.keyframes].sort((a, b) => a.frameNumber - b.frameNumber);

  const existingIndex = updated.keyframes.findIndex((k) => k.frameNumber === frameNumber);
  if (existingIndex >= 0) {
    updated.keyframes[existingIndex] = keyframe;
  } else {
    updated.keyframes.push(keyframe);
  }

  updated.totalFrames = Math.max(...updated.keyframes.map((k) => k.frameNumber), frameNumber);
  updated.updatedAt = Date.now();

  return updated;
}

/**
 * Remove a keyframe from animation
 */
export function removeKeyframe(animation: Animation, frameNumber: number): Animation {
  const updated = { ...animation };
  updated.keyframes = updated.keyframes.filter((k) => k.frameNumber !== frameNumber);
  updated.totalFrames = updated.keyframes.length > 0
    ? Math.max(...updated.keyframes.map((k) => k.frameNumber))
    : 0;
  updated.updatedAt = Date.now();
  return updated;
}

/**
 * Get keyframe at specific frame number
 */
export function getKeyframeAtFrame(animation: Animation, frameNumber: number): Keyframe | null {
  return animation.keyframes.find((k) => k.frameNumber === frameNumber) || null;
}

/**
 * Get nearest keyframes for interpolation
 */
export function getNearestKeyframes(
  animation: Animation,
  frameNumber: number
): { before: Keyframe | null; after: Keyframe | null } {
  const before = [...animation.keyframes]
    .reverse()
    .find((k) => k.frameNumber <= frameNumber) || null;

  const after = animation.keyframes.find((k) => k.frameNumber > frameNumber) || null;

  return { before, after };
}

/**
 * Interpolate bone transforms between two keyframes
 */
export function interpolateBoneTransforms(
  before: BoneTransform[],
  after: BoneTransform[],
  t: number // 0 to 1
): BoneTransform[] {
  const result: BoneTransform[] = [];

  const beforeMap = new Map(before.map((b) => [b.name, b]));
  const afterMap = new Map(after.map((a) => [a.name, a]));

  const allBoneNames = new Set([...Array.from(beforeMap.keys()), ...Array.from(afterMap.keys())]);

  for (const boneName of Array.from(allBoneNames)) {
    const beforeBone = beforeMap.get(boneName);
    const afterBone = afterMap.get(boneName);

    if (!beforeBone || !afterBone) {
      result.push(beforeBone || afterBone!);
      continue;
    }

    result.push({
      name: boneName,
      position: {
        x: beforeBone.position.x + (afterBone.position.x - beforeBone.position.x) * t,
        y: beforeBone.position.y + (afterBone.position.y - beforeBone.position.y) * t,
        z: beforeBone.position.z + (afterBone.position.z - beforeBone.position.z) * t,
      },
      rotation: {
        x: beforeBone.rotation.x + (afterBone.rotation.x - beforeBone.rotation.x) * t,
        y: beforeBone.rotation.y + (afterBone.rotation.y - beforeBone.rotation.y) * t,
        z: beforeBone.rotation.z + (afterBone.rotation.z - beforeBone.rotation.z) * t,
      },
      scale: {
        x: beforeBone.scale.x + (afterBone.scale.x - beforeBone.scale.x) * t,
        y: beforeBone.scale.y + (afterBone.scale.y - beforeBone.scale.y) * t,
        z: beforeBone.scale.z + (afterBone.scale.z - beforeBone.scale.z) * t,
      },
    });
  }

  return result;
}

/**
 * Get interpolated pose at specific frame
 */
export function getPoseAtFrame(animation: Animation, frameNumber: number): BoneTransform[] | null {
  const keyframeAtFrame = getKeyframeAtFrame(animation, frameNumber);
  if (keyframeAtFrame) {
    return keyframeAtFrame.pose;
  }

  const { before, after } = getNearestKeyframes(animation, frameNumber);

  if (!before || !after) {
    return before?.pose || after?.pose || null;
  }

  const frameDiff = after.frameNumber - before.frameNumber;
  const t = (frameNumber - before.frameNumber) / frameDiff;

  return interpolateBoneTransforms(before.pose, after.pose, t);
}

/**
 * Export animation as JSON
 */
export function exportAnimation(animation: Animation): string {
  return JSON.stringify(animation, null, 2);
}

/**
 * Import animation from JSON
 */
export function importAnimation(json: string): Animation | null {
  try {
    const data = JSON.parse(json);
    if (!data.id || !data.name || !Array.isArray(data.keyframes)) {
      return null;
    }
    return data as Animation;
  } catch {
    return null;
  }
}

/**
 * Calculate animation duration in seconds
 */
export function getAnimationDuration(animation: Animation): number {
  return animation.totalFrames / animation.fps;
}

/**
 * Get frame number from time in seconds
 */
export function getFrameFromTime(animation: Animation, timeSeconds: number): number {
  return Math.round(timeSeconds * animation.fps);
}

/**
 * Get time in seconds from frame number
 */
export function getTimeFromFrame(animation: Animation, frameNumber: number): number {
  return frameNumber / animation.fps;
}

/**
 * Easing functions for smooth interpolation
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (t - 1) * (t - 1) * (t - 1) + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

export type EasingFunction = keyof typeof easingFunctions;
