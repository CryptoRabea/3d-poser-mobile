import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  createAnimation,
  addKeyframe,
  removeKeyframe,
  getPoseAtFrame,
  getAnimationDuration,
  getTimeFromFrame,
  getFrameFromTime,
  type Animation,
  type BoneTransform,
} from '@/lib/animationTimeline';
import { Play, Pause, RotateCcw, Trash2, Plus, Download } from 'lucide-react';

interface AnimationTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: any;
  currentPose: BoneTransform[];
  onApplyPose: (pose: BoneTransform[]) => void;
  isLoading?: boolean;
}

/**
 * Animation Timeline Component
 * Records poses at keyframes and plays back animations
 */
export default function AnimationTimeline({
  isOpen,
  onClose,
  currentModel,
  currentPose,
  onApplyPose,
  isLoading = false,
}: AnimationTimelineProps) {
  const [animation, setAnimation] = useState<Animation | null>(null);
  const [animationName, setAnimationName] = useState('New Animation');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(30);
  const [showNameDialog, setShowNameDialog] = useState(false);

  // Initialize animation when modal opens
  useEffect(() => {
    if (isOpen && !animation) {
      setAnimation(createAnimation(animationName, 'Created animation', fps));
    }
  }, [isOpen]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || !animation) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next > animation.totalFrames) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, animation, fps]);

  // Apply pose when frame changes
  useEffect(() => {
    if (!animation) return;

    const pose = getPoseAtFrame(animation, currentFrame);
    if (pose) {
      onApplyPose(pose);
    }
  }, [currentFrame, animation]);

  const handleAddKeyframe = useCallback(() => {
    if (!animation) return;

    const updated = addKeyframe(animation, currentFrame, currentPose);
    setAnimation(updated);
  }, [animation, currentFrame, currentPose]);

  const handleRemoveKeyframe = useCallback(() => {
    if (!animation) return;

    const updated = removeKeyframe(animation, currentFrame);
    setAnimation(updated);
  }, [animation, currentFrame]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
  }, []);

  const handleExport = useCallback(() => {
    if (!animation) return;

    const json = JSON.stringify(animation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${animation.name}.animation.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [animation]);

  const handleFrameChange = useCallback((value: number[]) => {
    setCurrentFrame(value[0]);
  }, []);

  const handleFpsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFps = Math.max(1, Math.min(120, parseInt(e.target.value) || 30));
    setFps(newFps);
  }, []);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
    setAnimation(null);
    onClose();
  }, [onClose]);

  if (!animation) return null;

  const duration = getAnimationDuration(animation);
  const currentTime = getTimeFromFrame(animation, currentFrame);
  const hasKeyframeAtCurrentFrame = animation.keyframes.some((k) => k.frameNumber === currentFrame);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-96 overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>🎬 Animation Timeline</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNameDialog(true)}
              className="text-gray-300 hover:text-white"
            >
              {animation.name}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-white">
          {/* Playback Controls */}
          <div className="flex gap-2 items-center bg-gray-800 rounded-lg p-3">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              size="sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="flex-1 text-sm text-gray-400">
              <span>{currentFrame}</span>
              <span> / {animation.totalFrames}</span>
              <span className="ml-4">
                {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddKeyframe}
                disabled={isLoading || hasKeyframeAtCurrentFrame}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleRemoveKeyframe}
                disabled={isLoading || !hasKeyframeAtCurrentFrame}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleExport}
                disabled={isLoading || animation.keyframes.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="space-y-2">
            <Label className="text-gray-300">Frame</Label>
            <Slider
              value={[currentFrame]}
              onValueChange={handleFrameChange}
              max={animation.totalFrames}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* FPS Control */}
          <div className="flex items-center gap-4">
            <Label className="text-gray-300 w-20">FPS:</Label>
            <Input
              type="number"
              min="1"
              max="120"
              value={fps}
              onChange={handleFpsChange}
              disabled={isLoading}
              className="w-20 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Keyframes List */}
          <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-400 mb-2">
              Keyframes: {animation.keyframes.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {animation.keyframes.map((kf) => (
                <button
                  key={kf.frameNumber}
                  onClick={() => setCurrentFrame(kf.frameNumber)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    currentFrame === kf.frameNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {kf.frameNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 bg-gray-800 rounded p-2">
            <p>💡 Tip: Add keyframes at different frames, then press Play to see animation</p>
          </div>
        </div>
      </DialogContent>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Animation Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              placeholder="Enter animation name"
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button
              onClick={() => {
                if (animation) {
                  setAnimation({ ...animation, name: animationName });
                }
                setShowNameDialog(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
