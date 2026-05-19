/**
 * Advanced Joint Constraints for Realistic Bone Connections
 * Implements hinge joints and ball-socket joints with rotation limits
 */

import type { BonePhysicsBody } from './bonePhysics';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Hinge Joint - Allows rotation around a single axis (like an elbow or knee)
 */
export interface HingeJoint {
  type: 'hinge';
  bodyA: BonePhysicsBody;
  bodyB: BonePhysicsBody;
  pivotA: Vector3; // Local pivot point on body A
  pivotB: Vector3; // Local pivot point on body B
  axis: Vector3; // Rotation axis (normalized)
  minAngle: number; // Minimum rotation angle in radians
  maxAngle: number; // Maximum rotation angle in radians
  stiffness: number; // 0-1, constraint strength
  damping: number; // Damping for oscillations
}

/**
 * Ball-Socket Joint - Allows rotation in all directions with cone limits (like a shoulder or hip)
 */
export interface BallSocketJoint {
  type: 'ball-socket';
  bodyA: BonePhysicsBody;
  bodyB: BonePhysicsBody;
  pivotA: Vector3; // Local pivot point on body A
  pivotB: Vector3; // Local pivot point on body B
  maxConeAngle: number; // Maximum rotation angle from rest position (radians)
  twistMinAngle: number; // Min twist rotation around forward axis
  twistMaxAngle: number; // Max twist rotation around forward axis
  stiffness: number;
  damping: number;
}

export type Joint = HingeJoint | BallSocketJoint;

/**
 * Vector utilities
 */
export const Vec3 = {
  create: (x: number = 0, y: number = 0, z: number = 0): Vector3 => ({ x, y, z }),
  
  add: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  }),
  
  subtract: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }),
  
  scale: (v: Vector3, s: number): Vector3 => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
  }),
  
  dot: (a: Vector3, b: Vector3): number => a.x * b.x + a.y * b.y + a.z * b.z,
  
  cross: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  
  length: (v: Vector3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  
  normalize: (v: Vector3): Vector3 => {
    const len = Vec3.length(v);
    return len > 0 ? Vec3.scale(v, 1 / len) : v;
  },
  
  distance: (a: Vector3, b: Vector3): number => Vec3.length(Vec3.subtract(b, a)),
};

/**
 * Quaternion utilities
 */
export const Quat = {
  create: (x: number = 0, y: number = 0, z: number = 0, w: number = 1): Quaternion => ({ x, y, z, w }),
  
  identity: (): Quaternion => ({ x: 0, y: 0, z: 0, w: 1 }),
  
  fromAxisAngle: (axis: Vector3, angle: number): Quaternion => {
    const normalized = Vec3.normalize(axis);
    const halfAngle = angle / 2;
    const sin = Math.sin(halfAngle);
    return {
      x: normalized.x * sin,
      y: normalized.y * sin,
      z: normalized.z * sin,
      w: Math.cos(halfAngle),
    };
  },
  
  toAxisAngle: (q: Quaternion): { axis: Vector3; angle: number } => {
    const angle = 2 * Math.acos(Math.max(-1, Math.min(1, q.w)));
    const sin = Math.sin(angle / 2);
    const axis = sin > 0.001
      ? { x: q.x / sin, y: q.y / sin, z: q.z / sin }
      : { x: 0, y: 0, z: 1 };
    return { axis, angle };
  },
  
  multiply: (a: Quaternion, b: Quaternion): Quaternion => ({
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  }),
  
  conjugate: (q: Quaternion): Quaternion => ({ x: -q.x, y: -q.y, z: -q.z, w: q.w }),
  
  rotateVector: (q: Quaternion, v: Vector3): Vector3 => {
    const qConj = Quat.conjugate(q);
    const vQuat: Quaternion = { x: v.x, y: v.y, z: v.z, w: 0 };
    const result = Quat.multiply(Quat.multiply(q, vQuat), qConj);
    return { x: result.x, y: result.y, z: result.z };
  },
};

/**
 * Create a hinge joint between two bones
 */
