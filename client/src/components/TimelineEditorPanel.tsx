import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface TimelineEditorPanelProps {
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: (frame: number) => void;
  keyframes: number[];
  onClose?: () => void;
}

export default function TimelineEditorPanel({
  currentFrame,
  totalFrames,
  fps,
  isPlaying,
  onFrameChange,
  onPlay,
  onPause,
  onStop,
  onAddKeyframe,
  onRemoveKeyframe,
  keyframes,
  onClose,
}: TimelineEditorPanelProps) {
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const duration = totalFrames / fps;
  const currentTime = currentFrame / fps;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const frame = Math.floor(percentage * totalFrames);

    onFrameChange(Math.max(0, Math.min(frame, totalFrames - 1)));
  };

  const handleKeyframeClick = (frame: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onFrameChange(frame);
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Timeline Editor</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? onPause : onPlay}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={onStop}
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={onAddKeyframe}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white ml-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Keyframe
          </Button>
        </div>

        {/* Frame Information */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400 text-xs">Frame</div>
            <div className="text-white font-mono text-lg">
              {currentFrame}/{totalFrames}
            </div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400 text-xs">Time</div>
            <div className="text-white font-mono text-lg">{currentTime.toFixed(2)}s</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400 text-xs">Duration</div>
            <div className="text-white font-mono text-lg">{duration.toFixed(2)}s</div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={[currentFrame]}
            onValueChange={(value) => onFrameChange(value[0])}
            min={0}
            max={totalFrames - 1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Timeline Visualization */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-12 bg-slate-800 rounded border border-slate-700 cursor-pointer overflow-hidden"
          onMouseMove={(e) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const frame = Math.floor(percentage * totalFrames);
            setHoveredFrame(frame);
          }}
          onMouseLeave={() => setHoveredFrame(null)}
        >
          {/* Grid lines */}
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-slate-700"
              style={{ left: `${(i / 10) * 100}%` }}
            />
          ))}

          {/* Keyframes */}
          {keyframes.map((frame) => (
            <div
              key={frame}
              className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full cursor-pointer hover:bg-green-400 z-10"
              style={{ left: `${(frame / totalFrames) * 100}%` }}
              onClick={(e) => handleKeyframeClick(frame, e)}
              title={`Frame ${frame}`}
            />
          ))}

          {/* Current frame indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          />

          {/* Hover indicator */}
          {hoveredFrame !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500 opacity-50"
              style={{ left: `${(hoveredFrame / totalFrames) * 100}%` }}
            />
          )}
        </div>

        {/* Keyframe List */}
        {keyframes.length > 0 && (
          <div className="bg-slate-800 rounded p-2 max-h-32 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2">Keyframes ({keyframes.length})</div>
            <div className="space-y-1">
              {keyframes.map((frame) => (
                <div
                  key={frame}
                  className={`flex items-center justify-between p-1 rounded text-xs cursor-pointer ${
                    currentFrame === frame
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => onFrameChange(frame)}
                >
                  <span>Frame {frame}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveKeyframe(frame);
                    }}
                    className="hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400">
          <p>💡 Click on timeline to scrub. Green dots are keyframes.</p>
        </div>
      </div>
    </Card>
  );
}
