/**
 * Animation Sequences Library
 * Pre-made animation sequences (walk cycle, idle, jump, etc.)
 * These are generated as keyframe sequences that can be applied to any rigged model
 */

import { BoneTransform } from './poseStorage';

export interface AnimationSequence {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  fps: number;
  keyframes: KeyframeData[];
  category: 'locomotion' | 'action' | 'idle' | 'gesture';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface KeyframeData {
  time: number; // in seconds
  bones: BoneTransform[];
}

/**
 * Generate a walk cycle animation
 * Simulates a humanoid walking with alternating leg movement and arm swinging
 */
export function generateWalkCycle(): AnimationSequence {
  const keyframes: KeyframeData[] = [];
  const duration = 2; // 2 second walk cycle
  const fps = 24;
  const totalFrames = (duration * fps);

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = frame / fps;
    const progress = (frame % totalFrames) / totalFrames; // 0 to 1
    const bones: BoneTransform[] = [];

    // Left leg (forward swing at 0-0.5, backward at 0.5-1)
    const leftLegProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    bones.push({
      name: 'LeftLeg',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: Math.sin(leftLegProgress * Math.PI) * 0.5, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Right leg (opposite of left)
    const rightLegProgress = progress < 0.5 ? (1 - progress) * 2 : progress * 2;
    bones.push({
      name: 'RightLeg',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: Math.sin(rightLegProgress * Math.PI) * 0.5, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Left arm (opposite of left leg)
    const leftArmProgress = progress < 0.5 ? (1 - progress) * 2 : progress * 2;
    bones.push({
      name: 'LeftArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: Math.sin(leftArmProgress * Math.PI) * 0.3, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Right arm (same as right leg)
    const rightArmProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    bones.push({
      name: 'RightArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: Math.sin(rightArmProgress * Math.PI) * 0.3, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Slight body sway
    bones.push({
      name: 'Spine',
      position: { x: Math.sin(progress * Math.PI * 2) * 0.05, y: 0, z: 0 },
      rotation: { x: 0, y: Math.sin(progress * Math.PI * 2) * 0.1, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    keyframes.push({ time, bones });
  }

  return {
    id: 'walk-cycle',
    name: 'Walk Cycle',
    description: 'A natural walking animation with alternating leg movement and arm swinging',
    duration,
    fps,
    keyframes,
    category: 'locomotion',
    difficulty: 'easy'
  };
}

/**
 * Generate an idle animation
 * Subtle breathing and weight shifting while standing
 */
export function generateIdleAnimation(): AnimationSequence {
  const keyframes: KeyframeData[] = [];
  const duration = 3;
  const fps = 24;
  const totalFrames = duration * fps;

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = frame / fps;
    const progress = (frame % totalFrames) / totalFrames;
    const bones: BoneTransform[] = [];

    // Breathing motion (chest expansion)
    const breathe = Math.sin(progress * Math.PI * 2) * 0.02;
    bones.push({
      name: 'Spine',
      position: { x: 0, y: breathe, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1 + breathe * 0.5, y: 1, z: 1 }
    });

    // Weight shift between feet
    const weightShift = Math.sin(progress * Math.PI * 2) * 0.1;
    bones.push({
      name: 'LeftLeg',
      position: { x: weightShift, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightLeg',
      position: { x: -weightShift, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Head slight tilt
    const headTilt = Math.sin(progress * Math.PI * 2) * 0.05;
    bones.push({
      name: 'Head',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: headTilt, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Arms at rest with slight sway
    const armSway = Math.sin(progress * Math.PI * 2) * 0.05;
    bones.push({
      name: 'LeftArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: armSway, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -armSway, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    keyframes.push({ time, bones });
  }

  return {
    id: 'idle',
    name: 'Idle',
    description: 'A subtle idle animation with breathing and weight shifting',
    duration,
    fps,
    keyframes,
    category: 'idle',
    difficulty: 'easy'
  };
}

/**
 * Generate a jump animation
 * Crouch, jump up, and land
 */
export function generateJumpAnimation(): AnimationSequence {
  const keyframes: KeyframeData[] = [];
  const duration = 1;
  const fps = 24;
  const totalFrames = duration * fps;

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = frame / fps;
    const progress = (frame % totalFrames) / totalFrames;
    const bones: BoneTransform[] = [];

    let verticalPos = 0;
    let legBend = 0;

    if (progress < 0.2) {
      // Crouch phase
      const crouchProgress = progress / 0.2;
      legBend = crouchProgress * 0.8;
      verticalPos = -crouchProgress * 0.3;
    } else if (progress < 0.6) {
      // Jump phase
      const jumpProgress = (progress - 0.2) / 0.4;
      verticalPos = -0.3 + Math.sin(jumpProgress * Math.PI) * 0.8;
      legBend = 0.8 - jumpProgress * 0.8;
    } else {
      // Landing phase
      const landProgress = (progress - 0.6) / 0.4;
      verticalPos = Math.max(-0.3, -0.3 + landProgress * 0.3);
      legBend = landProgress * 0.5;
    }

    // Legs
    bones.push({
      name: 'LeftLeg',
      position: { x: 0, y: verticalPos, z: 0 },
      rotation: { x: -legBend, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightLeg',
      position: { x: 0, y: verticalPos, z: 0 },
      rotation: { x: -legBend, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Spine extension during jump
    const spineExtension = Math.sin(Math.max(0, Math.min(1, (progress - 0.2) / 0.4)) * Math.PI) * 0.3;
    bones.push({
      name: 'Spine',
      position: { x: 0, y: verticalPos * 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1 + spineExtension, z: 1 }
    });

    // Arms up during jump
    const armRaise = Math.sin(Math.max(0, Math.min(1, (progress - 0.2) / 0.4)) * Math.PI) * 1.2;
    bones.push({
      name: 'LeftArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -armRaise, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -armRaise, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    keyframes.push({ time, bones });
  }

  return {
    id: 'jump',
    name: 'Jump',
    description: 'A dynamic jump animation with crouch, takeoff, and landing',
    duration,
    fps,
    keyframes,
    category: 'action',
    difficulty: 'medium'
  };
}

/**
 * Generate a wave gesture animation
 * Character waves hand
 */
export function generateWaveAnimation(): AnimationSequence {
  const keyframes: KeyframeData[] = [];
  const duration = 1;
  const fps = 24;
  const totalFrames = duration * fps;

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = frame / fps;
    const progress = (frame % totalFrames) / totalFrames;
    const bones: BoneTransform[] = [];

    // Raise right arm
    const armRaise = Math.max(0, Math.sin(progress * Math.PI * 2) * 1.2);
    bones.push({
      name: 'RightArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -armRaise, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Wave motion (forearm rotation)
    const waveMotion = Math.sin(progress * Math.PI * 4) * 0.8;
    bones.push({
      name: 'RightForearm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: waveMotion, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Left arm stays at rest
    bones.push({
      name: 'LeftArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Slight head tilt
    const headTilt = Math.sin(progress * Math.PI * 2) * 0.2;
    bones.push({
      name: 'Head',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: headTilt, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    keyframes.push({ time, bones });
  }

  return {
    id: 'wave',
    name: 'Wave',
    description: 'A friendly wave gesture with arm raising and hand waving',
    duration,
    fps,
    keyframes,
    category: 'gesture',
    difficulty: 'easy'
  };
}

/**
 * Generate a dance animation
 * Fun dancing with hip and arm movement
 */
export function generateDanceAnimation(): AnimationSequence {
  const keyframes: KeyframeData[] = [];
  const duration = 2;
  const fps = 24;
  const totalFrames = duration * fps;

  for (let frame = 0; frame <= totalFrames; frame++) {
    const time = frame / fps;
    const progress = (frame % totalFrames) / totalFrames;
    const bones: BoneTransform[] = [];

    // Hip sway
    const hipSway = Math.sin(progress * Math.PI * 4) * 0.3;
    bones.push({
      name: 'Spine',
      position: { x: hipSway, y: 0, z: 0 },
      rotation: { x: 0, y: hipSway * 0.5, z: Math.sin(progress * Math.PI * 4) * 0.2 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Alternating arm movement
    const leftArmMotion = Math.sin(progress * Math.PI * 4) * 1.0;
    const rightArmMotion = Math.sin((progress + 0.5) * Math.PI * 4) * 1.0;

    bones.push({
      name: 'LeftArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -leftArmMotion, y: leftArmMotion * 0.5, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightArm',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: -rightArmMotion, y: -rightArmMotion * 0.5, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Leg movement
    const legMotion = Math.sin(progress * Math.PI * 4) * 0.2;
    bones.push({
      name: 'LeftLeg',
      position: { x: legMotion, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    bones.push({
      name: 'RightLeg',
      position: { x: -legMotion, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    // Head bob
    const headBob = Math.sin(progress * Math.PI * 4) * 0.1;
    bones.push({
      name: 'Head',
      position: { x: 0, y: headBob, z: 0 },
      rotation: { x: 0, y: Math.sin(progress * Math.PI * 4) * 0.15, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    keyframes.push({ time, bones });
  }

  return {
    id: 'dance',
    name: 'Dance',
    description: 'A fun dance animation with hip sway and arm movement',
    duration,
    fps,
    keyframes,
    category: 'action',
    difficulty: 'medium'
  };
}

/**
 * Get all available animation sequences
 */
export function getAllAnimationSequences(): AnimationSequence[] {
  return [
    generateWalkCycle(),
    generateIdleAnimation(),
    generateJumpAnimation(),
    generateWaveAnimation(),
    generateDanceAnimation()
  ];
}

/**
 * Get animation sequences by category
 */
export function getAnimationsByCategory(category: AnimationSequence['category']): AnimationSequence[] {
  return getAllAnimationSequences().filter(seq => seq.category === category);
}