export function createHingeJoint(
  bodyA: BonePhysicsBody,
  bodyB: BonePhysicsBody,
  pivotA: Vector3,
  pivotB: Vector3,
  axis: Vector3,
  minAngle: number,
  maxAngle: number,
  stiffness: number = 0.9,
  damping: number = 0.3
): HingeJoint {
  return {
    type: 'hinge',
    bodyA,
    bodyB,
    pivotA,
    pivotB,
    axis: Vec3.normalize(axis),
    minAngle,
    maxAngle,
    stiffness,
    damping,
  };
}

/**
 * Create a ball-socket joint between two bones
 */
export function createBallSocketJoint(
  bodyA: BonePhysicsBody,
  bodyB: BonePhysicsBody,
  pivotA: Vector3,
  pivotB: Vector3,
  maxConeAngle: number,
  twistMinAngle: number = -Math.PI,
  twistMaxAngle: number = Math.PI,
  stiffness: number = 0.9,
  damping: number = 0.3
): BallSocketJoint {
  return {
    type: 'ball-socket',
    bodyA,
    bodyB,
    pivotA,
    pivotB,
    maxConeAngle,
    twistMinAngle,
    twistMaxAngle,
    stiffness,
    damping,
  };
}

/**
 * Resolve hinge joint constraint
 */
