import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getAllAnimationSequences, AnimationSequence } from '@/lib/animationSequences';

interface AnimationPresetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAnimation: (animation: AnimationSequence) => void;
  onStopAnimation: () => void;
  isPlaying: boolean;
  currentAnimation: AnimationSequence | null;
}

export default function AnimationPresetPanel({
  isOpen,
  onClose,
  onPlayAnimation,
  onStopAnimation,
  isPlaying,
  currentAnimation
}: AnimationPresetPanelProps) {
  const animations = getAllAnimationSequences();
  const categories = ['locomotion', 'action', 'idle', 'gesture'] as const;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      locomotion: '🚶 Locomotion',
      action: '⚡ Actions',
      idle: '😌 Idle',
      gesture: '👋 Gestures'
    };
    return labels[category] || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-900/50 text-green-300',
      medium: 'bg-yellow-900/50 text-yellow-300',
      hard: 'bg-red-900/50 text-red-300'
    };
    return colors[difficulty] || 'bg-gray-900/50 text-gray-300';
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-red-600/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-500">
            🎬 Animation Presets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Animation Display */}
          {currentAnimation && (
            <div className="bg-gray-800/50 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{currentAnimation.name}</h3>
                  <p className="text-sm text-gray-400">{currentAnimation.description}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getDifficultyColor(currentAnimation.difficulty)}`}>
                  {getDifficultyLabel(currentAnimation.difficulty)}
                </span>
              </div>
              <div className="flex gap-2">
                {isPlaying ? (
                  <Button
                    onClick={onStopAnimation}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={() => onPlayAnimation(currentAnimation)}
                    variant="default"
                    size="sm"
                    className="gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </Button>
                )}
                <Button
                  onClick={onStopAnimation}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Animation Categories */}
          <Tabs defaultValue="locomotion" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-b border-red-600/30">
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm data-[state=active]:bg-red-600/30 data-[state=active]:text-red-400"
                >
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-3 mt-4">
                {animations
                  .filter(anim => anim.category === category)
                  .map(animation => (
                    <div
                      key={animation.id}
                      className={`bg-gray-800/30 border rounded-lg p-4 transition-colors ${
                        currentAnimation?.id === animation.id
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-gray-700 hover:border-red-600/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{animation.name}</h4>
                          <p className="text-sm text-gray-400">{animation.description}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(animation.difficulty)}`}>
                            {getDifficultyLabel(animation.difficulty)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {animation.duration}s
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => onPlayAnimation(animation)}
                          variant={currentAnimation?.id === animation.id && isPlaying ? 'destructive' : 'default'}
                          size="sm"
                          className={`gap-2 flex-1 ${
                            currentAnimation?.id === animation.id && isPlaying
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-red-600/70 hover:bg-red-600'
                          }`}
                        >
                          {currentAnimation?.id === animation.id && isPlaying ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Playing...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Play
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => {
                            onPlayAnimation(animation);
                          }}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          Preview
                        </Button>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        {animation.fps} FPS • {animation.keyframes.length} keyframes
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Info Section */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-sm text-gray-400">
            <p className="font-semibold text-gray-300 mb-2">💡 Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click <strong>Play</strong> to apply the animation to your model</li>
              <li>• Animations loop automatically until you click <strong>Stop</strong></li>
              <li>• Use the Timeline to record custom animations</li>
              <li>• Combine presets with manual poses for unique animations</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
