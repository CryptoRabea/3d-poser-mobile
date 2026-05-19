import { useEffect, useRef, useState, useCallback } from 'react';
import type { BoneTransform } from '@/lib/poseStorage';
import type {
  BonePhysicsBody,
  PhysicsConfig,
  BoneConstraint,
} from '@/lib/bonePhysics';
import {
  createBonePhysicsBody,
  simulateRagdoll,
  bodiesToBoneTransforms,
  createDefaultPhysicsConfig,
  applyWindEffect,
  resolveDistanceConstraint,
} from '@/lib/bonePhysics';

interface UsePhysicsSimulationOptions {
  onUpdate?: (bones: BoneTransform[]) => void;
  config?: Partial<PhysicsConfig>;
}

export function usePhysicsSimulation(options: UsePhysicsSimulationOptions = {}) {
  const { onUpdate, config: userConfig = {} } = options;
  const [isSimulating, setIsSimulating] = useState(false);
  const [windStrength, setWindStrength] = useState(0);
  const [windDirection, setWindDirection] = useState({ x: 1, y: 0, z: 0 });

  const bodiesRef = useRef<BonePhysicsBody[]>([]);
  const constraintsRef = useRef<BoneConstraint[]>([]);
  const configRef = useRef<PhysicsConfig>({
    ...createDefaultPhysicsConfig(),
    ...userConfig,
  });
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  /**
   * Initialize physics bodies from bone transforms
   */
  const initializeFromBones = useCallback((bones: BoneTransform[]) => {
    bodiesRef.current = bones.map((bone) =>
      createBonePhysicsBody(
        bone.name,
        bone.position,
        bone.name === 'Head' || bone.name === 'Spine' ? 2.0 : 1.0,
        0.15,
        bone.name === 'Spine' // Pin spine to reduce wild movement
      )
    );
  }, []);

  /**
   * Create constraints between connected bones
   */
  const createBoneConstraints = useCallback(() => {
    const bodies = bodiesRef.current;
    const bodyMap = new Map(bodies.map((b) => [b.boneName, b]));

    // Define bone connections (parent-child relationships)
    const connections: Array<[string, string, number, number]> = [
      ['Spine', 'Head', 0.3, 0.5],
      ['Spine', 'LeftShoulder', 0.2, 0.4],
      ['Spine', 'RightShoulder', 0.2, 0.4],
      ['Spine', 'LeftHip', 0.3, 0.5],
      ['Spine', 'RightHip', 0.3, 0.5],
      ['LeftShoulder', 'LeftElbow', 0.2, 0.35],
      ['LeftElbow', 'LeftWrist', 0.15, 0.3],
      ['RightShoulder', 'RightElbow', 0.2, 0.35],
      ['RightElbow', 'RightWrist', 0.15, 0.3],
      ['LeftHip', 'LeftKnee', 0.3, 0.5],
      ['LeftKnee', 'LeftAnkle', 0.25, 0.4],
      ['RightHip', 'RightKnee', 0.3, 0.5],
      ['RightKnee', 'RightAnkle', 0.25, 0.4],
    ];

    constraintsRef.current = connections
      .map(([parent, child, minDist, maxDist]) => {
        const body1 = bodyMap.get(parent);
        const body2 = bodyMap.get(child);
        if (!body1 || !body2) return null;

        return {
          body1,
          body2,
          minDistance: minDist,
          maxDistance: maxDist,
          stiffness: 0.9,
        };
      })
      .filter((c) => c !== null) as BoneConstraint[];
  }, []);

  /**
   * Start physics simulation
   */
  const startSimulation = useCallback((initialBones: BoneTransform[]) => {
    initializeFromBones(initialBones);
    createBoneConstraints();
    setIsSimulating(true);
    lastTimeRef.current = Date.now();
  }, [initializeFromBones, createBoneConstraints]);

  /**
   * Stop physics simulation
   */
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  /**
   * Update physics configuration
   */
  const updateConfig = useCallback((newConfig: Partial<PhysicsConfig>) => {
    configRef.current = {
      ...configRef.current,
      ...newConfig,
    };
  }, []);

  /**
   * Apply impulse to a bone
   */
  const applyImpulse = useCallback(
    (boneName: string, impulse: { x: number; y: number; z: number }) => {
      const body = bodiesRef.current.find((b) => b.boneName === boneName);
      if (body) {
        body.velocity.x += impulse.x;
        body.velocity.y += impulse.y;
        body.velocity.z += impulse.z;
      }
    },
    []
  );

  /**
   * Main simulation loop
   */
  useEffect(() => {
    if (!isSimulating) return;

    const simulate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.016); // Cap at 60 FPS
      lastTimeRef.current = now;

      // Apply wind
      if (windStrength > 0) {
        applyWindEffect(bodiesRef.current, windStrength, windDirection);
      }

      // Simulate physics
      simulateRagdoll(bodiesRef.current, configRef.current, deltaTime);

      // Resolve constraints
      for (let i = 0; i < configRef.current.iterations; i++) {
        for (const constraint of constraintsRef.current) {
          resolveDistanceConstraint(constraint);
        }
      }

      // Convert to bone transforms and update
      const transforms = bodiesToBoneTransforms(bodiesRef.current);
      onUpdate?.(transforms);

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSimulating, windStrength, windDirection, onUpdate]);

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    updateConfig,
    applyImpulse,
    windStrength,
    setWindStrength,
    windDirection,
    setWindDirection,
  };
}
