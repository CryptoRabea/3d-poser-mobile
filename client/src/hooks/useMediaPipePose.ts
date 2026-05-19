import { useEffect, useRef, useState, useCallback } from 'react';
import type { DetectedPose, PoseDetectionConfig } from '@/lib/poseDetection';
import { landmarksToBoneTransforms, smoothPoseLandmarks, calculatePoseConfidence } from '@/lib/poseDetection';
import type { BoneTransform } from '@/lib/poseStorage';

interface UseMediaPipePoseOptions {
  onPoseDetected?: (pose: BoneTransform[]) => void;
  onError?: (error: Error) => void;
  config?: PoseDetectionConfig;
}

export function useMediaPipePose(options: UseMediaPipePoseOptions = {}) {
  const { onPoseDetected, onError, config = {} } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const poseRef = useRef<any>(null);
  const previousLandmarksRef = useRef<DetectedPose['landmarks'] | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize MediaPipe Pose
  const initializePose = useCallback(async () => {
    try {
      setIsLoading(true);
      const Pose = (await import('@mediapipe/pose')).Pose;

      const pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/wasm/${file}`;
        },
      });

      const modelComplexity = typeof config.modelComplexity === 'string'
        ? (config.modelComplexity === 'lite' ? 0 : config.modelComplexity === 'heavy' ? 2 : 1)
        : (config.modelComplexity || 1);

      pose.setOptions({
        modelComplexity,
        smoothLandmarks: config.smoothLandmarks !== false,
        enableSegmentation: config.enableSegmentation || false,
        smoothSegmentation: config.smoothSegmentation || false,
        minDetectionConfidence: config.minDetectionConfidence || 0.5,
        minTrackingConfidence: config.minTrackingConfidence || 0.5,
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          // Smooth landmarks
          const smoothedLandmarks = smoothPoseLandmarks(
            results.poseLandmarks,
            previousLandmarksRef.current,
            0.7
          );
          previousLandmarksRef.current = smoothedLandmarks;

          // Calculate confidence
          const conf = calculatePoseConfidence(smoothedLandmarks);
          setConfidence(conf);

          // Convert to bone transforms
          const bones = landmarksToBoneTransforms(smoothedLandmarks, 2.0);
          onPoseDetected?.(bones);
        }
      });

      poseRef.current = pose;
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize MediaPipe Pose');
      setError(error);
      onError?.(error);
      setIsLoading(false);
    }
  }, [config, onPoseDetected, onError]);

  // Start pose detection from webcam
  const startWebcamDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      if (!poseRef.current) {
        await initializePose();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      videoElement.srcObject = stream;
      videoRef.current = videoElement;
      setIsDetecting(true);

      videoElement.onloadedmetadata = () => {
        const detectFrame = async () => {
          if (videoRef.current && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
            animationFrameRef.current = requestAnimationFrame(detectFrame);
          }
        };
        detectFrame();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start webcam');
      setError(error);
      onError?.(error);
    }
  }, [initializePose, onError]);

  // Detect pose from image
  const detectFromImage = useCallback(
    async (imageElement: HTMLImageElement | HTMLCanvasElement) => {
      try {
        if (!poseRef.current) {
          await initializePose();
        }

        await poseRef.current.send({ image: imageElement });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to detect pose from image');
        setError(error);
        onError?.(error);
      }
    },
    [initializePose, onError]
  );

  // Stop detection
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }

    setIsDetecting(false);
    previousLandmarksRef.current = null;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isLoading,
    isDetecting,
    confidence,
    error,
    startWebcamDetection,
    detectFromImage,
    stopDetection,
    videoRef,
    canvasRef,
  };
}
