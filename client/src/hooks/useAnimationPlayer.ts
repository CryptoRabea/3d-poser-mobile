import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationSequence } from '@/lib/animationSequences';
import { BoneTransform } from '@/lib/poseStorage';

interface AnimationPlayerState {
  isPlaying: boolean;
  currentAnimation: AnimationSequence | null;
  currentTime: number;
  progress: number; // 0 to 1
}

export function useAnimationPlayer(
  onApplyBoneTransforms: (bones: BoneTransform[]) => void
) {
  const [state, setState] = useState<AnimationPlayerState>({
    isPlaying: false,
    currentAnimation: null,
    currentTime: 0,
    progress: 0
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const loopCountRef = useRef<number>(0);

  /**
   * Play an animation
   */
  const playAnimation = useCallback((animation: AnimationSequence) => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentAnimation: animation,
      currentTime: 0,
      progress: 0
    }));
    startTimeRef.current = performance.now();
    loopCountRef.current = 0;
  }, []);

  /**
   * Stop the current animation
   */
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      progress: 0
    }));
  }, []);

  /**
   * Pause/resume animation
   */
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  /**
   * Seek to a specific time in the animation
   */
  const seekTo = useCallback((time: number) => {
    setState(prev => {
      if (!prev.currentAnimation) return prev;
      const clamped = Math.max(0, Math.min(time, prev.currentAnimation.duration));
      return {
        ...prev,
        currentTime: clamped,
        progress: clamped / prev.currentAnimation.duration
      };
    });
  }, []);

  /**
   * Interpolate bone transforms between keyframes
   */
  const interpolateBones = useCallback(
    (animation: AnimationSequence, time: number): BoneTransform[] => {
      const keyframes = animation.keyframes;
      if (keyframes.length === 0) return [];

      // Find surrounding keyframes
      let keyframeIndex = 0;
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
          keyframeIndex = i;
          break;
        }
      }

      const currentKeyframe = keyframes[keyframeIndex];
      const nextKeyframe = keyframes[Math.min(keyframeIndex + 1, keyframes.length - 1)];

      // Calculate interpolation factor
      const timeDiff = nextKeyframe.time - currentKeyframe.time;
      const t = timeDiff > 0 ? (time - currentKeyframe.time) / timeDiff : 0;

      // Interpolate bone transforms
      const interpolatedBones: BoneTransform[] = [];

      currentKeyframe.bones.forEach((currentBone, index) => {
        const nextBone = nextKeyframe.bones[index];
        if (!nextBone) {
          interpolatedBones.push(currentBone);
          return;
        }

        // Linear interpolation for position
        const position = {
          x: currentBone.position.x + (nextBone.position.x - currentBone.position.x) * t,
          y: currentBone.position.y + (nextBone.position.y - currentBone.position.y) * t,
          z: currentBone.position.z + (nextBone.position.z - currentBone.position.z) * t
        };

        // Spherical linear interpolation for rotation (simplified as linear)
        const rotation = {
          x: currentBone.rotation.x + (nextBone.rotation.x - currentBone.rotation.x) * t,
          y: currentBone.rotation.y + (nextBone.rotation.y - currentBone.rotation.y) * t,
          z: currentBone.rotation.z + (nextBone.rotation.z - currentBone.rotation.z) * t
        };

        // Linear interpolation for scale
        const scale = {
          x: currentBone.scale.x + (nextBone.scale.x - currentBone.scale.x) * t,
          y: currentBone.scale.y + (nextBone.scale.y - currentBone.scale.y) * t,
          z: currentBone.scale.z + (nextBone.scale.z - currentBone.scale.z) * t
        };

        interpolatedBones.push({
          name: currentBone.name,
          position,
          rotation,
          scale
        });
      });

      return interpolatedBones;
    },
    []
  );

  /**
   * Animation loop
   */
  useEffect(() => {
    if (!state.isPlaying || !state.currentAnimation) return;

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
      const duration = state.currentAnimation!.duration;

      // Calculate current time with looping
      let currentTime = elapsed % duration;
      const loopCount = Math.floor(elapsed / duration);

      // Update loop count if it changed
      if (loopCount !== loopCountRef.current) {
        loopCountRef.current = loopCount;
      }

      // Interpolate and apply bone transforms
      const bones = interpolateBones(state.currentAnimation!, currentTime);
      onApplyBoneTransforms(bones);

      // Update state
      setState(prev => ({
        ...prev,
        currentTime,
        progress: currentTime / duration
      }));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isPlaying, state.currentAnimation, interpolateBones, onApplyBoneTransforms]);

  return {
    ...state,
    playAnimation,
    stopAnimation,
    togglePause,
    seekTo
  };
}
