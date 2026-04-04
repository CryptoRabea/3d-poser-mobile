import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { CharacterPose } from '@/lib/poseStorage';

interface PoseLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  poses: CharacterPose[];
  onLoadPose: (pose: CharacterPose) => void;
  onDeletePose: (id: string) => Promise<void>;
  onExportPose: (id: string) => void;
  isLoading?: boolean;
}

type SortBy = 'name' | 'date' | 'model';
type FilterBy = 'all' | 'model' | 'tag';

export default function PoseLibrary({
  isOpen,
  onClose,
  poses,
  onLoadPose,
  onDeletePose,
  onExportPose,
  isLoading = false,
}: PoseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [expandedPoseId, setExpandedPoseId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get unique models and tags
  const models = useMemo(() => {
    return Array.from(new Set(poses.map((p) => p.modelName))).sort();
  }, [poses]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    poses.forEach((p) => p.tags.forEach((tag) => allTags.add(tag)));
    return Array.from(allTags).sort();
  }, [poses]);

  // Filter and sort poses
  const filteredPoses = useMemo(() => {
    let result = poses;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Model filter
    if (filterBy === 'model' && selectedModel) {
      result = result.filter((p) => p.modelName === selectedModel);
    }

    // Tag filter
    if (filterBy === 'tag' && selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case 'model':
        sorted.sort((a, b) => a.modelName.localeCompare(b.modelName));
        break;
    }

    return sorted;
  }, [poses, searchQuery, sortBy, filterBy, selectedModel, selectedTag]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pose? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await onDeletePose(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] border border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400">📚 Pose Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-700 space-y-3 bg-gray-700/30">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search poses..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Filters and Sort */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <label className="block text-gray-300 mb-1">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="date">Recent</option>
                <option value="name">Name</option>
                <option value="model">Model</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Filter</label>
              <select
                value={filterBy}
                onChange={(e) => {
                  setFilterBy(e.target.value as FilterBy);
                  setSelectedModel('');
                  setSelectedTag('');
                }}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="all">All Poses</option>
                <option value="model">By Model</option>
                <option value="tag">By Tag</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">
                {filterBy === 'model' ? 'Model' : filterBy === 'tag' ? 'Tag' : 'Count'}
              </label>
              {filterBy === 'model' && (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All Models</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}
              {filterBy === 'tag' && (
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              )}
              {filterBy === 'all' && (
                <div className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm flex items-center">
                  {filteredPoses.length} pose{filteredPoses.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Poses List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredPoses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg mb-2">No poses found</p>
              <p className="text-sm">Save a pose to get started</p>
            </div>
          ) : (
            filteredPoses.map((pose) => (
              <div
                key={pose.id}
                className="bg-gray-700 rounded border border-gray-600 hover:border-blue-500 transition-colors"
              >
                {/* Pose Header */}
                <button
                  onClick={() =>
                    setExpandedPoseId(expandedPoseId === pose.id ? null : pose.id)
                  }
                  className="w-full text-left p-3 hover:bg-gray-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{pose.name}</h3>
                      <p className="text-sm text-gray-400">
                        {pose.modelName} • {pose.bones.length} bones
                      </p>
                    </div>
                    <span className="text-gray-400 text-lg">
                      {expandedPoseId === pose.id ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedPoseId === pose.id && (
                  <div className="border-t border-gray-600 p-3 space-y-3 bg-gray-800/50">
                    {/* Description */}
                    {pose.description && (
                      <div>
                        <p className="text-sm text-gray-300">{pose.description}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {pose.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pose.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Created: {formatDate(pose.createdAt)}</p>
                      <p>Updated: {formatDate(pose.updatedAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onLoadPose(pose)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        ✓ Load
                      </button>
                      <button
                        onClick={() => onExportPose(pose.id)}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        ⬇ Export
                      </button>
                      <button
                        onClick={() => handleDelete(pose.id)}
                        disabled={isLoading || deletingId === pose.id}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        {deletingId === pose.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
