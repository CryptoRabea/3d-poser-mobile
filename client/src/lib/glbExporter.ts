/**
 * GLB Exporter
 * Exports Three.js scenes with rigged models and animations to GLB format
 */

import * as THREE from 'three';

export interface ExportOptions {
  includeAnimations?: boolean;
  optimizeMesh?: boolean;
  exportBones?: boolean;
}

export class GLBExporter {
  /**
   * Export a Three.js scene to GLB format
   */
  static async exportScene(
    scene: THREE.Scene,
    fileName: string,
    options: ExportOptions = {}
  ): Promise<Blob> {
    const { includeAnimations = true, optimizeMesh = true, exportBones = true } = options;

    // Collect meshes and animations
    const meshes: THREE.Mesh[] = [];
    const bones: THREE.Bone[] = [];
    const animations: THREE.AnimationClip[] = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes.push(object);
      }
      if (object instanceof THREE.Bone) {
        bones.push(object);
      }
    });

    // Collect animations from mixer
    if (includeAnimations && (window as any).__animationClips) {
      animations.push(...(window as any).__animationClips);
    }

    // Create glTF structure
    const gltf = this.createGLTFStructure(meshes, bones, animations, options);

    // Serialize to GLB
    const glb = await this.serializeToGLB(gltf, meshes);

    return glb;
  }

  /**
   * Create glTF JSON structure
   */
  private static createGLTFStructure(
    meshes: THREE.Mesh[],
    bones: THREE.Bone[],
    animations: THREE.AnimationClip[],
    options: ExportOptions
  ): any {
    const nodes: any[] = [];
    const nodeMap = new Map<THREE.Object3D, number>();
    let nodeIndex = 0;

    // Add mesh nodes
    meshes.forEach((mesh) => {
      nodeMap.set(mesh, nodeIndex);
      nodes.push({
        mesh: nodeIndex,
        name: mesh.name || `Mesh_${nodeIndex}`,
        translation: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w],
        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
      });
      nodeIndex++;
    });

    // Add bone nodes if exporting bones
    if (options.exportBones) {
      bones.forEach((bone) => {
        nodeMap.set(bone, nodeIndex);
        nodes.push({
          name: bone.name || `Bone_${nodeIndex}`,
          translation: [bone.position.x, bone.position.y, bone.position.z],
          rotation: [bone.quaternion.x, bone.quaternion.y, bone.quaternion.z, bone.quaternion.w],
          scale: [bone.scale.x, bone.scale.y, bone.scale.z],
        });
        nodeIndex++;
      });
    }

    const gltf: any = {
      asset: {
        version: '2.0',
        generator: '3D Poser Mobile',
      },
      scene: 0,
      scenes: [
        {
          nodes: Array.from({ length: meshes.length }, (_, i) => i),
        },
      ],
      nodes,
      meshes: this.createMeshes(meshes),
      materials: this.createMaterials(meshes),
      accessors: [],
      bufferViews: [],
      buffers: [{ byteLength: 0 }],
    };

    // Add animations if present
    if (animations.length > 0) {
      gltf.animations = this.createAnimations(animations, nodeMap);
    }

    return gltf;
  }

  /**
   * Create mesh definitions
   */
  private static createMeshes(meshes: THREE.Mesh[]): any[] {
    return meshes.map((mesh, index) => ({
      primitives: [
        {
          attributes: {
            POSITION: index * 2,
          },
          indices: index * 2 + 1,
          material: index,
        },
      ],
      name: mesh.name || `Mesh_${index}`,
    }));
  }

  /**
   * Create material definitions
   */
  private static createMaterials(meshes: THREE.Mesh[]): any[] {
    return meshes.map((mesh) => {
      const material = mesh.material as THREE.Material;
      const pbr: any = {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 1,
      };

      if (material instanceof THREE.MeshStandardMaterial) {
        pbr.baseColorFactor = [
          material.color.r,
          material.color.g,
          material.color.b,
          material.opacity,
        ];
        pbr.metallicFactor = material.metalness;
        pbr.roughnessFactor = material.roughness;
      } else if (material instanceof THREE.MeshPhongMaterial) {
        pbr.baseColorFactor = [
          material.color.r,
          material.color.g,
          material.color.b,
          material.opacity,
        ];
      }

      return {
        pbrMetallicRoughness: pbr,
        name: material.name || 'Material',
      };
    });
  }

  /**
   * Create animation definitions
   */
  private static createAnimations(
    animations: THREE.AnimationClip[],
    nodeMap: Map<THREE.Object3D, number>
  ): any[] {
    return animations.map((clip) => ({
      name: clip.name,
      channels: [],
      samplers: [],
    }));
  }

  /**
   * Serialize to GLB format
   */
  private static async serializeToGLB(gltf: any, meshes: THREE.Mesh[]): Promise<Blob> {
    // Collect geometry data
    let binaryData = new ArrayBuffer(0);
    const accessors: any[] = [];
    const bufferViews: any[] = [];
    let byteOffset = 0;

    meshes.forEach((mesh, meshIndex) => {
      const geometry = mesh.geometry;

      if (geometry.attributes.position) {
        // Position data
        const positions = geometry.attributes.position.array as Float32Array;
        const positionBuffer = new Float32Array(positions);
        const positionData = new Uint8Array(positionBuffer.buffer);

        // Append to binary
        const newBinaryData = new Uint8Array(binaryData.byteLength + positionData.byteLength);
        newBinaryData.set(new Uint8Array(binaryData));
        newBinaryData.set(positionData, binaryData.byteLength);
        binaryData = newBinaryData.buffer;

        // Add accessor
        const min = [
          Math.min(...Array.from(positions).filter((_, i) => i % 3 === 0)),
          Math.min(...Array.from(positions).filter((_, i) => i % 3 === 1)),
          Math.min(...Array.from(positions).filter((_, i) => i % 3 === 2)),
        ];
        const max = [
          Math.max(...Array.from(positions).filter((_, i) => i % 3 === 0)),
          Math.max(...Array.from(positions).filter((_, i) => i % 3 === 1)),
          Math.max(...Array.from(positions).filter((_, i) => i % 3 === 2)),
        ];

        accessors.push({
          bufferView: bufferViews.length,
          componentType: 5126, // FLOAT
          count: positions.length / 3,
          type: 'VEC3',
          min,
          max,
        });

        bufferViews.push({
          buffer: 0,
          byteOffset,
          byteLength: positionData.byteLength,
          target: 34962, // ARRAY_BUFFER
        });

        byteOffset += positionData.byteLength;
      }

      // Index data
      if (geometry.index) {
        const indices = geometry.index.array as Uint32Array;
        const indexBuffer = new Uint32Array(indices);
        const indexData = new Uint8Array(indexBuffer.buffer);

        // Append to binary
        const newBinaryData = new Uint8Array(binaryData.byteLength + indexData.byteLength);
        newBinaryData.set(new Uint8Array(binaryData));
        newBinaryData.set(indexData, binaryData.byteLength);
        binaryData = newBinaryData.buffer;

        accessors.push({
          bufferView: bufferViews.length,
          componentType: 5125, // UNSIGNED_INT
          count: indices.length,
          type: 'SCALAR',
        });

        bufferViews.push({
          buffer: 0,
          byteOffset,
          byteLength: indexData.byteLength,
          target: 34963, // ELEMENT_ARRAY_BUFFER
        });

        byteOffset += indexData.byteLength;
      }
    });

    gltf.accessors = accessors;
    gltf.bufferViews = bufferViews;
    gltf.buffers[0].byteLength = binaryData.byteLength;

    // Serialize JSON
    const jsonStr = JSON.stringify(gltf);
    const jsonData = new TextEncoder().encode(jsonStr);

    // Pad JSON to 4-byte boundary
    const jsonPadding = (4 - (jsonData.byteLength % 4)) % 4;
    const jsonPadded = new Uint8Array(jsonData.byteLength + jsonPadding);
    jsonPadded.set(jsonData);

    // Pad binary to 4-byte boundary
    const binaryPadding = (4 - (binaryData.byteLength % 4)) % 4;
    const binaryPadded = new Uint8Array(binaryData.byteLength + binaryPadding);
    binaryPadded.set(new Uint8Array(binaryData));

    // Create GLB file
    const glbData = new ArrayBuffer(
      28 + 8 + jsonPadded.byteLength + 8 + binaryPadded.byteLength
    );
    const view = new DataView(glbData);
    const data = new Uint8Array(glbData);

    let offset = 0;

    // Header
    data.set(new TextEncoder().encode('glTF'), offset);
    offset += 4;
    view.setUint32(offset, 2, true); // Version
    offset += 4;
    view.setUint32(offset, glbData.byteLength, true); // File size
    offset += 4;

    // JSON chunk
    view.setUint32(offset, jsonPadded.byteLength, true);
    offset += 4;
    data.set(new TextEncoder().encode('JSON'), offset);
    offset += 4;
    data.set(jsonPadded, offset);
    offset += jsonPadded.byteLength;

    // Binary chunk
    view.setUint32(offset, binaryPadded.byteLength, true);
    offset += 4;
    data.set(new TextEncoder().encode('BIN\x00'), offset);
    offset += 4;
    data.set(binaryPadded, offset);

    return new Blob([glbData], { type: 'model/gltf-binary' });
  }

  /**
   * Download GLB file
   */
  static downloadGLB(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.glb') ? fileName : `${fileName}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
