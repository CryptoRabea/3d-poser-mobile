/**
 * Auto Rigger
 * Automatically detects humanoid skeleton structure and creates bone hierarchy
 */

import * as THREE from 'three';

export interface BoneDefinition {
  name: string;
  position: THREE.Vector3;
  parent?: string;
  type: 'joint' | 'limb' | 'spine';
}

export interface SkeletonStructure {
  bones: BoneDefinition[];
  hierarchy: Map<string, string[]>;
  rootBone: string;
}

export class AutoRigger {
  /**
   * Detect humanoid skeleton from model geometry
   */
  static detectHumanoidSkeleton(mesh: THREE.Mesh): SkeletonStructure {
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;

    // Extract key points from geometry
    const keyPoints = this.extractKeyPoints(positions);

    // Identify body parts
    const bodyParts = this.identifyBodyParts(keyPoints);

    // Create bone hierarchy
    const bones = this.createBoneHierarchy(bodyParts);

    // Build hierarchy map
    const hierarchy = new Map<string, string[]>();
    bones.forEach((bone) => {
      if (bone.parent) {
        if (!hierarchy.has(bone.parent)) {
          hierarchy.set(bone.parent, []);
        }
        hierarchy.get(bone.parent)!.push(bone.name);
      }
    });

    return {
      bones,
      hierarchy,
      rootBone: 'Armature',
    };
  }

  /**
   * Extract key points from mesh geometry
   */
  private static extractKeyPoints(positions: Float32Array): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const step = Math.max(1, Math.floor(positions.length / 100)); // Sample 100 points

    for (let i = 0; i < positions.length; i += step * 3) {
      points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }

