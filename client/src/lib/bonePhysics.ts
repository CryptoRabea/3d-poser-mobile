/**
 * Physics-Based Bone Dynamics
 * Simulates realistic bone movement with gravity, collisions, and constraints
 */

import type { BoneTransform } from './poseStorage';

export interface BonePhysicsBody {
  boneName: string;
  mass: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
  radius: number; // For collision detection
  pinned: boolean; // If true, not affected by physics
}

export interface PhysicsConfig {
  gravity: { x: number; y: number; z: number };
  damping: number; // 0-1, higher = more damping
  angularDamping: number;
  timeStep: number; // in seconds
  iterations: number;
  enableCollisions: boolean;
  enableGravity: boolean;
  windForce: { x: number; y: number; z: number };
}

/**
 * Create a physics body for a bone
 */
export function createBonePhysicsBody(
  boneName: string,
  position: { x: number; y: number; z: number },
  mass: number = 1.0,
  radius: number = 0.1,
  pinned: boolean = false
): BonePhysicsBody {
  return {
    boneName,
    mass,
    position: { ...position },
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    radius,
    pinned,
  };
}

/**
 * Apply force to a bone
 */
export function applyForce(
  body: BonePhysicsBody,
  force: { x: number; y: number; z: number }
): void {
  if (body.pinned || body.mass === 0) return;

  body.acceleration.x += force.x / body.mass;
  body.acceleration.y += force.y / body.mass;
  body.acceleration.z += force.z / body.mass;
}

/**
 * Apply torque (rotational force) to a bone
 */
export function applyTorque(
  body: BonePhysicsBody,
  torque: { x: number; y: number; z: number }
): void {
  if (body.pinned || body.mass === 0) return;

  const inertia = body.mass * body.radius * body.radius;
  body.angularVelocity.x += torque.x / inertia;
  body.angularVelocity.y += torque.y / inertia;
  body.angularVelocity.z += torque.z / inertia;
}

/**
 * Update bone physics simulation
 */
export function updateBonePhysics(
  body: BonePhysicsBody,
  config: PhysicsConfig,
  deltaTime: number
): void {
  if (body.pinned) return;

  // Apply gravity
  if (config.enableGravity) {
    applyForce(body, config.gravity);
  }

  // Apply wind force
  if (config.windForce.x !== 0 || config.windForce.y !== 0 || config.windForce.z !== 0) {
    applyForce(body, config.windForce);
  }

  // Update velocity
  body.velocity.x += body.acceleration.x * deltaTime;
  body.velocity.y += body.acceleration.y * deltaTime;
  body.velocity.z += body.acceleration.z * deltaTime;

  // Apply damping
  body.velocity.x *= 1 - config.damping;
  body.velocity.y *= 1 - config.damping;
  body.velocity.z *= 1 - config.damping;

  // Update position
  body.position.x += body.velocity.x * deltaTime;
  body.position.y += body.velocity.y * deltaTime;
  body.position.z += body.velocity.z * deltaTime;

  // Update angular velocity with damping
  body.angularVelocity.x *= 1 - config.angularDamping;
  body.angularVelocity.y *= 1 - config.angularDamping;
  body.angularVelocity.z *= 1 - config.angularDamping;

  // Update rotation
  body.rotation.x += body.angularVelocity.x * deltaTime;
  body.rotation.y += body.angularVelocity.y * deltaTime;
  body.rotation.z += body.angularVelocity.z * deltaTime;

  // Reset acceleration
  body.acceleration.x = 0;
  body.acceleration.y = 0;
  body.acceleration.z = 0;
}

/**
 * Check collision between two bones
 */
export function checkBoneCollision(body1: BonePhysicsBody, body2: BonePhysicsBody): boolean {
  const dx = body2.position.x - body1.position.x;
  const dy = body2.position.y - body1.position.y;
  const dz = body2.position.z - body1.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance < body1.radius + body2.radius;
}

/**
 * Resolve collision between two bones
 */
