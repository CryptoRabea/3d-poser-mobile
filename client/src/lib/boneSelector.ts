/**
 * Bone Selection & Visualization System
 * Handles bone selection, highlighting, and transform display
 */

export interface BoneInfo {
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  children: number;
  isVisible: boolean;
}

// Store original materials for deselection
const originalMaterials = new WeakMap<any, any>();

/**
 * Find a bone by name in the model
 * @param model - The Three.js model/scene
 * @param boneName - Name of the bone to find
 * @returns The bone object or null
 */
export function findBoneByName(model: any, boneName: string): any {
  let foundBone = null;
  model.traverse((child: any) => {
    if (child.name === boneName) {
      foundBone = child;
    }
  });
  return foundBone;
}

/**
 * Get all bones in a model
 * @param model - The Three.js model/scene
 * @returns Array of bone objects
 */
export function getAllBones(model: any): any[] {
  const bones: any[] = [];
  model.traverse((child: any) => {
    if (child.isBone || child.type === 'Bone' || child.name.includes('Armature')) {
      bones.push(child);
    }
  });
  return bones;
}

/**
 * Get information about a bone
 * @param bone - The bone object
 * @returns BoneInfo object
 */
export function getBoneInfo(bone: any): BoneInfo {
  return {
    name: bone.name,
    type: bone.type,
    position: {
      x: parseFloat(bone.position.x.toFixed(4)),
      y: parseFloat(bone.position.y.toFixed(4)),
      z: parseFloat(bone.position.z.toFixed(4)),
    },
    rotation: {
      x: parseFloat(bone.rotation.x.toFixed(4)),
      y: parseFloat(bone.rotation.y.toFixed(4)),
      z: parseFloat(bone.rotation.z.toFixed(4)),
    },
    scale: {
      x: parseFloat(bone.scale.x.toFixed(4)),
      y: parseFloat(bone.scale.y.toFixed(4)),
      z: parseFloat(bone.scale.z.toFixed(4)),
    },
    children: bone.children.length,
    isVisible: bone.visible,
  };
}

/**
 * Highlight a bone by changing its material
 * @param bone - The bone object to highlight
 * @param THREE - Three.js module
 * @param color - Highlight color (default: 0xff0000 red)
 */
export function highlightBone(bone: any, THREE: any, color: number = 0xff0000): void {
  if (!bone) return;

  // Traverse the bone and its children to highlight meshes
  bone.traverse((child: any) => {
    if (child.isMesh && child.material) {
      // Store original material
      if (!originalMaterials.has(child)) {
        originalMaterials.set(child, child.material);
      }

      // Create highlight material
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: false,
      });

      child.material = highlightMaterial;
    }
  });
}

/**
 * Remove highlight from a bone
 * @param bone - The bone object to unhighlight
 */
export function unhighlightBone(bone: any): void {
  if (!bone) return;

  bone.traverse((child: any) => {
    if (child.isMesh && originalMaterials.has(child)) {
      child.material = originalMaterials.get(child);
    }
  });
}

/**
 * Create a visual indicator (wireframe box) around a bone
 * @param bone - The bone object
 * @param THREE - Three.js module
 * @returns The indicator object
 */
export function createBoneIndicator(bone: any, THREE: any): any {
  const size = 0.1;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });

  const indicator = new THREE.Mesh(geometry, material);
  indicator.position.copy(bone.position);
  indicator.name = `indicator_${bone.name}`;

  return indicator;
}

/**
 * Update bone transform values
 * @param bone - The bone object
 * @param position - New position (optional)
 * @param rotation - New rotation in Euler angles (optional)
 * @param scale - New scale (optional)
 */
export function updateBoneTransform(
  bone: any,
  position?: { x: number; y: number; z: number },
  rotation?: { x: number; y: number; z: number },
  scale?: { x: number; y: number; z: number }
): void {
  if (!bone) return;

  if (position) {
    bone.position.set(position.x, position.y, position.z);
  }

  if (rotation) {
    bone.rotation.order = 'XYZ';
    bone.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  if (scale) {
    bone.scale.set(scale.x, scale.y, scale.z);
  }

  bone.updateMatrix();
}

/**
 * Raycast to find bones under mouse/touch position
 * @param raycaster - Three.js Raycaster
 * @param model - The 3D model
 * @param camera - The camera
 * @param x - Mouse/touch X position (normalized -1 to 1)
 * @param y - Mouse/touch Y position (normalized -1 to 1)
 * @returns Array of intersected objects
 */
export function raycastBones(raycaster: any, model: any, camera: any, x: number, y: number): any[] {
  raycaster.setFromCamera({ x, y }, camera);

  // Get all bones in the model
  const bones = getAllBones(model);
  const intersects = raycaster.intersectObjects(bones, true);

  return intersects;
}

/**
 * Get the closest bone to a position
 * @param raycaster - Three.js Raycaster
 * @param model - The 3D model
 * @param camera - The camera
 * @param x - Mouse/touch X position (normalized -1 to 1)
 * @param y - Mouse/touch Y position (normalized -1 to 1)
 * @returns The closest bone or null
 */
export function getClosestBone(raycaster: any, model: any, camera: any, x: number, y: number): any {
  const intersects = raycastBones(raycaster, model, camera, x, y);
  if (intersects.length > 0) {
    // Find the closest bone (traverse up to find the actual bone)
    let obj = intersects[0].object;
    while (obj && !obj.isBone && obj.parent) {
      obj = obj.parent;
    }
    return obj?.isBone ? obj : null;
  }
  return null;
}

/**
 * Toggle bone visibility
 * @param bone - The bone object
 */
export function toggleBoneVisibility(bone: any): void {
  if (!bone) return;
  bone.visible = !bone.visible;
}

/**
 * Show all bones in a model
 * @param model - The 3D model
 */
export function showAllBones(model: any): void {
  const bones = getAllBones(model);
  bones.forEach((bone) => {
    bone.visible = true;
  });
}

/**
 * Hide all bones in a model
 * @param model - The 3D model
 */
export function hideAllBones(model: any): void {
  const bones = getAllBones(model);
  bones.forEach((bone) => {
    bone.visible = false;
  });
}

/**
 * Create a bone hierarchy tree
 * @param model - The 3D model
 * @returns Hierarchical bone structure
 */
export function getBoneHierarchy(model: any): any[] {
  const hierarchy: any[] = [];

  function buildTree(obj: any, level: number = 0): any {
    return {
      name: obj.name,
      type: obj.type,
      level,
      children: obj.children
        .filter((child: any) => child.isBone || child.type === 'Bone')
        .map((child: any) => buildTree(child, level + 1)),
    };
  }

  model.traverse((child: any) => {
    if ((child.isBone || child.type === 'Bone') && !child.parent?.isBone) {
      hierarchy.push(buildTree(child));
    }
  });

  return hierarchy;
}