    return points;
  }

  /**
   * Identify body parts from key points
   */
  private static identifyBodyParts(points: THREE.Vector3[]): Map<string, THREE.Vector3> {
    const parts = new Map<string, THREE.Vector3>();

    // Calculate bounding box
    const bbox = new THREE.Box3().setFromArray(
      points.flatMap((p) => [p.x, p.y, p.z])
    );
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    // Identify parts based on position
    const topY = bbox.max.y;
    const bottomY = bbox.min.y;
    const leftX = bbox.min.x;
    const rightX = bbox.max.x;
    const centerX = center.x;
    const centerZ = center.z;

    // Head (top of model)
    const headY = topY - size.y * 0.1;
    parts.set('Head', new THREE.Vector3(centerX, headY, centerZ));

    // Neck
    const neckY = topY - size.y * 0.2;
    parts.set('Neck', new THREE.Vector3(centerX, neckY, centerZ));

    // Spine
    const spineY = topY - size.y * 0.4;
    parts.set('Spine', new THREE.Vector3(centerX, spineY, centerZ));

    // Chest
    const chestY = topY - size.y * 0.35;
    parts.set('Chest', new THREE.Vector3(centerX, chestY, centerZ));

    // Hips
    const hipsY = topY - size.y * 0.55;
    parts.set('Hips', new THREE.Vector3(centerX, hipsY, centerZ));

    // Left shoulder
    const shoulderY = topY - size.y * 0.25;
    const shoulderX = centerX - size.x * 0.15;
    parts.set('LeftShoulder', new THREE.Vector3(shoulderX, shoulderY, centerZ));

    // Right shoulder
    const rightShoulderX = centerX + size.x * 0.15;
    parts.set('RightShoulder', new THREE.Vector3(rightShoulderX, shoulderY, centerZ));

    // Left elbow
    const elbowY = shoulderY - size.y * 0.15;
    const elbowX = shoulderX - size.x * 0.1;
    parts.set('LeftElbow', new THREE.Vector3(elbowX, elbowY, centerZ));

    // Right elbow
    const rightElbowX = rightShoulderX + size.x * 0.1;
    parts.set('RightElbow', new THREE.Vector3(rightElbowX, elbowY, centerZ));

    // Left wrist
    const wristY = elbowY - size.y * 0.15;
    const wristX = elbowX - size.x * 0.1;
    parts.set('LeftWrist', new THREE.Vector3(wristX, wristY, centerZ));

    // Right wrist
    const rightWristX = rightElbowX + size.x * 0.1;
    parts.set('RightWrist', new THREE.Vector3(rightWristX, wristY, centerZ));

    // Left hip
    const hipY = hipsY;
    const hipX = centerX - size.x * 0.1;
    parts.set('LeftHip', new THREE.Vector3(hipX, hipY, centerZ));

    // Right hip
    const rightHipX = centerX + size.x * 0.1;
    parts.set('RightHip', new THREE.Vector3(rightHipX, hipY, centerZ));

    // Left knee
    const kneeY = hipsY - size.y * 0.25;
    parts.set('LeftKnee', new THREE.Vector3(hipX, kneeY, centerZ));

    // Right knee
    parts.set('RightKnee', new THREE.Vector3(rightHipX, kneeY, centerZ));

    // Left ankle
    const ankleY = bottomY + size.y * 0.05;
    parts.set('LeftAnkle', new THREE.Vector3(hipX, ankleY, centerZ));

    // Right ankle
    parts.set('RightAnkle', new THREE.Vector3(rightHipX, ankleY, centerZ));

    return parts;
  }

  /**
   * Create bone hierarchy from identified body parts
   */
  private static createBoneHierarchy(parts: Map<string, THREE.Vector3>): BoneDefinition[] {
    const bones: BoneDefinition[] = [];

    // Root bone
    bones.push({
      name: 'Armature',
      position: parts.get('Hips') || new THREE.Vector3(),
      type: 'joint',
    });

    // Spine hierarchy
    bones.push({
      name: 'Hips',
      position: parts.get('Hips') || new THREE.Vector3(),
      parent: 'Armature',
      type: 'joint',
    });

    bones.push({
      name: 'Spine',
      position: parts.get('Spine') || new THREE.Vector3(),
      parent: 'Hips',
      type: 'spine',
    });

    bones.push({
      name: 'Chest',
      position: parts.get('Chest') || new THREE.Vector3(),
      parent: 'Spine',
      type: 'spine',
    });

    bones.push({
      name: 'Neck',
      position: parts.get('Neck') || new THREE.Vector3(),
      parent: 'Chest',
      type: 'joint',
    });

    bones.push({
      name: 'Head',
      position: parts.get('Head') || new THREE.Vector3(),
      parent: 'Neck',
      type: 'joint',
    });

    // Left arm
    bones.push({
      name: 'LeftShoulder',
      position: parts.get('LeftShoulder') || new THREE.Vector3(),
      parent: 'Chest',
      type: 'joint',
    });

    bones.push({
      name: 'LeftArm',
      position: parts.get('LeftShoulder') || new THREE.Vector3(),
      parent: 'LeftShoulder',
      type: 'limb',
    });

    bones.push({
      name: 'LeftForeArm',
      position: parts.get('LeftElbow') || new THREE.Vector3(),
      parent: 'LeftArm',
      type: 'limb',
    });

    bones.push({
      name: 'LeftHand',
      position: parts.get('LeftWrist') || new THREE.Vector3(),
      parent: 'LeftForeArm',
      type: 'joint',
    });

    // Right arm
    bones.push({
      name: 'RightShoulder',
      position: parts.get('RightShoulder') || new THREE.Vector3(),
      parent: 'Chest',
      type: 'joint',
    });

    bones.push({
      name: 'RightArm',
      position: parts.get('RightShoulder') || new THREE.Vector3(),
      parent: 'RightShoulder',
      type: 'limb',
    });

    bones.push({
      name: 'RightForeArm',
      position: parts.get('RightElbow') || new THREE.Vector3(),
      parent: 'RightArm',
      type: 'limb',
    });

    bones.push({
      name: 'RightHand',
      position: parts.get('RightWrist') || new THREE.Vector3(),
      parent: 'RightForeArm',
      type: 'joint',
    });

    // Left leg
    bones.push({
      name: 'LeftUpLeg',
      position: parts.get('LeftHip') || new THREE.Vector3(),
      parent: 'Hips',
      type: 'limb',
    });

    bones.push({
      name: 'LeftLeg',
      position: parts.get('LeftKnee') || new THREE.Vector3(),
      parent: 'LeftUpLeg',
      type: 'limb',
    });

    bones.push({
      name: 'LeftFoot',
      position: parts.get('LeftAnkle') || new THREE.Vector3(),
      parent: 'LeftLeg',
      type: 'joint',
    });

    // Right leg
    bones.push({
      name: 'RightUpLeg',
      position: parts.get('RightHip') || new THREE.Vector3(),
      parent: 'Hips',
      type: 'limb',
    });

    bones.push({
      name: 'RightLeg',
      position: parts.get('RightKnee') || new THREE.Vector3(),
      parent: 'RightUpLeg',
      type: 'limb',
    });

    bones.push({
      name: 'RightFoot',
      position: parts.get('RightAnkle') || new THREE.Vector3(),
      parent: 'RightLeg',
      type: 'joint',
    });

    return bones;
  }

  /**
   * Create Three.js Skeleton from bone definitions
   */
  static createSkeletonFromBones(bones: BoneDefinition[]): THREE.Skeleton {
    const boneObjects: THREE.Bone[] = [];
    const boneMap = new Map<string, THREE.Bone>();

    // Create all bones
    bones.forEach((boneDef) => {
      const bone = new THREE.Bone();
      bone.name = boneDef.name;
      bone.position.copy(boneDef.position);
      boneMap.set(boneDef.name, bone);
      boneObjects.push(bone);
    });

    // Build hierarchy
    bones.forEach((boneDef) => {
      if (boneDef.parent) {
        const parentBone = boneMap.get(boneDef.parent);
        const childBone = boneMap.get(boneDef.name);
        if (parentBone && childBone) {
          parentBone.add(childBone);
        }
      }
    });

    return new THREE.Skeleton(boneObjects);
  }

  /**
   * Apply skeleton to mesh with skinning
   */
  static applySkeletonToMesh(mesh: THREE.Mesh, skeleton: THREE.Skeleton): THREE.SkinnedMesh {
    const skinnedMesh = new THREE.SkinnedMesh(mesh.geometry, mesh.material);
    skinnedMesh.add(skeleton.bones[0]);
    skinnedMesh.bind(skeleton);
    skinnedMesh.position.copy(mesh.position);
    skinnedMesh.rotation.copy(mesh.rotation);
    skinnedMesh.scale.copy(mesh.scale);

    return skinnedMesh;
  }
}
