import * as THREE from 'three';

/**
 * Vertex shader for conflict visualization
 */
export const conflictVisualizationVertexShader = `
  attribute float conflictSeverity;
  
  varying float vConflictSeverity;
  
  void main() {
    vConflictSeverity = conflictSeverity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for conflict visualization with color mapping
 */
export const conflictVisualizationFragmentShader = `
  varying float vConflictSeverity;
  
  vec3 getSeverityColor(float severity) {
    // severity: 0 = no conflict (gray), 0.33 = mild (yellow), 0.66 = moderate (orange), 1.0 = severe (red)
    
    if (severity < 0.33) {
      // Interpolate from gray to yellow
      float t = severity / 0.33;
      return mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 0.0), t);
    } else if (severity < 0.66) {
      // Interpolate from yellow to orange
      float t = (severity - 0.33) / 0.33;
      return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.65, 0.0), t);
    } else {
      // Interpolate from orange to red
      float t = (severity - 0.66) / 0.34;
      return mix(vec3(1.0, 0.65, 0.0), vec3(1.0, 0.0, 0.0), t);
    }
  }
  
  void main() {
    vec3 color = getSeverityColor(vConflictSeverity);
    gl_FragColor = vec4(color, 0.8);
  }
`;

/**
 * Create conflict visualization material
 */
export function createConflictVisualizationMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: conflictVisualizationVertexShader,
    fragmentShader: conflictVisualizationFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    wireframe: false,
  });
}

/**
 * Severity levels for conflict visualization
 */
export enum ConflictSeverity {
  NONE = 0,
  MILD = 0.33,
  MODERATE = 0.66,
  SEVERE = 1.0,
}

/**
 * Get severity level from conflict count
 */
export function getSeverityLevel(conflictCount: number, maxConflicts: number = 100): ConflictSeverity {
  const ratio = Math.min(conflictCount / maxConflicts, 1.0);

  if (ratio === 0) return ConflictSeverity.NONE;
  if (ratio < 0.33) return ConflictSeverity.MILD;
  if (ratio < 0.66) return ConflictSeverity.MODERATE;
  return ConflictSeverity.SEVERE;
}

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: ConflictSeverity): THREE.Color {
  switch (severity) {
    case ConflictSeverity.NONE:
      return new THREE.Color(0x808080); // Gray
    case ConflictSeverity.MILD:
      return new THREE.Color(0xffff00); // Yellow
    case ConflictSeverity.MODERATE:
      return new THREE.Color(0xffa500); // Orange
    case ConflictSeverity.SEVERE:
      return new THREE.Color(0xff0000); // Red
    default:
      return new THREE.Color(0x808080);
  }
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: ConflictSeverity): string {
  switch (severity) {
    case ConflictSeverity.NONE:
      return 'None';
    case ConflictSeverity.MILD:
      return 'Mild';
    case ConflictSeverity.MODERATE:
      return 'Moderate';
    case ConflictSeverity.SEVERE:
      return 'Severe';
    default:
      return 'Unknown';
  }
}

/**
 * Create conflict visualization geometry from conflict data
 */
export function createConflictVisualizationGeometry(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number> // vertex index -> conflict count
): THREE.BufferGeometry {
  const positions = geometry.getAttribute('position');
  const indices = geometry.getIndex();

  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }

  // Create severity array for all vertices
  const severities = new Float32Array(positions.count);

  // Find max conflicts for normalization
  const maxConflicts = Math.max(...Array.from(conflictVertices.values()), 1);

  // Initialize all vertices as no conflict
  for (let i = 0; i < severities.length; i++) {
    severities[i] = ConflictSeverity.NONE;
  }

  // Set severity for conflicting vertices
  conflictVertices.forEach((conflictCount, vertexIndex) => {
    if (vertexIndex < severities.length) {
      const severity = getSeverityLevel(conflictCount, maxConflicts);
      severities[vertexIndex] = severity;
    }
  });

  // Create new geometry with conflict data
  const conflictGeometry = new THREE.BufferGeometry();
  conflictGeometry.setAttribute('position', positions.clone());
  conflictGeometry.setAttribute('conflictSeverity', new THREE.BufferAttribute(severities, 1));

  if (indices) {
    conflictGeometry.setIndex(indices.clone());
  }

  // Copy other attributes
  const attributes = geometry.attributes;
  for (const key in attributes) {
    if (key !== 'position' && key !== 'conflictSeverity') {
      conflictGeometry.setAttribute(key, attributes[key].clone());
    }
  }

  return conflictGeometry;
}

/**
 * Create wireframe overlay for conflict visualization
 */
export function createConflictWireframeGeometry(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number>
): THREE.BufferGeometry {
  const positions = geometry.getAttribute('position');

  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }

  // Create line geometry for conflicting vertices
  const linePositions: number[] = [];

  conflictVertices.forEach((_, vertexIndex) => {
    if (vertexIndex * 3 + 2 < positions.array.length) {
      const x = (positions.array as Float32Array)[vertexIndex * 3];
      const y = (positions.array as Float32Array)[vertexIndex * 3 + 1];
      const z = (positions.array as Float32Array)[vertexIndex * 3 + 2];

      linePositions.push(x, y, z);
    }
  });

  const wireframeGeometry = new THREE.BufferGeometry();
  wireframeGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(linePositions), 3)
  );

  return wireframeGeometry;
}

/**
 * Create point cloud for conflict visualization
 */
export function createConflictPointCloudGeometry(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number>
): THREE.BufferGeometry {
  const positions = geometry.getAttribute('position');

  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }

  const pointPositions: number[] = [];
  const pointSeverities: number[] = [];
  const maxConflicts = Math.max(...Array.from(conflictVertices.values()), 1);

  conflictVertices.forEach((conflictCount, vertexIndex) => {
    if (vertexIndex * 3 + 2 < positions.array.length) {
      const x = (positions.array as Float32Array)[vertexIndex * 3];
      const y = (positions.array as Float32Array)[vertexIndex * 3 + 1];
      const z = (positions.array as Float32Array)[vertexIndex * 3 + 2];

      pointPositions.push(x, y, z);
      pointSeverities.push(getSeverityLevel(conflictCount, maxConflicts));
    }
  });

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(pointPositions), 3)
  );
  pointGeometry.setAttribute(
    'conflictSeverity',
    new THREE.BufferAttribute(new Float32Array(pointSeverities), 1)
  );

  return pointGeometry;
}

/**
 * Create heatmap texture for conflict visualization
 */
export function createConflictHeatmapTexture(width: number = 256, height: number = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Create gradient from gray to red
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#808080'); // Gray - no conflict
  gradient.addColorStop(0.33, '#ffff00'); // Yellow - mild
  gradient.addColorStop(0.66, '#ffa500'); // Orange - moderate
  gradient.addColorStop(1.0, '#ff0000'); // Red - severe

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Visualization mode enum
 */
export enum VisualizationMode {
  SOLID = 'solid',
  WIREFRAME = 'wireframe',
  POINTS = 'points',
  OVERLAY = 'overlay',
}

/**
 * Create visualization mesh for conflicts
 */
export function createConflictVisualizationMesh(
  geometry: THREE.BufferGeometry,
  conflictVertices: Map<number, number>,
  mode: VisualizationMode = VisualizationMode.SOLID
): THREE.Mesh | THREE.Points {
  const material = createConflictVisualizationMaterial();

  switch (mode) {
    case VisualizationMode.SOLID: {
      const conflictGeom = createConflictVisualizationGeometry(geometry, conflictVertices);
      return new THREE.Mesh(conflictGeom, material);
    }

    case VisualizationMode.POINTS: {
      const pointGeom = createConflictPointCloudGeometry(geometry, conflictVertices);
      const pointMaterial = new THREE.PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        vertexColors: true,
      });
      return new THREE.Points(pointGeom, pointMaterial);
    }

    case VisualizationMode.WIREFRAME: {
      const wireGeom = createConflictWireframeGeometry(geometry, conflictVertices);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
      const lineSegments = new THREE.LineSegments(wireGeom, lineMaterial);
      return lineSegments as any;
    }

    case VisualizationMode.OVERLAY:
    default: {
      const conflictGeom = createConflictVisualizationGeometry(geometry, conflictVertices);
      return new THREE.Mesh(conflictGeom, material);
    }
  }
}