export function resolveHingeJoint(joint: HingeJoint): void {
  // Get world positions of pivots
  const worldPivotA = Vec3.add(joint.bodyA.position, joint.pivotA);
  const worldPivotB = Vec3.add(joint.bodyB.position, joint.pivotB);

  // Correct position constraint (keep pivots together)
  const posError = Vec3.subtract(worldPivotB, worldPivotA);
  const posErrorLength = Vec3.length(posError);

  if (posErrorLength > 0.001) {
    const correction = Vec3.scale(posError, -joint.stiffness * 0.5);

    if (!joint.bodyA.pinned) {
      joint.bodyA.position = Vec3.add(joint.bodyA.position, correction);
    }
    if (!joint.bodyB.pinned) {
      joint.bodyB.position = Vec3.subtract(joint.bodyB.position, correction);
    }
  }

  // Correct rotation constraint
  const relativeRotation = Vec3.subtract(joint.bodyB.rotation, joint.bodyA.rotation);
  
  // Project rotation onto hinge axis
  const axisRotation = Vec3.dot(relativeRotation, joint.axis);
  
  // Clamp to angle limits
  const clampedRotation = Math.max(joint.minAngle, Math.min(joint.maxAngle, axisRotation));
  const rotationError = axisRotation - clampedRotation;

  if (Math.abs(rotationError) > 0.001) {
    const correction = Vec3.scale(joint.axis, -rotationError * joint.stiffness);

    if (!joint.bodyA.pinned) {
      joint.bodyA.angularVelocity = Vec3.add(
        joint.bodyA.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
    if (!joint.bodyB.pinned) {
      joint.bodyB.angularVelocity = Vec3.subtract(
        joint.bodyB.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
  }
}

/**
 * Resolve ball-socket joint constraint
 */
export function resolveBallSocketJoint(joint: BallSocketJoint): void {
  // Get world positions of pivots
  const worldPivotA = Vec3.add(joint.bodyA.position, joint.pivotA);
  const worldPivotB = Vec3.add(joint.bodyB.position, joint.pivotB);

  // Correct position constraint
  const posError = Vec3.subtract(worldPivotB, worldPivotA);
  const posErrorLength = Vec3.length(posError);

  if (posErrorLength > 0.001) {
    const correction = Vec3.scale(posError, -joint.stiffness * 0.5);

    if (!joint.bodyA.pinned) {
      joint.bodyA.position = Vec3.add(joint.bodyA.position, correction);
    }
    if (!joint.bodyB.pinned) {
      joint.bodyB.position = Vec3.subtract(joint.bodyB.position, correction);
    }
  }

  // Correct rotation constraint - cone limit
  const relativeRotation = Vec3.subtract(joint.bodyB.rotation, joint.bodyA.rotation);
  const rotationMagnitude = Vec3.length(relativeRotation);

  if (rotationMagnitude > joint.maxConeAngle) {
    const normalized = Vec3.normalize(relativeRotation);
    const correction = Vec3.scale(
      normalized,
      (rotationMagnitude - joint.maxConeAngle) * joint.stiffness
    );

    if (!joint.bodyA.pinned) {
      joint.bodyA.angularVelocity = Vec3.add(
        joint.bodyA.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
    if (!joint.bodyB.pinned) {
      joint.bodyB.angularVelocity = Vec3.subtract(
        joint.bodyB.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
  }

  // Twist constraint (rotation around forward axis)
  const forwardAxis = Vec3.create(0, 0, 1);
  const twistRotation = Vec3.dot(relativeRotation, forwardAxis);
  const clampedTwist = Math.max(joint.twistMinAngle, Math.min(joint.twistMaxAngle, twistRotation));
  const twistError = twistRotation - clampedTwist;

  if (Math.abs(twistError) > 0.001) {
    const correction = Vec3.scale(forwardAxis, -twistError * joint.stiffness);

    if (!joint.bodyA.pinned) {
      joint.bodyA.angularVelocity = Vec3.add(
        joint.bodyA.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
    if (!joint.bodyB.pinned) {
      joint.bodyB.angularVelocity = Vec3.subtract(
        joint.bodyB.angularVelocity,
        Vec3.scale(correction, joint.damping)
      );
    }
  }
}

/**
 * Resolve any joint constraint
 */
export function resolveJoint(joint: Joint): void {
  if (joint.type === 'hinge') {
    resolveHingeJoint(joint);
  } else if (joint.type === 'ball-socket') {
    resolveBallSocketJoint(joint);
  }
}

/**
 * Predefined joint configurations for human skeleton
 */
export const JOINT_CONFIGS = {
  // Hinge joints (single axis rotation)
  ELBOW: {
    type: 'hinge' as const,
    minAngle: 0,
    maxAngle: Math.PI * 0.9, // ~160 degrees
    axis: Vec3.create(1, 0, 0), // X-axis rotation
  },
  KNEE: {
    type: 'hinge' as const,
    minAngle: 0,
    maxAngle: Math.PI * 0.85, // ~150 degrees
    axis: Vec3.create(1, 0, 0),
  },
  ANKLE: {
    type: 'hinge' as const,
    minAngle: -Math.PI * 0.3, // ~-50 degrees
    maxAngle: Math.PI * 0.3, // ~50 degrees
    axis: Vec3.create(1, 0, 0),
  },
  
  // Ball-socket joints (multi-axis rotation)
  SHOULDER: {
    type: 'ball-socket' as const,
    maxConeAngle: Math.PI * 0.8, // ~140 degrees
    twistMinAngle: -Math.PI * 0.6,
    twistMaxAngle: Math.PI * 0.6,
  },
  HIP: {
    type: 'ball-socket' as const,
    maxConeAngle: Math.PI * 0.7, // ~120 degrees
    twistMinAngle: -Math.PI * 0.5,
    twistMaxAngle: Math.PI * 0.5,
  },
  NECK: {
    type: 'ball-socket' as const,
    maxConeAngle: Math.PI * 0.4, // ~70 degrees
    twistMinAngle: -Math.PI * 0.3,
    twistMaxAngle: Math.PI * 0.3,
  },
};

/**
 * Get joint configuration by bone pair name
 */
export function getJointConfig(parentBone: string, childBone: string) {
  const key = `${parentBone}-${childBone}`;
  
  const configs: Record<string, typeof JOINT_CONFIGS[keyof typeof JOINT_CONFIGS]> = {
    'LeftShoulder-LeftElbow': JOINT_CONFIGS.SHOULDER,
    'LeftElbow-LeftWrist': JOINT_CONFIGS.ELBOW,
    'RightShoulder-RightElbow': JOINT_CONFIGS.SHOULDER,
    'RightElbow-RightWrist': JOINT_CONFIGS.ELBOW,
    'LeftHip-LeftKnee': JOINT_CONFIGS.HIP,
    'LeftKnee-LeftAnkle': JOINT_CONFIGS.KNEE,
    'RightHip-RightKnee': JOINT_CONFIGS.HIP,
    'RightKnee-RightAnkle': JOINT_CONFIGS.KNEE,
    'Spine-Head': JOINT_CONFIGS.NECK,
  };
  
  return configs[key];
}
