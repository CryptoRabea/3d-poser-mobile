import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ModelLoaderProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadModel: (modelPath: string, modelName: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Model Loader Component
 * Provides quick access to sample humanoid models for testing
 */
export default function ModelLoader({
  isOpen,
  onClose,
  onLoadModel,
  isLoading = false,
}: ModelLoaderProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const sampleModels = [
    {
      id: 'simple',
      name: 'Simple Humanoid',
      path: '/models/SimpleHumanoid.glb',
      description: 'Basic humanoid model with standard proportions',
      icon: '🤖',
    },
    {
      id: 'tall',
      name: 'Tall Humanoid',
      path: '/models/TallHumanoid.glb',
      description: 'Taller character model (1.2x scale)',
      icon: '🏀',
    },
    {
      id: 'compact',
      name: 'Compact Humanoid',
      path: '/models/CompactHumanoid.glb',
      description: 'Smaller character model (0.8x scale)',
      icon: '🧒',
    },
  ];

  const handleLoadModel = async (model: typeof sampleModels[0]) => {
    try {
      setSelectedModel(model.id);
      await onLoadModel(model.path, model.name);
      onClose();
    } catch (error) {
      console.error('Failed to load model:', error);
      setSelectedModel(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">📦 Load Sample Model</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sampleModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleLoadModel(model)}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-red-600 hover:bg-gray-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{model.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{model.name}</h3>
                  <p className="text-sm text-gray-400">{model.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{model.path}</p>
                </div>
                {selectedModel === model.id && isLoading && (
                  <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500 p-3 bg-gray-800/50 rounded">
          💡 <strong>Tip:</strong> These sample models are perfect for testing bone selection,
          pose creation, and animation timelines. Try saving a pose and loading it back!
        </div>
      </DialogContent>
    </Dialog>
  );
}
