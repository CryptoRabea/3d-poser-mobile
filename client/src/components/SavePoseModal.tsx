import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BoneTransform } from '@/lib/poseStorage';

interface SavePoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, bones: BoneTransform[], tags: string[]) => Promise<void>;
  modelName: string;
  bones: BoneTransform[];
  isLoading?: boolean;
}

export default function SavePoseModal({
  isOpen,
  onClose,
  onSave,
  modelName,
  bones,
  isLoading = false,
}: SavePoseModalProps) {
  const [poseName, setPoseName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');

    if (!poseName.trim()) {
      setError('Pose name is required');
      return;
    }

    if (bones.length === 0) {
      setError('No bones to save');
      return;
    }

    setIsSaving(true);

    try {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSave(poseName, description, bones, tagArray);

      // Reset form
      setPoseName('');
      setDescription('');
      setTags('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pose');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">💾 Save Pose</h2>

        <div className="space-y-4">
          {/* Pose Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pose Name *
            </label>
            <input
              type="text"
              value={poseName}
              onChange={(e) => setPoseName(e.target.value)}
              placeholder="e.g., Standing Idle, Action Pose"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this pose..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., action, combat, idle"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Model Info */}
          <div className="bg-gray-700/50 rounded p-3 text-sm text-gray-300">
            <p>
              <span className="font-semibold">Model:</span> {modelName}
            </p>
            <p>
              <span className="font-semibold">Bones:</span> {bones.length}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 rounded p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSaving || isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading || !poseName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>💾 Save Pose</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
