/**
 * Pose Storage Utility
 * Handles saving, loading, and managing character poses in local storage
 */

export interface BoneTransform {
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface CharacterPose {
  id: string;
  name: string;
  description: string;
  modelName: string;
  bones: BoneTransform[];
  thumbnail?: string; // Base64 encoded image
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface PoseLibrary {
  poses: CharacterPose[];
  version: number;
}

const STORAGE_KEY = '3d-poser-poses';
const CURRENT_VERSION = 1;

/**
 * Get all saved poses from local storage
 */
export function getAllPoses(): CharacterPose[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const library: PoseLibrary = JSON.parse(data);
    return library.poses || [];
  } catch (error) {
    console.error('Failed to load poses:', error);
    return [];
  }
}

/**
 * Get a specific pose by ID
 */
export function getPoseById(id: string): CharacterPose | null {
  const poses = getAllPoses();
  return poses.find((pose) => pose.id === id) || null;
}

/**
 * Save a new pose
 */
export function savePose(pose: Omit<CharacterPose, 'id' | 'createdAt' | 'updatedAt'>): CharacterPose {
  const poses = getAllPoses();

  const newPose: CharacterPose = {
    ...pose,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  poses.push(newPose);
  savePosesToStorage(poses);

  return newPose;
}

/**
 * Update an existing pose
 */
export function updatePose(id: string, updates: Partial<CharacterPose>): CharacterPose | null {
  const poses = getAllPoses();
  const index = poses.findIndex((pose) => pose.id === id);

  if (index === -1) return null;

  const updatedPose: CharacterPose = {
    ...poses[index],
    ...updates,
    id: poses[index].id, // Prevent ID changes
    createdAt: poses[index].createdAt, // Prevent creation date changes
    updatedAt: Date.now(),
  };

  poses[index] = updatedPose;
  savePosesToStorage(poses);

  return updatedPose;
}

/**
 * Delete a pose
 */
export function deletePose(id: string): boolean {
  const poses = getAllPoses();
  const filteredPoses = poses.filter((pose) => pose.id !== id);

  if (filteredPoses.length === poses.length) return false; // Pose not found

  savePosesToStorage(filteredPoses);
  return true;
}

/**
 * Search poses by name or tags
 */
export function searchPoses(query: string): CharacterPose[] {
  const poses = getAllPoses();
  const lowerQuery = query.toLowerCase();

  return poses.filter(
    (pose) =>
      pose.name.toLowerCase().includes(lowerQuery) ||
      pose.description.toLowerCase().includes(lowerQuery) ||
      pose.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get poses by model name
 */
export function getPosesByModel(modelName: string): CharacterPose[] {
  const poses = getAllPoses();
  return poses.filter((pose) => pose.modelName === modelName);
}

/**
 * Get poses by tag
 */
export function getPosesByTag(tag: string): CharacterPose[] {
  const poses = getAllPoses();
  return poses.filter((pose) => pose.tags.includes(tag));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const poses = getAllPoses();
  const tags = new Set<string>();

  poses.forEach((pose) => {
    pose.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Export poses as JSON
 */
export function exportPoses(poseIds?: string[]): string {
  const poses = getAllPoses();
  const toExport = poseIds
    ? poses.filter((pose) => poseIds.includes(pose.id))
    : poses;

  return JSON.stringify(toExport, null, 2);
}

/**
 * Import poses from JSON
 */
export function importPoses(jsonData: string): { success: number; failed: number; errors: string[] } {
  try {
    const importedPoses = JSON.parse(jsonData) as CharacterPose[];

    if (!Array.isArray(importedPoses)) {
      return { success: 0, failed: 0, errors: ['Invalid JSON format'] };
    }

    const poses = getAllPoses();
    const errors: string[] = [];
    let successCount = 0;

    importedPoses.forEach((pose, index) => {
      try {
        // Validate pose structure
        if (!pose.name || !pose.bones || !Array.isArray(pose.bones)) {
          errors.push(`Pose ${index}: Missing required fields`);
          return;
        }

        // Generate new ID to avoid conflicts
        const newPose: CharacterPose = {
          ...pose,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        poses.push(newPose);
        successCount++;
      } catch (error) {
        errors.push(`Pose ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    if (successCount > 0) {
      savePosesToStorage(poses);
    }

    return {
      success: successCount,
      failed: importedPoses.length - successCount,
      errors,
    };
  } catch (error) {
    return {
      success: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Failed to parse JSON'],
    };
  }
}

/**
 * Clear all poses
 */
export function clearAllPoses(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const poses = getAllPoses();
  const jsonString = JSON.stringify(poses);
  const sizeInBytes = new Blob([jsonString]).size;
  const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);

  return {
    totalPoses: poses.length,
    totalSize: `${sizeInMB} MB`,
    sizeInBytes,
    averagePoseSize: poses.length > 0 ? (sizeInBytes / poses.length).toFixed(0) : 0,
  };
}

/**
 * Export a pose as GLB (requires Three.js scene)
 * This is a placeholder - actual implementation requires Three.js context
 */
export function exportPoseAsGLB(pose: CharacterPose): Blob {
  // This would require Three.js GLTFExporter
  // For now, return JSON as fallback
  const json = JSON.stringify(pose);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Create a thumbnail from canvas
 */
export function createThumbnail(canvas: HTMLCanvasElement, width = 128, height = 128): string {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return '';

  // Draw canvas content scaled to thumbnail size
  ctx.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    width,
    height
  );

  return tempCanvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Private helper functions
 */

function savePosesToStorage(poses: CharacterPose[]): void {
  const library: PoseLibrary = {
    poses,
    version: CURRENT_VERSION,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (error) {
    console.error('Failed to save poses to storage:', error);

    // Handle quota exceeded
    if (error instanceof DOMException && error.code === 22) {
      console.warn('Storage quota exceeded. Clearing old poses...');
      // Remove oldest poses
      const sortedPoses = poses.sort((a, b) => a.createdAt - b.createdAt);
      const trimmedPoses = sortedPoses.slice(Math.floor(sortedPoses.length / 2));
      savePosesToStorage(trimmedPoses);
    }
  }
}

function generateId(): string {
  return `pose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Migrate storage from old format if needed
 */
export function migrateStorage(): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);

    // If it's already in the new format, do nothing
    if (parsed.version === CURRENT_VERSION) return;

    // Handle migration from old format
    if (Array.isArray(parsed)) {
      // Old format was just an array of poses
      const library: PoseLibrary = {
        poses: parsed,
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration on module load
migrateStorage();