export function resolveBoneCollision(body1: BonePhysicsBody, body2: BonePhysicsBody): void {
  const dx = body2.position.x - body1.position.x;
  const dy = body2.position.y - body1.position.y;
  const dz = body2.position.z - body1.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distance === 0) return;

  // Normalize direction
  const nx = dx / distance;
  const ny = dy / distance;
  const nz = dz / distance;

  // Minimum separation distance
  const minSeparation = body1.radius + body2.radius;
  const overlap = minSeparation - distance;

  if (overlap <= 0) return;

  // Separate bodies
  const separation = overlap / 2;
  if (!body1.pinned) {
    body1.position.x -= nx * separation;
    body1.position.y -= ny * separation;
    body1.position.z -= nz * separation;
  }
  if (!body2.pinned) {
    body2.position.x += nx * separation;
    body2.position.y += ny * separation;
    body2.position.z += nz * separation;
  }

  // Apply impulse for bounce
  const restitution = 0.5; // Bounce factor
  const relativeVelocity = {
    x: body2.velocity.x - body1.velocity.x,
    y: body2.velocity.y - body1.velocity.y,
    z: body2.velocity.z - body1.velocity.z,
  };

  const velocityAlongNormal = relativeVelocity.x * nx + relativeVelocity.y * ny + relativeVelocity.z * nz;

  if (velocityAlongNormal < 0) return;

  const impulse = -(1 + restitution) * velocityAlongNormal / (1 / body1.mass + 1 / body2.mass);

  if (!body1.pinned) {
    body1.velocity.x -= (impulse / body1.mass) * nx;
    body1.velocity.y -= (impulse / body1.mass) * ny;
    body1.velocity.z -= (impulse / body1.mass) * nz;
  }
  if (!body2.pinned) {
    body2.velocity.x += (impulse / body2.mass) * nx;
    body2.velocity.y += (impulse / body2.mass) * ny;
    body2.velocity.z += (impulse / body2.mass) * nz;
  }
}

/**
 * Convert bone physics bodies to bone transforms
 */
export function bodiesToBoneTransforms(bodies: BonePhysicsBody[]): BoneTransform[] {
  return bodies.map((body) => ({
    name: body.boneName,
    position: { ...body.position },
    rotation: { ...body.rotation },
    scale: { x: 1, y: 1, z: 1 },
  }));
}

/**
 * Create default physics configuration
 */
export function createDefaultPhysicsConfig(): PhysicsConfig {
  return {
    gravity: { x: 0, y: -9.81, z: 0 },
    damping: 0.3,
    angularDamping: 0.3,
    timeStep: 1 / 60, // 60 FPS
    iterations: 3,
    enableCollisions: true,
    enableGravity: true,
    windForce: { x: 0, y: 0, z: 0 },
  };
}

/**
 * Simulate ragdoll physics
 */
export function simulateRagdoll(
  bodies: BonePhysicsBody[],
  config: PhysicsConfig,
  deltaTime: number
): void {
  // Update all bodies
  for (let i = 0; i < bodies.length; i++) {
    updateBonePhysics(bodies[i], config, deltaTime);
  }

  // Collision detection and resolution
  if (config.enableCollisions) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        if (checkBoneCollision(bodies[i], bodies[j])) {
          resolveBoneCollision(bodies[i], bodies[j]);
        }
      }
    }
  }
}

/**
 * Apply wind effect to bones
 */
export function applyWindEffect(
  bodies: BonePhysicsBody[],
  windStrength: number,
  windDirection: { x: number; y: number; z: number }
): void {
  const normalizedDir = {
    x: windDirection.x,
    y: windDirection.y,
    z: windDirection.z,
  };
  const length = Math.sqrt(
    normalizedDir.x * normalizedDir.x +
    normalizedDir.y * normalizedDir.y +
    normalizedDir.z * normalizedDir.z
  );
  if (length > 0) {
    normalizedDir.x /= length;
    normalizedDir.y /= length;
    normalizedDir.z /= length;
  }

  for (const body of bodies) {
    const force = {
      x: normalizedDir.x * windStrength,
      y: normalizedDir.y * windStrength,
      z: normalizedDir.z * windStrength,
    };
    applyForce(body, force);
  }
}

/**
 * Create constraint between two bones
 */
export interface BoneConstraint {
  body1: BonePhysicsBody;
  body2: BonePhysicsBody;
  minDistance: number;
  maxDistance: number;
  stiffness: number; // 0-1
}

/**
 * Resolve distance constraint
 */
export function resolveDistanceConstraint(constraint: BoneConstraint): void {
  const dx = constraint.body2.position.x - constraint.body1.position.x;
  const dy = constraint.body2.position.y - constraint.body1.position.y;
  const dz = constraint.body2.position.z - constraint.body1.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distance < constraint.minDistance || distance > constraint.maxDistance) {
    const targetDistance = Math.max(constraint.minDistance, Math.min(constraint.maxDistance, distance));
    const correction = (distance - targetDistance) / distance;

    const correctionX = dx * correction * constraint.stiffness;
    const correctionY = dy * correction * constraint.stiffness;
    const correctionZ = dz * correction * constraint.stiffness;

    if (!constraint.body1.pinned) {
      constraint.body1.position.x += correctionX;
      constraint.body1.position.y += correctionY;
      constraint.body1.position.z += correctionZ;
    }
    if (!constraint.body2.pinned) {
      constraint.body2.position.x -= correctionX;
      constraint.body2.position.y -= correctionY;
      constraint.body2.position.z -= correctionZ;
    }
  }
}
