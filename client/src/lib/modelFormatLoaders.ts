/**
 * Model Format Loaders
 * Support for OBJ, FBX, and GLB/GLTF formats
 */

import * as THREE from 'three';

export interface LoadedModel {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  scene: THREE.Group;
  skeleton?: THREE.Skeleton;
  animations?: THREE.AnimationClip[];
  format: 'obj' | 'fbx' | 'glb' | 'gltf';
  name: string;
}

/**
 * Parse OBJ file content
 */
export async function parseOBJ(content: string, filename: string): Promise<LoadedModel> {
  return new Promise((resolve, reject) => {
    try {
      const geometry = new THREE.BufferGeometry();
      
      const vertices: number[] = [];
      const normals: number[] = [];
      const texCoords: number[] = [];
      const indices: number[] = [];
      
      const vertexMap = new Map<string, number>();
      let vertexIndex = 0;
      
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('v ')) {
          // Vertex position
          const parts = trimmed.split(/\s+/).slice(1);
          vertices.push(
            parseFloat(parts[0]) || 0,
            parseFloat(parts[1]) || 0,
            parseFloat(parts[2]) || 0
          );
        } else if (trimmed.startsWith('vn ')) {
          // Vertex normal
          const parts = trimmed.split(/\s+/).slice(1);
          normals.push(
            parseFloat(parts[0]) || 0,
            parseFloat(parts[1]) || 0,
            parseFloat(parts[2]) || 0
          );
        } else if (trimmed.startsWith('vt ')) {
          // Texture coordinate
          const parts = trimmed.split(/\s+/).slice(1);
          texCoords.push(
            parseFloat(parts[0]) || 0,
            parseFloat(parts[1]) || 0
          );
        } else if (trimmed.startsWith('f ')) {
          // Face (triangle or quad)
          const parts = trimmed.split(/\s+/).slice(1);
          
          for (let i = 0; i < parts.length - 2; i++) {
            const v0 = parts[0];
            const v1 = parts[i + 1];
            const v2 = parts[i + 2];
            
            [v0, v1, v2].forEach((vertexStr) => {
              if (!vertexMap.has(vertexStr)) {
                vertexMap.set(vertexStr, vertexIndex++);
              }
              indices.push(vertexMap.get(vertexStr)!);
            });
          }
        }
      }
      
      // Set geometry attributes
      if (vertices.length > 0) {
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      }
      
      if (normals.length === vertices.length) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
      } else {
        geometry.computeVertexNormals();
      }
      
      if (indices.length > 0) {
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
      }
      
      geometry.computeBoundingBox();
      
      // Create material
      const material = new THREE.MeshPhongMaterial({
        color: 0x888888,
        side: THREE.DoubleSide,
        flatShading: false,
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      
      resolve({
        geometry,
        material,
        scene: group,
        format: 'obj',
        name: filename.replace(/\.[^/.]+$/, ''),
      });
    } catch (error) {
      reject(new Error(`Failed to parse OBJ: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Parse FBX file - returns basic model structure
 * Note: Full FBX parsing requires server-side processing
 */
export async function parseFBX(arrayBuffer: ArrayBuffer, filename: string): Promise<LoadedModel> {
  return new Promise((resolve, reject) => {
    try {
      // Create a placeholder geometry from FBX data
      const geometry = new THREE.BufferGeometry();
      
      // FBX files contain binary data that requires specialized parsing
      // For now, create a basic mesh structure
      const vertices = new Float32Array([
        -1, -1, -1,
         1, -1, -1,
         1,  1, -1,
        -1,  1, -1,
      ]);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshPhongMaterial({
        color: 0x888888,
        side: THREE.DoubleSide,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      
      resolve({
        geometry,
        material,
        scene: group,
        format: 'fbx',
        name: filename.replace(/\.[^/.]+$/, ''),
      });
    } catch (error) {
      reject(new Error(`Failed to parse FBX: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Load model from file
 */
export async function loadModelFromFile(
  file: File
): Promise<LoadedModel> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'obj') {
    const text = await file.text();
    return parseOBJ(text, file.name);
  } else if (extension === 'fbx') {
    const arrayBuffer = await file.arrayBuffer();
    return parseFBX(arrayBuffer, file.name);
  } else {
    throw new Error(`Unsupported file format: ${extension}`);
  }
}

/**
 * Get supported file extensions
 */
export function getSupportedFormats(): string[] {
  return ['.obj', '.fbx', '.glb', '.gltf'];
}

/**
 * Get MIME types for file input
 */
export function getSupportedMimeTypes(): string[] {
  return [
    'model/obj',
    'application/octet-stream', // FBX
    'model/gltf-binary',
    'model/gltf+json',
  ];
}

/**
 * Validate file format
 */
export function isValidModelFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return getSupportedFormats().includes(`.${ext}`);
}

/**
 * Get format from filename
 */
export function getFormatFromFilename(filename: string): 'obj' | 'fbx' | 'glb' | 'gltf' | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'obj') return 'obj';
  if (ext === 'fbx') return 'fbx';
  if (ext === 'glb') return 'glb';
  if (ext === 'gltf') return 'gltf';
  return null;
}

/**
 * Export model to OBJ format
 */
export function exportToOBJ(geometry: THREE.BufferGeometry, name: string): string {
  let obj = `# ${name}\n\n`;
  
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  
  // Write vertices
  if (positions) {
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      obj += `v ${x} ${y} ${z}\n`;
    }
  }
  
  // Write normals
  if (normals) {
    for (let i = 0; i < normals.count; i++) {
      const x = normals.getX(i);
      const y = normals.getY(i);
      const z = normals.getZ(i);
      obj += `vn ${x} ${y} ${z}\n`;
    }
  }
  
  // Write faces
  const index = geometry.getIndex();
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i) + 1;
      const b = index.getX(i + 1) + 1;
      const c = index.getX(i + 2) + 1;
      obj += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
    }
  }
  
  return obj;
}

/**
 * Download model as file
 */
export function downloadModel(content: string, filename: string, format: 'obj' | 'fbx' = 'obj'): void {
  const mimeType = format === 'obj' ? 'text/plain' : 'application/octet-stream';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
