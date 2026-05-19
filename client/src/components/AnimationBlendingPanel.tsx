import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getAllAnimationSequences, type AnimationSequence } from '@/lib/animationSequences';
import {
  createBlendState,
  getBlendedPoseAtFrame,
  validateBlendFactor,
  validateSpeed,
  getAnimationDuration,
} from '@/lib/animationBlending';
import type { BoneTransform } from '@/lib/poseStorage';

interface AnimationBlendingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBlendedPoseUpdate: (pose: BoneTransform[]) => void;
  isLoading?: boolean;
}

export function AnimationBlendingPanel({
  isOpen,
  onClose,
  onBlendedPoseUpdate,
  isLoading = false,
}: AnimationBlendingPanelProps) {
  const animationSequences = getAllAnimationSequences();
  const [animation1, setAnimation1] = useState<AnimationSequence | null>(animationSequences[0]);
  const [animation2, setAnimation2] = useState<AnimationSequence | null>(animationSequences[1]);
  const [blendFactor, setBlendFactor] = useState(0.5);
  const [speed, setSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [duration1, setDuration1] = useState(0);
  const [duration2, setDuration2] = useState(0);

  // Calculate durations
  useEffect(() => {
    if (animation1) setDuration1(getAnimationDuration(animation1));
    if (animation2) setDuration2(getAnimationDuration(animation2));
  }, [animation1, animation2]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || !animation1 || !animation2) return;

    let animationFrameId: number;
    let lastTime = Date.now();
    const maxDuration = Math.max(duration1, duration2);

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      setCurrentFrame((prev) => {
        let newFrame = prev + (deltaTime * speed * 30) / 1000;
        if (newFrame >= maxDuration * 30) {
          newFrame = 0;
        }
        return newFrame;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, animation1, animation2, speed, duration1, duration2]);

  // Update blended pose
  useEffect(() => {
    if (!animation1 || !animation2) return;

    const pose = getBlendedPoseAtFrame(
      animation1,
      animation2,
      Math.floor(currentFrame),
      validateBlendFactor(blendFactor)
    );

    if (pose) {
      onBlendedPoseUpdate(pose);
    }
  }, [currentFrame, blendFactor, animation1, animation2, onBlendedPoseUpdate]);

  const handleBlendFactorChange = (value: number[]) => {
    setBlendFactor(validateBlendFactor(value[0]));
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(validateSpeed(value[0]));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const maxDuration = Math.max(duration1, duration2);
  const progress = maxDuration > 0 ? (currentFrame / (maxDuration * 30)) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>🎬</span>
            Animation Blending & Speed Control
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Animation Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Animation 1
              </label>
              <select
                value={animation1?.id || ''}
                onChange={(e) => {
                  const selected = animationSequences.find((a: AnimationSequence) => a.id === e.target.value);
                  setAnimation1(selected || null);
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
              >
                {animationSequences.map((anim: AnimationSequence) => (
                  <option key={anim.id} value={anim.id}>
                    {anim.name}
                  </option>
                ))}
              </select>
              {animation1 && (
                <p className="text-xs text-gray-400 mt-1">
                  Duration: {duration1.toFixed(2)}s
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Animation 2
              </label>
              <select
                value={animation2?.id || ''}
                onChange={(e) => {
                  const selected = animationSequences.find((a: AnimationSequence) => a.id === e.target.value);
                  setAnimation2(selected || null);
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
              >
                {animationSequences.map((anim: AnimationSequence) => (
                  <option key={anim.id} value={anim.id}>
                    {anim.name}
                  </option>
                ))}
              </select>
              {animation2 && (
                <p className="text-xs text-gray-400 mt-1">
                  Duration: {duration2.toFixed(2)}s
                </p>
              )}
            </div>
          </div>

          {/* Blend Factor Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Blend Factor
              </label>
              <span className="text-sm text-red-400 font-semibold">
                {animation1?.name} ({(1 - blendFactor) * 100 | 0}%) ↔ {animation2?.name} ({blendFactor * 100 | 0}%)
              </span>
            </div>
            <Slider
              value={[blendFactor]}
              onValueChange={handleBlendFactorChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100% Anim 1</span>
              <span>50/50 Blend</span>
              <span>100% Anim 2</span>
            </div>
          </div>

          {/* Speed Control Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Playback Speed
              </label>
              <span className="text-sm text-red-400 font-semibold">
                {speed.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Progress
              </label>
              <span className="text-sm text-gray-400">
                {(currentFrame / 30).toFixed(2)}s / {maxDuration.toFixed(2)}s
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading || !animation1 || !animation2}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isLoading || !animation1 || !animation2}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              ⏹ Reset
            </Button>
          </div>

          {/* Info */}
          <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-red-400 font-semibold">💡 Tip:</span> Use blend factor to smoothly transition between animations. Adjust speed for slow-motion or fast-forward effects.
            </p>
            <p>
              <span className="text-red-400 font-semibold">⚡ Speed Range:</span> 0.5x (slow-motion) to 2.0x (fast-forward)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
