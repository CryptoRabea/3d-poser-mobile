import { useState, useCallback, useEffect } from 'react';
import {
  getAllModels,
  getModelById,
  saveModel,
  deleteModel,
  updateModelMetadata,
  searchModels,
  filterModelsByTags,
  getAllTags,
  getStorageStats,
  formatStorageSize,
  type StoredModel,
} from '@/lib/modelStorage';

export interface UseModelLibraryReturn {
  models: StoredModel[];
  tags: string[];
  selectedModel: StoredModel | null;
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  stats: ReturnType<typeof getStorageStats>;

  // Actions
  loadModels: () => void;
  selectModel: (id: string) => void;
  addModel: (
    fileName: string,
    data: ArrayBuffer,
    format: 'glb' | 'fbx' | 'gltf',
    metadata?: any
  ) => { success: boolean; id?: string; error?: string };
  removeModel: (id: string) => { success: boolean; error?: string };
  updateModel: (id: string, updates: any) => { success: boolean; error?: string };
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getFilteredModels: () => StoredModel[];
}

/**
 * Custom hook for managing model library operations
 */
export function useModelLibrary(): UseModelLibraryReturn {
  const [models, setModels] = useState<StoredModel[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<StoredModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stats, setStats] = useState(getStorageStats());

  // Load all models on mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = useCallback(() => {
    setIsLoading(true);
    try {
      const allModels = getAllModels();
      setModels(allModels);
      setTags(getAllTags());
      setStats(getStorageStats());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectModel = useCallback((id: string) => {
    const model = getModelById(id);
    setSelectedModel(model);
  }, []);

  const addModel = useCallback(
    (
      fileName: string,
      data: ArrayBuffer,
      format: 'glb' | 'fbx' | 'gltf',
      metadata?: any
    ) => {
      const result = saveModel(fileName, data, format, metadata);
      if (result.success) {
        loadModels();
      }
      return result;
    },
    [loadModels]
  );

  const removeModel = useCallback(
    (id: string) => {
      const result = deleteModel(id);
      if (result.success) {
        if (selectedModel?.id === id) {
          setSelectedModel(null);
        }
        loadModels();
      }
      return result;
    },
    [selectedModel, loadModels]
  );

  const updateModel = useCallback(
    (id: string, updates: any) => {
      const result = updateModelMetadata(id, updates);
      if (result.success) {
        loadModels();
        if (selectedModel?.id === id) {
          const updated = getModelById(id);
          setSelectedModel(updated);
        }
      }
      return result;
    },
    [selectedModel, loadModels]
  );

  const getFilteredModels = useCallback((): StoredModel[] => {
    let filtered = models;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = searchModels(searchQuery);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter((model) =>
        selectedTags.some((tag) => model.tags.includes(tag))
      );
    }

    return filtered;
  }, [models, searchQuery, selectedTags]);

  return {
    models,
    tags,
    selectedModel,
    isLoading,
    searchQuery,
    selectedTags,
    stats,
    loadModels,
    selectModel,
    addModel,
    removeModel,
    updateModel,
    setSearchQuery,
    setSelectedTags,
    getFilteredModels,
  };
}
