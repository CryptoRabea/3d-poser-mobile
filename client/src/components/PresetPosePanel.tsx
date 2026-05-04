import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight } from 'lucide-react';
import { getAllPresetPoses, type PresetPose } from '@/lib/presetPoses';
import type { BoneTransform } from '@/lib/poseStorage';

interface PresetPosePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPose: (pose: BoneTransform[]) => void;
  isLoading?: boolean;
}

/**
 * Preset Pose Panel Component
 * Displays preset poses with thumbnails and quick-apply buttons
 */
export default function PresetPosePanel({
  isOpen,
  onClose,
  onApplyPose,
  isLoading = false,
}: PresetPosePanelProps) {
  const [presetPoses] = useState<PresetPose[]>(getAllPresetPoses());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'idle' | 'action' | 'emotion'>('all');
  const [applyingPoseId, setApplyingPoseId] = useState<string | null>(null);

  const filteredPoses = selectedCategory === 'all' 
    ? presetPoses 
    : presetPoses.filter((pose) => pose.category === selectedCategory);

  const handleApplyPose = async (pose: PresetPose) => {
    try {
      setApplyingPoseId(pose.id);
      onApplyPose(pose.transforms);
      // Keep the panel open so users can try other poses
    } catch (error) {
      console.error('Failed to apply preset pose:', error);
    } finally {
      setApplyingPoseId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border border-gray-700 max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">🎭 Preset Poses</DialogTitle>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(['all', 'idle', 'action', 'emotion'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Poses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredPoses.map((pose) => (
            <div
              key={pose.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-red-600 transition-colors"
            >
              {/* Pose Icon & Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-3xl mb-2">{pose.icon}</div>
                  <h3 className="font-semibold text-white">{pose.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{pose.description}</p>
                </div>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {pose.category}
                </span>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApplyPose(pose)}
                disabled={isLoading || applyingPoseId !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {applyingPoseId === pose.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    Apply Pose
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredPoses.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No poses found in this category</p>
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-gray-800/50 rounded mt-4">
          💡 <strong>Tip:</strong> Click "Apply Pose" to instantly apply a preset pose to your model.
          Try different poses to find the perfect starting point for your animation!
        </div>
      </DialogContent>
    </Dialog>
  );
}
