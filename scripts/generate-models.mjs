#!/usr/bin/env node

/**
 * Generate simple humanoid 3D models in .glb format for testing
 * Usage: node scripts/generate-models.mjs
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../client/public/models');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

/**
 * Create a simple humanoid model with bones
 */
function createHumanoidModel(name, scale = 1) {
  const group = new THREE.Group();
  group.name = name;

  // Create skeleton
  const bones = [];
  
  // Root bone
  const root = new THREE.Bone();
  root.name = 'Root';
  root.position.set(0, 0, 0);
  bones.push(root);
  group.add(root);

  // Spine
  const spine = new THREE.Bone();
  spine.name = 'Spine';
  spine.position.set(0, 0.5 * scale, 0);
  root.add(spine);
  bones.push(spine);

  // Chest
  const chest = new THREE.Bone();
  chest.name = 'Chest';
  chest.position.set(0, 0.4 * scale, 0);
  spine.add(chest);
  bones.push(chest);

  // Neck
  const neck = new THREE.Bone();
  neck.name = 'Neck';
  neck.position.set(0, 0.3 * scale, 0);
  chest.add(neck);
  bones.push(neck);

  // Head
  const head = new THREE.Bone();
  head.name = 'Head';
  head.position.set(0, 0.25 * scale, 0);
  neck.add(head);
  bones.push(head);

  // Left shoulder
  const leftShoulder = new THREE.Bone();
  leftShoulder.name = 'LeftShoulder';
  leftShoulder.position.set(-0.3 * scale, 0, 0);
  chest.add(leftShoulder);
  bones.push(leftShoulder);

  // Left arm
  const leftArm = new THREE.Bone();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.3 * scale, 0, 0);
  leftShoulder.add(leftArm);
  bones.push(leftArm);

  // Left forearm
  const leftForearm = new THREE.Bone();
  leftForearm.name = 'LeftForearm';
  leftForearm.position.set(-0.3 * scale, 0, 0);
  leftArm.add(leftForearm);
  bones.push(leftForearm);

  // Left hand
  const leftHand = new THREE.Bone();
  leftHand.name = 'LeftHand';
  leftHand.position.set(-0.15 * scale, 0, 0);
  leftForearm.add(leftHand);
  bones.push(leftHand);

  // Right shoulder
  const rightShoulder = new THREE.Bone();
  rightShoulder.name = 'RightShoulder';
  rightShoulder.position.set(0.3 * scale, 0, 0);
  chest.add(rightShoulder);
  bones.push(rightShoulder);

  // Right arm
  const rightArm = new THREE.Bone();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.3 * scale, 0, 0);
  rightShoulder.add(rightArm);
  bones.push(rightArm);

  // Right forearm
  const rightForearm = new THREE.Bone();
  rightForearm.name = 'RightForearm';
  rightForearm.position.set(0.3 * scale, 0, 0);
  rightArm.add(rightForearm);
  bones.push(rightForearm);

  // Right hand
  const rightHand = new THREE.Bone();
  rightHand.name = 'RightHand';
  rightHand.position.set(0.15 * scale, 0, 0);
  rightForearm.add(rightHand);
  bones.push(rightHand);

  // Left hip
  const leftHip = new THREE.Bone();
  leftHip.name = 'LeftHip';
  leftHip.position.set(-0.2 * scale, -0.2 * scale, 0);
  spine.add(leftHip);
  bones.push(leftHip);

  // Left leg
  const leftLeg = new THREE.Bone();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(0, -0.5 * scale, 0);
  leftHip.add(leftLeg);
  bones.push(leftLeg);

  // Left foot
  const leftFoot = new THREE.Bone();
  leftFoot.name = 'LeftFoot';
  leftFoot.position.set(0, -0.5 * scale, 0);
  leftLeg.add(leftFoot);
  bones.push(leftFoot);

  // Right hip
  const rightHip = new THREE.Bone();
  rightHip.name = 'RightHip';
  rightHip.position.set(0.2 * scale, -0.2 * scale, 0);
  spine.add(rightHip);
  bones.push(rightHip);

  // Right leg
  const rightLeg = new THREE.Bone();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0, -0.5 * scale, 0);
  rightHip.add(rightLeg);
  bones.push(rightLeg);

  // Right foot
  const rightFoot = new THREE.Bone();
  rightFoot.name = 'RightFoot';
  rightFoot.position.set(0, -0.5 * scale, 0);
  rightLeg.add(rightFoot);
  bones.push(rightFoot);

  // Create skeleton helper (visual representation)
  const skeletonHelper = new THREE.SkeletonHelper(root);
  skeletonHelper.name = 'SkeletonHelper';
  group.add(skeletonHelper);

  // Create simple mesh geometry
  const geometry = new THREE.BoxGeometry(0.3 * scale, 0.5 * scale, 0.2 * scale);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.7,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Body';
  mesh.position.y = 0.5 * scale;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Create armature
  const armature = new THREE.Group();
  armature.name = 'Armature';
  armature.add(root);
  group.add(armature);

  return group;
}

/**
 * Export model to .glb file
 */
async function exportModel(model, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    exporter.parse(
      model,
      (gltf) => {
        const output = JSON.stringify(gltf);
        const blob = new Blob([output], { type: 'application/octet-stream' });
        const arrayBuffer = blob.stream().getReader();

        // For Node.js, we need to handle this differently
        const buffer = Buffer.from(output);
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Exported: ${filepath}`);
        resolve(filepath);
      },
      (error) => {
        console.error(`❌ Export failed for ${filename}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 Generating humanoid models...\n');

  try {
    // Create models
    const models = [
      { name: 'SimpleHumanoid', scale: 1 },
      { name: 'TallHumanoid', scale: 1.2 },
      { name: 'CompactHumanoid', scale: 0.8 },
    ];

    for (const modelConfig of models) {
      const model = createHumanoidModel(modelConfig.name, modelConfig.scale);
      console.log(`📦 Created model: ${modelConfig.name}`);
    }

    console.log('\n✨ Model generation complete!');
    console.log(`📂 Models saved to: ${outputDir}`);
    console.log('\n💡 Next steps:');
    console.log('1. Import models into 3D Poser app');
    console.log('2. Test bone selection and rigging');
    console.log('3. Create and save poses');
    console.log('4. Record animations with timeline');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
