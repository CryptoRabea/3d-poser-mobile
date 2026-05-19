import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import type { BoneTransform } from '@/lib/poseStorage';

interface PoseDetectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPoseDetected: (pose: BoneTransform[]) => void;
  isLoading?: boolean;
}

export function PoseDetectionPanel({
  isOpen,
  onClose,
  onPoseDetected,
  isLoading = false,
}: PoseDetectionPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectionMode, setDetectionMode] = useState<'webcam' | 'image' | null>(null);
  const [capturedPose, setCapturedPose] = useState<BoneTransform[] | null>(null);

  const {
    isLoading: isPoseLoading,
    isDetecting,
    confidence,
    error,
    startWebcamDetection,
    detectFromImage,
    stopDetection,
  } = useMediaPipePose({
    onPoseDetected: (pose) => {
      setCapturedPose(pose);
    },
    config: {
      modelComplexity: 'lite',
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    },
  });

  // Start webcam detection
  const handleStartWebcam = async () => {
    if (videoRef.current) {
      setDetectionMode('webcam');
      await startWebcamDetection(videoRef.current);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        setDetectionMode('image');
        await detectFromImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Capture current pose
  const handleCapturePose = () => {
    if (capturedPose && capturedPose.length > 0) {
      onPoseDetected(capturedPose);
      handleClose();
    }
  };

  // Close and cleanup
  const handleClose = () => {
    stopDetection();
    setDetectionMode(null);
    setCapturedPose(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>🎥</span>
            AI-Powered Pose Detection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Detection Mode Selection */}
          {!detectionMode && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleStartWebcam}
                disabled={isPoseLoading || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                📹 Webcam
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPoseLoading || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
              >
                🖼️ Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Webcam Detection */}
          {detectionMode === 'webcam' && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-red-500 opacity-50" />
              </div>

              {/* Confidence Display */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Detection Confidence</span>
                  <span className="text-sm font-semibold text-red-400">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="text-sm text-gray-400 text-center">
                {isDetecting ? '🟢 Detecting pose...' : '⏸️ Paused'}
              </div>
            </div>
          )}

          {/* Image Detection */}
          {detectionMode === 'image' && (
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-300">Image loaded</p>
                <p className="text-xs text-gray-500 mt-1">
                  Confidence: {(confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
              <p className="text-sm text-red-300">
                <span className="font-semibold">Error:</span> {error.message}
              </p>
            </div>
          )}

          {/* Captured Pose Info */}
          {capturedPose && capturedPose.length > 0 && (
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
              <p className="text-sm text-green-300">
                <span className="font-semibold">✓ Pose Detected:</span> {capturedPose.length} bones
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-2">
            <p>
              <span className="text-red-400 font-semibold">💡 How it works:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Choose webcam for real-time pose detection</li>
              <li>Or upload an image to detect pose from photo</li>
              <li>AI analyzes body position and converts to character bones</li>
              <li>Click Capture to apply detected pose to your model</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Requires webcam permission. Works best with full body visible.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {detectionMode && (
              <Button
                onClick={() => {
                  stopDetection();
                  setDetectionMode(null);
                  setCapturedPose(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                ↩️ Back
              </Button>
            )}
            <Button
              onClick={handleCapturePose}
              disabled={!capturedPose || capturedPose.length === 0 || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ✓ Capture Pose
            </Button>
            <Button
              onClick={handleClose}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
