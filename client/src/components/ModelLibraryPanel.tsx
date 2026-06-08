import React, { useState } from 'react';
import {
  X,
  Search,
  Trash2,
  Edit2,
  Download,
  Tag,
  FileText,
  HardDrive,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useModelLibrary } from '@/hooks/useModelLibrary';
import { formatStorageSize } from '@/lib/modelStorage';

interface ModelLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelId: string) => void;
  isLoading?: boolean;
}

/**
 * Model Library Panel Component
 * Displays all saved models with search, filtering, and management options
 */
export default function ModelLibraryPanel({
  isOpen,
  onClose,
  onSelectModel,
  isLoading: externalLoading,
}: ModelLibraryPanelProps) {
  // Must call all hooks before any conditional returns
  const modelLibrary = useModelLibrary();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Early return after all hooks
  if (!isOpen) return null;

  const filteredModels = modelLibrary.getFilteredModels();
  const isLoading = externalLoading || modelLibrary.isLoading;

  const handleSelectModel = (modelId: string) => {
    modelLibrary.selectModel(modelId);
    onSelectModel(modelId);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      modelLibrary.removeModel(modelId);
    }
  };

  const handleEditModel = (model: any) => {
    setEditingId(model.id);
    setEditName(model.name);
    setEditDescription(model.description || '');
    setEditTags(model.tags.join(', '));
  };

  const handleSaveEdit = (modelId: string) => {
    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    modelLibrary.updateModel(modelId, {
      name: editName,
      description: editDescription,
      tags,
    });

    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-red-500" />
            Model Library
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search and Stats */}
          <div className="p-4 border-b border-gray-700 space-y-3 flex-shrink-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={modelLibrary.searchQuery}
                onChange={(e) => modelLibrary.setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Tag Filter */}
            {modelLibrary.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {modelLibrary.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (modelLibrary.selectedTags.includes(tag)) {
                        modelLibrary.setSelectedTags(
                          modelLibrary.selectedTags.filter((t) => t !== tag)
                        );
                      } else {
                        modelLibrary.setSelectedTags([
                          ...modelLibrary.selectedTags,
                          tag,
                        ]);
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      modelLibrary.selectedTags.includes(tag)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Models</p>
                <p className="text-white font-bold">{modelLibrary.stats.totalModels}</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Storage</p>
                <p className="text-white font-bold">
                  {formatStorageSize(modelLibrary.stats.totalSize)}
                </p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400">Results</p>
                <p className="text-white font-bold">{filteredModels.length}</p>
              </div>
            </div>
          </div>

          {/* Models Grid */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="ml-2 text-gray-400">Loading models...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400">
                  {modelLibrary.models.length === 0
                    ? 'No models saved yet. Upload one to get started!'
                    : 'No models match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className={`bg-gray-700 rounded border-2 transition-all ${
                      modelLibrary.selectedModel?.id === model.id
                        ? 'border-red-500'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {/* Model Thumbnail */}
                    {model.thumbnail ? (
                      <img
                        src={model.thumbnail}
                        alt={model.name}
                        className="w-full h-32 object-cover rounded-t"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-600 rounded-t flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                    )}

                    {/* Model Info */}
                    {editingId === model.id ? (
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                          placeholder="Model name"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                          placeholder="Tags (comma-separated)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(model.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <h3 className="font-bold text-white truncate">{model.name}</h3>

                        {/* Metadata */}
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>{model.format.toUpperCase()} • {formatStorageSize(model.fileSize)}</p>
                          {model.boneCount && (
                            <p>🦴 {model.boneCount} bones</p>
                          )}
                          {model.meshCount && (
                            <p>🔲 {model.meshCount} meshes</p>
                          )}
                        </div>

                        {/* Tags */}
                        {model.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {model.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {model.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {model.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSelectModel(model.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleEditModel(model)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>
              Storage: {formatStorageSize(modelLibrary.stats.totalSize)} / 500 MB
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
