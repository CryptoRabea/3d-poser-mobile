import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getAllPresetPoses } from '@/lib/presetPoses';
import type { BoneTransform } from '@/lib/poseStorage';

interface PresetPoseToolbarProps {
  onApplyPose: (pose: BoneTransform[]) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Preset Pose Toolbar Component
 * Compact toolbar with quick-access preset pose buttons
 */
export default function PresetPoseToolbar({
  onApplyPose,
  isLoading = false,
  className = '',
}: PresetPoseToolbarProps) {
  const [applyingPoseId, setApplyingPoseId] = useState<string | null>(null);
  const presetPoses = getAllPresetPoses();

  const handleApplyPose = async (poseId: string) => {
    try {
      setApplyingPoseId(poseId);
      const pose = presetPoses.find((p) => p.id === poseId);
      if (pose) {
        onApplyPose(pose.transforms);
      }
    } catch (error) {
      console.error('Failed to apply preset pose:', error);
    } finally {
      setApplyingPoseId(null);
    }
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {presetPoses.map((pose) => (
        <button
          key={pose.id}
          onClick={() => handleApplyPose(pose.id)}
          disabled={isLoading || applyingPoseId !== null}
          title={pose.description}
          className="relative group bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="text-lg">{pose.icon}</span>
          <span className="hidden sm:inline text-xs font-medium">{pose.name}</span>
          {applyingPoseId === pose.id && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {pose.description}
          </div>
        </button>
      ))}
    </div>
  );
}
