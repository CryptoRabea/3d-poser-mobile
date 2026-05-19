/**
 * Animation Blending & Speed Control System
 * Provides smooth blending between animations and playback speed control
 */

import type { BoneTransform } from './poseStorage';
import type { AnimationSequence } from './animationSequences';

export interface BlendState {
  animation1: AnimationSequence;
  animation2: AnimationSequence;
  blendFactor: number; // 0 to 1, where 0 = animation1, 1 = animation2
  currentFrame: number;
  speed: number; // 0.5 to 2.0
  isBlending: boolean;
}

/**
 * Create a blend state between two animations
 */
export function createBlendState(
  animation1: AnimationSequence,
  animation2: AnimationSequence,
  initialBlendFactor: number = 0.5,
  speed: number = 1.0
): BlendState {
  return {
    animation1,
    animation2,
    blendFactor: Math.max(0, Math.min(1, initialBlendFactor)),
    currentFrame: 0,
    speed: Math.max(0.5, Math.min(2.0, speed)),
    isBlending: true,
  };
}

/**
 * Blend two poses together
 */
export function blendPoses(
  pose1: BoneTransform[],
  pose2: BoneTransform[],
  blendFactor: number // 0 to 1
): BoneTransform[] {
  const result: BoneTransform[] = [];

  const pose1Map = new Map(pose1.map((b) => [b.name, b]));
  const pose2Map = new Map(pose2.map((b) => [b.name, b]));

  const allBoneNames = new Set([...Array.from(pose1Map.keys()), ...Array.from(pose2Map.keys())]);

  for (const boneName of Array.from(allBoneNames)) {
    const bone1 = pose1Map.get(boneName);
    const bone2 = pose2Map.get(boneName);

    if (!bone1 || !bone2) {
      result.push(bone1 || bone2!);
      continue;
    }

    result.push({
      name: boneName,
      position: {
        x: bone1.position.x + (bone2.position.x - bone1.position.x) * blendFactor,
        y: bone1.position.y + (bone2.position.y - bone1.position.y) * blendFactor,
        z: bone1.position.z + (bone2.position.z - bone1.position.z) * blendFactor,
      },
      rotation: {
        x: bone1.rotation.x + (bone2.rotation.x - bone1.rotation.x) * blendFactor,
        y: bone1.rotation.y + (bone2.rotation.y - bone1.rotation.y) * blendFactor,
        z: bone1.rotation.z + (bone2.rotation.z - bone1.rotation.z) * blendFactor,
      },
      scale: {
        x: bone1.scale.x + (bone2.scale.x - bone1.scale.x) * blendFactor,
        y: bone1.scale.y + (bone2.scale.y - bone1.scale.y) * blendFactor,
        z: bone1.scale.z + (bone2.scale.z - bone1.scale.z) * blendFactor,
      },
    });
  }

  return result;
}

/**
 * Get blended pose at specific frame with blend factor from AnimationSequence
 */
export function getBlendedPoseAtFrame(
  animation1: AnimationSequence,
  animation2: AnimationSequence,
  frameNumber: number,
  blendFactor: number
): BoneTransform[] | null {
  // Get keyframe index from frame number
  const fps = animation1.fps;
  const frameTime = frameNumber / fps;
  
  // Find nearest keyframes
  const keyframes1 = animation1.keyframes;
  const keyframes2 = animation2.keyframes;
  
  let pose1: BoneTransform[] | null = null;
  let pose2: BoneTransform[] | null = null;
  
  // Get pose from animation 1
  for (let i = 0; i < keyframes1.length; i++) {
    if (keyframes1[i].time >= frameTime) {
      if (i === 0) {
        pose1 = keyframes1[0].bones;
      } else {
        const prevKf = keyframes1[i - 1];
        const nextKf = keyframes1[i];
        const t = (frameTime - prevKf.time) / (nextKf.time - prevKf.time);
        pose1 = blendPoses(prevKf.bones, nextKf.bones, t);
      }
      break;
    }
  }
  if (!pose1 && keyframes1.length > 0) {
    pose1 = keyframes1[keyframes1.length - 1].bones;
  }
  
  // Get pose from animation 2
  for (let i = 0; i < keyframes2.length; i++) {
    if (keyframes2[i].time >= frameTime) {
      if (i === 0) {
        pose2 = keyframes2[0].bones;
      } else {
        const prevKf = keyframes2[i - 1];
        const nextKf = keyframes2[i];
        const t = (frameTime - prevKf.time) / (nextKf.time - prevKf.time);
        pose2 = blendPoses(prevKf.bones, nextKf.bones, t);
      }
      break;
    }
  }
  if (!pose2 && keyframes2.length > 0) {
    pose2 = keyframes2[keyframes2.length - 1].bones;
  }

  if (!pose1 || !pose2) {
    return pose1 || pose2 || null;
  }

  return blendPoses(pose1, pose2, blendFactor);
}

/**
 * Apply speed adjustment to frame number
 */
export function adjustFrameBySpeed(
  currentFrame: number,
  deltaTime: number, // in seconds
  speed: number,
  totalFrames: number,
  fps: number = 30
): number {
  const frameIncrement = (deltaTime * speed * fps) / 1000; // Convert ms to frame increment
  let newFrame = currentFrame + frameIncrement;

  // Loop animation
  if (newFrame >= totalFrames) {
    newFrame = newFrame % totalFrames;
  }

  return newFrame;
}

/**
 * Easing function for smooth speed transitions
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Easing function for smooth blend transitions
 */
export function easeBlendTransition(t: number, easing: 'linear' | 'ease-in-out' = 'ease-in-out'): number {
  if (easing === 'linear') {
    return t;
  }
  return easeInOutQuad(t);
}

/**
 * Create a smooth speed transition
 */
export function createSpeedTransition(
  fromSpeed: number,
  toSpeed: number,
  duration: number // in seconds
): (elapsed: number) => number {
  return (elapsed: number) => {
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutQuad(t);
    return fromSpeed + (toSpeed - fromSpeed) * eased;
  };
}

/**
 * Create a smooth blend transition
 */
export function createBlendTransition(
  fromBlend: number,
  toBlend: number,
  duration: number // in seconds
): (elapsed: number) => number {
  return (elapsed: number) => {
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutQuad(t);
    return fromBlend + (toBlend - fromBlend) * eased;
  };
}

/**
 * Get animation duration in seconds
 */
export function getAnimationDuration(animation: AnimationSequence): number {
  return animation.duration;
}

/**
 * Validate blend factor
 */
export function validateBlendFactor(factor: number): number {
  return Math.max(0, Math.min(1, factor));
}

/**
 * Validate speed
 */
export function validateSpeed(speed: number): number {
  return Math.max(0.5, Math.min(2.0, speed));
}
