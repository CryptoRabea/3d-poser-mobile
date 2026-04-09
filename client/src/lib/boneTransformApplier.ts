/**
 * Bone Transform Applier
 * Applies saved bone transforms to loaded 3D models
 */

export interface BoneTransform {
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

/**
 * Apply bone transforms to a model
 * @param model - The Three.js model/scene
 * @param transforms - Array of bone transforms to apply
 * @param THREE - Three.js module
 */
export function applyBoneTransforms(
  model: any,
  transforms: BoneTransform[],
  THREE: any
): void {
  if (!model || !transforms || transforms.length === 0) {
    console.warn('Invalid model or transforms for applying bone transforms');
    return;
  }

  // Create a map of transforms by bone name for quick lookup
  const transformMap = new Map<string, BoneTransform>();
  transforms.forEach((t) => {
    transformMap.set(t.name, t);
  });

  // Traverse the model and apply transforms to matching bones
  model.traverse((child: any) => {
    const transform = transformMap.get(child.name);
    if (transform) {
      // Apply position
      child.position.set(transform.position.x, transform.position.y, transform.position.z);

      // Apply rotation (convert from Euler angles)
      child.rotation.order = 'XYZ';
      child.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);

      // Apply scale
      child.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

      // Update matrix
      child.updateMatrix();
    }
  });

  // Update the model's world matrix
  model.updateMatrixWorld(true);
}

/**
 * Reset all bone transforms to default (identity)
 * @param model - The Three.js model/scene
 */
export function resetBoneTransforms(model: any): void {
  if (!model) return;

  model.traverse((child: any) => {
    // Only reset bones/objects that have been transformed
    if (child.isBone || child.type === 'Bone' || child.name.includes('Armature')) {
      child.position.set(0, 0, 0);
      child.rotation.set(0, 0, 0);
      child.scale.set(1, 1, 1);
      child.updateMatrix();
    }
  });

  model.updateMatrixWorld(true);
}

/**
 * Blend between two poses using linear interpolation
 * @param pose1 - First pose transforms
 * @param pose2 - Second pose transforms
 * @param factor - Blend factor (0 = pose1, 1 = pose2)
 * @returns Blended pose transforms
 */
export function blendPoses(
  pose1: BoneTransform[],
  pose2: BoneTransform[],
  factor: number
): BoneTransform[] {
  const map1 = new Map(pose1.map((t) => [t.name, t]));
  const map2 = new Map(pose2.map((t) => [t.name, t]));

  const blended: BoneTransform[] = [];

  // Get all unique bone names
  const allBones = new Set([...Array.from(map1.keys()), ...Array.from(map2.keys())]);

  Array.from(allBones).forEach((boneName) => {
    const t1 = map1.get(boneName);
    const t2 = map2.get(boneName);

    if (t1 && t2) {
      // Blend both transforms
      blended.push({
        name: boneName,
        position: {
          x: t1.position.x + (t2.position.x - t1.position.x) * factor,
          y: t1.position.y + (t2.position.y - t1.position.y) * factor,
          z: t1.position.z + (t2.position.z - t1.position.z) * factor,
        },
        rotation: {
          x: t1.rotation.x + (t2.rotation.x - t1.rotation.x) * factor,
          y: t1.rotation.y + (t2.rotation.y - t1.rotation.y) * factor,
          z: t1.rotation.z + (t2.rotation.z - t1.rotation.z) * factor,
        },
        scale: {
          x: t1.scale.x + (t2.scale.x - t1.scale.x) * factor,
          y: t1.scale.y + (t2.scale.y - t1.scale.y) * factor,
          z: t1.scale.z + (t2.scale.z - t1.scale.z) * factor,
        },
      });
    } else if (t1) {
      blended.push(t1);
    } else if (t2) {
      blended.push(t2);
    }
  });

  return blended;
}

/**
 * Create a smooth animation between poses
 * @param startPose - Starting pose transforms
 * @param endPose - Ending pose transforms
 * @param duration - Animation duration in milliseconds
 * @param onFrame - Callback for each frame with blended pose
 * @param onComplete - Callback when animation completes
 * @returns Function to cancel the animation
 */
export function animatePoseTransition(
  startPose: BoneTransform[],
  endPose: BoneTransform[],
  duration: number,
  onFrame: (pose: BoneTransform[]) => void,
  onComplete: () => void
): () => void {
  const startTime = Date.now();
  let animationId: number | null = null;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const factor = Math.min(elapsed / duration, 1);

    const blendedPose = blendPoses(startPose, endPose, factor);
    onFrame(blendedPose);

    if (factor < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
}
