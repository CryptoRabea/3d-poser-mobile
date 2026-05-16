import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MIXAMO_CATEGORIES,
  MIXAMO_ANIMATION_CATEGORIES,
  POPULAR_MIXAMO_MODELS,
  POPULAR_MIXAMO_ANIMATIONS,
  getMixamoModelsByCategory,
  getMixamoAnimationsByCategory,
  searchMixamoModels,
  searchMixamoAnimations,
  getMixamoDownloadInstructions,
  MixamoModel,
  MixamoAnimation
} from '@/lib/mixamoIntegration';

interface MixamoDownloaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MixamoDownloader({ isOpen, onClose }: MixamoDownloaderProps) {
  const [activeTab, setActiveTab] = useState<'models' | 'animations' | 'instructions'>('models');
  const [selectedCategory, setSelectedCategory] = useState<string>('humanoid');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedModels, setDisplayedModels] = useState<MixamoModel[]>(
    getMixamoModelsByCategory('humanoid')
  );
  const [displayedAnimations, setDisplayedAnimations] = useState<MixamoAnimation[]>(
    getMixamoAnimationsByCategory('locomotion')
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDisplayedModels(getMixamoModelsByCategory(category));
  };

  const handleAnimationCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDisplayedAnimations(getMixamoAnimationsByCategory(category));
  };

  const handleModelSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setDisplayedModels(searchMixamoModels(query));
    } else {
      setDisplayedModels(getMixamoModelsByCategory(selectedCategory));
    }
  };

  const handleAnimationSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setDisplayedAnimations(searchMixamoAnimations(query));
    } else {
      setDisplayedAnimations(getMixamoAnimationsByCategory(selectedCategory));
    }
  };

  const handleDownloadModel = (model: MixamoModel) => {
    // Open Mixamo website with instructions
    alert(
      `To download "${model.name}":\n\n` +
      `1. Visit https://www.mixamo.com\n` +
      `2. Sign in with Adobe ID\n` +
      `3. Search for "${model.name}"\n` +
      `4. Download in .glb format\n` +
      `5. Import into 3D Poser using the Upload button\n\n` +
      `See the "Instructions" tab for detailed steps.`
    );
    window.open('https://www.mixamo.com', '_blank');
  };

  const handleDownloadAnimation = (animation: MixamoAnimation) => {
    alert(
      `To download "${animation.name}" animation:\n\n` +
      `1. Visit https://www.mixamo.com\n` +
      `2. Sign in with Adobe ID\n` +
      `3. Go to Animations section\n` +
      `4. Search for "${animation.name}"\n` +
      `5. Download in .glb format\n` +
      `6. Import into 3D Poser using the Upload button\n\n` +
      `See the "Instructions" tab for detailed steps.`
    );
    window.open('https://www.mixamo.com', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-red-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-500">
            🎭 Mixamo Integration
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Browse and download professional rigged models and animations from Mixamo
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="models" className="data-[state=active]:bg-red-600">
              👤 Models
            </TabsTrigger>
            <TabsTrigger value="animations" className="data-[state=active]:bg-red-600">
              🎬 Animations
            </TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-red-600">
              📖 Guide
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => handleModelSearch(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />

              <div className="grid grid-cols-2 gap-2">
                {MIXAMO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2 rounded text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayedModels.length > 0 ? (
                displayedModels.map((model) => (
                  <div
                    key={model.id}
                    className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-red-600 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{model.name}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{model.description}</p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>✓ Rigged</span>
                          {model.animated && <span>✓ Animated</span>}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownloadModel(model)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No models found</p>
              )}
            </div>
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Search animations..."
                value={searchQuery}
                onChange={(e) => handleAnimationSearch(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />

              <div className="grid grid-cols-2 gap-2">
                {MIXAMO_ANIMATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleAnimationCategoryChange(cat.id)}
                    className={`p-2 rounded text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayedAnimations.length > 0 ? (
                displayedAnimations.map((anim) => (
                  <div
                    key={anim.id}
                    className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-red-600 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{anim.name}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{anim.description}</p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>⏱️ {anim.duration}s</span>
                          <span>📹 {anim.fps} FPS</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownloadAnimation(anim)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No animations found</p>
              )}
            </div>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded border border-gray-700 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-300 space-y-3">
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">📥 How to Download from Mixamo</h3>
                  <ol className="list-decimal list-inside space-y-2 text-xs">
                    <li><strong>Visit Mixamo:</strong> Go to https://www.mixamo.com</li>
                    <li><strong>Sign In:</strong> Use Adobe ID (free account available)</li>
                    <li><strong>Browse:</strong> Click "Characters" or "Animations"</li>
                    <li><strong>Download:</strong> Select .glb format for best compatibility</li>
                    <li><strong>Import:</strong> Use "📤 Upload" button in 3D Poser</li>
                  </ol>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h3 className="font-semibold text-red-500 mb-2">✨ Tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Free account includes thousands of models and animations</li>
                    <li>All models come with professional rigging</li>
                    <li>Download in .glb format for 3D Poser compatibility</li>
                    <li>Mix and match models with animations from different sources</li>
                    <li>Use Timeline to apply animations to imported models</li>
                  </ul>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h3 className="font-semibold text-red-500 mb-2">🔗 Direct Link</h3>
                  <Button
                    onClick={() => window.open('https://www.mixamo.com', '_blank')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Open Mixamo Website →
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
          >
            Close
          </Button>
          <Button
            onClick={() => window.open('https://www.mixamo.com', '_blank')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Visit Mixamo →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
