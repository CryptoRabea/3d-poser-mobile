import React, { useState } from 'react';
import { ChevronDown, HardDrive, Loader2 } from 'lucide-react';
import { useModelLibrary } from '@/hooks/useModelLibrary';

interface ModelSwitcherProps {
  onModelSelected: (modelId: string) => void;
  currentModelName?: string;
  isLoading?: boolean;
}

/**
 * Model Switcher Component
 * Compact dropdown for quick model switching from control bar
 */
export default function ModelSwitcher({
  onModelSelected,
  currentModelName = 'No Model',
  isLoading,
}: ModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modelLibrary = useModelLibrary();

  const handleSelectModel = (modelId: string) => {
    modelLibrary.selectModel(modelId);
    onModelSelected(modelId);
    setIsOpen(false);
  };

  const recentModels = modelLibrary.models.slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <HardDrive className="w-4 h-4" />
        )}
        <span className="hidden sm:inline truncate max-w-[120px]">
          {currentModelName}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[200px]">
          {recentModels.length === 0 ? (
            <div className="p-3 text-gray-400 text-sm">No models saved</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {recentModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-gray-700 last:border-b-0 ${
                    modelLibrary.selectedModel?.id === model.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium truncate">{model.name}</div>
                  <div className="text-xs text-gray-400">
                    {model.format.toUpperCase()} • {model.fileSize > 1024 * 1024 ? `${(model.fileSize / 1024 / 1024).toFixed(1)}MB` : `${(model.fileSize / 1024).toFixed(0)}KB`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* View All Button */}
          {modelLibrary.models.length > 5 && (
            <button
              onClick={() => {
                setIsOpen(false);
                // This will be handled by parent component
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 border-t border-gray-700 transition-colors"
            >
              View All Models ({modelLibrary.models.length})
            </button>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
