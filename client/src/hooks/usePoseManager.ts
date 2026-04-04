/**
 * usePoseManager Hook
 * Manages pose operations and state
 */

import { useState, useCallback, useEffect } from 'react';
import * as poseStorage from '@/lib/poseStorage';
import type { CharacterPose, BoneTransform } from '@/lib/poseStorage';

export interface UsePoseManagerReturn {
  // State
  poses: CharacterPose[];
  currentPose: CharacterPose | null;
  isLoading: boolean;
  error: string | null;

  // Pose operations
  savePose: (name: string, description: string, bones: BoneTransform[], modelName: string, tags: string[]) => Promise<CharacterPose>;
  loadPose: (id: string) => Promise<CharacterPose | null>;
  updatePose: (id: string, updates: Partial<CharacterPose>) => Promise<CharacterPose | null>;
  deletePose: (id: string) => Promise<boolean>;
  setCurrentPose: (pose: CharacterPose | null) => void;

  // Search and filter
  searchPoses: (query: string) => CharacterPose[];
  getPosesByModel: (modelName: string) => CharacterPose[];
  getPosesByTag: (tag: string) => CharacterPose[];
  getAllTags: () => string[];

  // Import/Export
  exportPoses: (poseIds?: string[]) => string;
  importPoses: (jsonData: string) => Promise<{ success: number; failed: number; errors: string[] }>;
  exportAsFile: (poseIds?: string[]) => void;
  importFromFile: (file: File) => Promise<{ success: number; failed: number; errors: string[] }>;

  // Utilities
  createThumbnail: (canvas: HTMLCanvasElement) => string;
  getStorageStats: () => ReturnType<typeof poseStorage.getStorageStats>;
  clearAllPoses: () => Promise<void>;
}

export function usePoseManager(): UsePoseManagerReturn {
  const [poses, setPoses] = useState<CharacterPose[]>([]);
  const [currentPose, setCurrentPose] = useState<CharacterPose | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load poses on mount
  useEffect(() => {
    try {
      const loadedPoses = poseStorage.getAllPoses();
      setPoses(loadedPoses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poses');
    }
  }, []);

  // Save a new pose
  const savePose = useCallback(
    async (
      name: string,
      description: string,
      bones: BoneTransform[],
      modelName: string,
      tags: string[] = []
    ): Promise<CharacterPose> => {
      setIsLoading(true);
      setError(null);

      try {
        const newPose = poseStorage.savePose({
          name,
          description,
          modelName,
          bones,
          tags,
        });

        setPoses((prev) => [...prev, newPose]);
        return newPose;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to save pose';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load a pose
  const loadPose = useCallback(async (id: string): Promise<CharacterPose | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const pose = poseStorage.getPoseById(id);
      if (pose) {
        setCurrentPose(pose);
      }
      return pose;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load pose';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a pose
  const updatePose = useCallback(
    async (id: string, updates: Partial<CharacterPose>): Promise<CharacterPose | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = poseStorage.updatePose(id, updates);
        if (updated) {
          setPoses((prev) =>
            prev.map((pose) => (pose.id === id ? updated : pose))
          );
          if (currentPose?.id === id) {
            setCurrentPose(updated);
          }
        }
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update pose';
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [currentPose]
  );

  // Delete a pose
  const deletePose = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = poseStorage.deletePose(id);
      if (success) {
        setPoses((prev) => prev.filter((pose) => pose.id !== id));
        if (currentPose?.id === id) {
          setCurrentPose(null);
        }
      }
      return success;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete pose';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPose]);

  // Search poses
  const searchPoses = useCallback((query: string): CharacterPose[] => {
    return poseStorage.searchPoses(query);
  }, []);

  // Get poses by model
  const getPosesByModel = useCallback((modelName: string): CharacterPose[] => {
    return poseStorage.getPosesByModel(modelName);
  }, []);

  // Get poses by tag
  const getPosesByTag = useCallback((tag: string): CharacterPose[] => {
    return poseStorage.getPosesByTag(tag);
  }, []);

  // Get all tags
  const getAllTags = useCallback((): string[] => {
    return poseStorage.getAllTags();
  }, []);

  // Export poses
  const exportPoses = useCallback((poseIds?: string[]): string => {
    return poseStorage.exportPoses(poseIds);
  }, []);

  // Import poses
  const importPoses = useCallback(
    async (jsonData: string): Promise<{ success: number; failed: number; errors: string[] }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = poseStorage.importPoses(jsonData);
        if (result.success > 0) {
          const updated = poseStorage.getAllPoses();
          setPoses(updated);
        }
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to import poses';
        setError(errorMsg);
        return { success: 0, failed: 0, errors: [errorMsg] };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Export as file
  const exportAsFile = useCallback((poseIds?: string[]): void => {
    try {
      const jsonData = poseStorage.exportPoses(poseIds);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poses_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export file';
      setError(errorMsg);
    }
  }, []);

  // Import from file
  const importFromFile = useCallback(
    async (file: File): Promise<{ success: number; failed: number; errors: string[] }> => {
      setIsLoading(true);
      setError(null);

      try {
        const text = await file.text();
        return await importPoses(text);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to read file';
        setError(errorMsg);
        return { success: 0, failed: 0, errors: [errorMsg] };
      } finally {
        setIsLoading(false);
      }
    },
    [importPoses]
  );

  // Create thumbnail
  const createThumbnail = useCallback((canvas: HTMLCanvasElement): string => {
    return poseStorage.createThumbnail(canvas);
  }, []);

  // Get storage stats
  const getStorageStats = useCallback(() => {
    return poseStorage.getStorageStats();
  }, []);

  // Clear all poses
  const clearAllPoses = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      poseStorage.clearAllPoses();
      setPoses([]);
      setCurrentPose(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear poses';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    poses,
    currentPose,
    isLoading,
    error,
    savePose,
    loadPose,
    updatePose,
    deletePose,
    setCurrentPose,
    searchPoses,
    getPosesByModel,
    getPosesByTag,
    getAllTags,
    exportPoses,
    importPoses,
    exportAsFile,
    importFromFile,
    createThumbnail,
    getStorageStats,
    clearAllPoses,
  };
}
