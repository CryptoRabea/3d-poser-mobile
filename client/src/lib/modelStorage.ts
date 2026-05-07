/**
 * Model Storage Utilities
 * Manages saving, loading, and organizing multiple 3D models with metadata
 */

export interface StoredModel {
  id: string;
  name: string;
  fileName: string;
  format: 'glb' | 'fbx' | 'gltf';
  data: ArrayBuffer;
  thumbnail?: string; // Base64 encoded image
  fileSize: number;
  boneCount?: number;
  meshCount?: number;
  animationCount?: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  description?: string;
}

export interface ModelLibraryStats {
  totalModels: number;
  totalSize: number;
  oldestModel?: number;
  newestModel?: number;
}

const STORAGE_KEY = 'crg_model_library';
const MAX_MODELS = 20;
const MAX_STORAGE_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Generate unique ID for model
 */
function generateModelId(): string {
  return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all stored models from localStorage
 */
export function getAllModels(): StoredModel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const models = JSON.parse(data) as StoredModel[];
    return models.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to retrieve models:', error);
    return [];
  }
}

/**
 * Get a specific model by ID
 */
export function getModelById(id: string): StoredModel | null {
  const models = getAllModels();
  return models.find((m) => m.id === id) || null;
}

/**
 * Save a new model to storage
 */
export function saveModel(
  fileName: string,
  data: ArrayBuffer,
  format: 'glb' | 'fbx' | 'gltf',
  metadata?: {
    boneCount?: number;
    meshCount?: number;
    animationCount?: number;
    tags?: string[];
    description?: string;
  }
): { success: boolean; id?: string; error?: string } {
  try {
    // Check storage limits
    const currentSize = getCurrentStorageSize();
    if (currentSize + data.byteLength > MAX_STORAGE_SIZE) {
      return {
        success: false,
        error: `Storage limit exceeded. Current: ${(currentSize / 1024 / 1024).toFixed(2)}MB, Needed: ${(data.byteLength / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    const models = getAllModels();
    if (models.length >= MAX_MODELS) {
      return {
        success: false,
        error: `Maximum number of models (${MAX_MODELS}) reached. Delete some models first.`,
      };
    }

    // Create new model entry
    const id = generateModelId();
    const now = Date.now();
    const modelName = fileName.replace(/\.[^/.]+$/, '');

    const newModel: StoredModel = {
      id,
      name: modelName,
      fileName,
      format,
      data,
      fileSize: data.byteLength,
      boneCount: metadata?.boneCount,
      meshCount: metadata?.meshCount,
      animationCount: metadata?.animationCount,
      tags: metadata?.tags || [],
      description: metadata?.description,
      createdAt: now,
      updatedAt: now,
    };

    // Save to localStorage
    models.push(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));

    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update model metadata (name, tags, description, thumbnail)
 */
export function updateModelMetadata(
  id: string,
  updates: Partial<Pick<StoredModel, 'name' | 'tags' | 'description' | 'thumbnail' | 'boneCount' | 'meshCount' | 'animationCount'>>
): { success: boolean; error?: string } {
  try {
    const models = getAllModels();
    const modelIndex = models.findIndex((m) => m.id === id);

    if (modelIndex === -1) {
      return { success: false, error: 'Model not found' };
    }

    models[modelIndex] = {
      ...models[modelIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Delete a model from storage
 */
export function deleteModel(id: string): { success: boolean; error?: string } {
  try {
    const models = getAllModels();
    const filteredModels = models.filter((m) => m.id !== id);

    if (filteredModels.length === models.length) {
      return { success: false, error: 'Model not found' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredModels));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Search models by name, tags, or description
 */
export function searchModels(query: string): StoredModel[] {
  const models = getAllModels();
  const lowerQuery = query.toLowerCase();

  return models.filter(
    (model) =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.fileName.toLowerCase().includes(lowerQuery) ||
      model.description?.toLowerCase().includes(lowerQuery) ||
      model.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter models by tags
 */
export function filterModelsByTags(tags: string[]): StoredModel[] {
  if (tags.length === 0) return getAllModels();

  const models = getAllModels();
  return models.filter((model) =>
    tags.some((tag) => model.tags.includes(tag))
  );
}

/**
 * Get all unique tags from all models
 */
export function getAllTags(): string[] {
  const models = getAllModels();
  const tagSet = new Set<string>();

  models.forEach((model) => {
    model.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get storage statistics
 */
export function getStorageStats(): ModelLibraryStats {
  const models = getAllModels();

  return {
    totalModels: models.length,
    totalSize: models.reduce((sum, m) => sum + m.fileSize, 0),
    oldestModel: models.length > 0 ? models[models.length - 1].createdAt : undefined,
    newestModel: models.length > 0 ? models[0].createdAt : undefined,
  };
}

/**
 * Get current storage size in bytes
 */
export function getCurrentStorageSize(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;
    // Rough estimate: JSON string size
    return new Blob([data]).size;
  } catch {
    return 0;
  }
}

/**
 * Clear all models from storage
 */
export function clearAllModels(): { success: boolean; error?: string } {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Export model as JSON for sharing
 */
export function exportModelAsJSON(id: string): { success: boolean; data?: string; error?: string } {
  try {
    const model = getModelById(id);
    if (!model) {
      return { success: false, error: 'Model not found' };
    }

    // Create export object (without large binary data)
    const exportData = {
      name: model.name,
      fileName: model.fileName,
      format: model.format,
      fileSize: model.fileSize,
      boneCount: model.boneCount,
      meshCount: model.meshCount,
      animationCount: model.animationCount,
      tags: model.tags,
      description: model.description,
      createdAt: model.createdAt,
      metadata: {
        exportedAt: Date.now(),
        exportedFrom: 'C.R.G 3D Poser',
      },
    };

    return { success: true, data: JSON.stringify(exportData, null, 2) };
  } catch (error) {
    return {
      success: false,
      error: `Failed to export model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Import models from backup
 */
export function importModelsFromBackup(jsonData: string): { success: boolean; count?: number; error?: string } {
  try {
    const backupModels = JSON.parse(jsonData) as StoredModel[];

    if (!Array.isArray(backupModels)) {
      return { success: false, error: 'Invalid backup format' };
    }

    const currentModels = getAllModels();
    const newModels = backupModels.filter(
      (bm) => !currentModels.some((cm) => cm.id === bm.id)
    );

    if (currentModels.length + newModels.length > MAX_MODELS) {
      return {
        success: false,
        error: `Cannot import ${newModels.length} models. Would exceed maximum of ${MAX_MODELS}.`,
      };
    }

    const allModels = [...currentModels, ...newModels];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allModels));

    return { success: true, count: newModels.length };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get recommended storage cleanup actions
 */
export function getStorageCleanupSuggestions(): string[] {
  const stats = getStorageStats();
  const suggestions: string[] = [];

  if (stats.totalModels > 15) {
    suggestions.push(`You have ${stats.totalModels} models. Consider deleting unused ones.`);
  }

  const totalSizeMB = stats.totalSize / 1024 / 1024;
  if (totalSizeMB > 400) {
    suggestions.push(`Storage usage is high (${totalSizeMB.toFixed(0)}MB). Delete large models to free space.`);
  }

  return suggestions;
}

/**
 * Format file size for display
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
