/**
 * Timeline Editor
 * Manages keyframes and animation timeline for bone animations
 */

import * as THREE from 'three';

export interface Keyframe {
  frame: number;
  time: number;
  boneTransforms: Map<string, BoneTransformKeyframe>;
}

export interface BoneTransformKeyframe {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
}

export interface TimelineTrack {
  boneName: string;
  keyframes: Keyframe[];
  interpolation: 'linear' | 'bezier' | 'step';
}

export class TimelineEditor {
  private tracks: Map<string, TimelineTrack> = new Map();
  private currentFrame: number = 0;
  private totalFrames: number = 120;
  private fps: number = 30;
  private isPlaying: boolean = false;
  private startTime: number = 0;

  constructor(fps: number = 30, totalFrames: number = 120) {
    this.fps = fps;
    this.totalFrames = totalFrames;
  }

  /**
   * Add keyframe for a bone at current frame
   */
  addKeyframe(boneName: string, transform: BoneTransformKeyframe): void {
    if (!this.tracks.has(boneName)) {
      this.tracks.set(boneName, {
        boneName,
        keyframes: [],
        interpolation: 'linear',
      });
    }

    const track = this.tracks.get(boneName)!;
    const time = this.currentFrame / this.fps;

    // Check if keyframe already exists at this frame
    const existingIndex = track.keyframes.findIndex((kf) => kf.frame === this.currentFrame);

    if (existingIndex >= 0) {
      track.keyframes[existingIndex].boneTransforms.set(boneName, transform);
    } else {
      const keyframe: Keyframe = {
        frame: this.currentFrame,
        time,
        boneTransforms: new Map([[boneName, transform]]),
      };
      track.keyframes.push(keyframe);
      track.keyframes.sort((a, b) => a.frame - b.frame);
    }
  }

  /**
   * Remove keyframe at specific frame
   */
  removeKeyframe(boneName: string, frame: number): void {
    const track = this.tracks.get(boneName);
    if (track) {
      track.keyframes = track.keyframes.filter((kf) => kf.frame !== frame);
    }
  }

  /**
   * Get all keyframes for a bone
   */
  getKeyframes(boneName: string): Keyframe[] {
    return this.tracks.get(boneName)?.keyframes || [];
  }

  /**
   * Get interpolated transform at specific frame
   */
  getTransformAtFrame(boneName: string, frame: number): BoneTransformKeyframe | null {
    const track = this.tracks.get(boneName);
    if (!track || track.keyframes.length === 0) return null;

    // Find surrounding keyframes
    let before: Keyframe | null = null;
    let after: Keyframe | null = null;

    for (const kf of track.keyframes) {
      if (kf.frame <= frame) {
        before = kf;
      }
      if (kf.frame >= frame && !after) {
        after = kf;
      }
    }

    if (!before && !after) return null;
    if (!before) return after!.boneTransforms.get(boneName) || null;
    if (!after) return before.boneTransforms.get(boneName) || null;

    // Interpolate between keyframes
    if (before.frame === after.frame) {
      return before.boneTransforms.get(boneName) || null;
    }

    const t = (frame - before.frame) / (after.frame - before.frame);
    const beforeTransform = before.boneTransforms.get(boneName);
    const afterTransform = after.boneTransforms.get(boneName);

    if (!beforeTransform || !afterTransform) return null;

    return this.interpolateTransform(beforeTransform, afterTransform, t, track.interpolation);
  }

  /**
   * Interpolate between two transforms
   */
  private interpolateTransform(
    from: BoneTransformKeyframe,
    to: BoneTransformKeyframe,
    t: number,
    interpolation: string
  ): BoneTransformKeyframe {
    let factor = t;

    if (interpolation === 'bezier') {
      // Ease-in-out cubic
      factor = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    } else if (interpolation === 'step') {
      factor = t < 0.5 ? 0 : 1;
    }

    return {
      position: new THREE.Vector3().lerpVectors(from.position, to.position, factor),
      rotation: new THREE.Quaternion().slerpQuaternions(from.rotation, to.rotation, factor),
      scale: new THREE.Vector3().lerpVectors(from.scale, to.scale, factor),
    };
  }

  /**
   * Set current frame
   */
  setCurrentFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(frame, this.totalFrames - 1));
  }

  /**
   * Get current frame
   */
  getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * Get current time in seconds
   */
  getCurrentTime(): number {
    return this.currentFrame / this.fps;
  }

  /**
   * Get total duration in seconds
   */
  getDuration(): number {
    return this.totalFrames / this.fps;
  }

  /**
   * Play animation
   */
  play(): void {
    this.isPlaying = true;
    this.startTime = Date.now() - this.currentFrame / this.fps * 1000;
  }

  /**
   * Pause animation
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Stop animation and reset to frame 0
   */
  stop(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
  }

  /**
   * Update animation playback
   */
  update(): void {
    if (!this.isPlaying) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const newFrame = Math.floor(elapsed * this.fps);

    if (newFrame >= this.totalFrames) {
      this.currentFrame = this.totalFrames - 1;
      this.isPlaying = false;
    } else {
      this.currentFrame = newFrame;
    }
  }

  /**
   * Export animation as Three.js AnimationClip
   */
  exportAsAnimationClip(name: string): THREE.AnimationClip {
    const tracks: THREE.KeyframeTrack[] = [];

    this.tracks.forEach((track) => {
      if (track.keyframes.length < 2) return;

      // Position track
      const positionTimes: number[] = [];
      const positionValues: number[] = [];

      track.keyframes.forEach((kf) => {
        const transform = kf.boneTransforms.get(track.boneName);
        if (transform) {
          positionTimes.push(kf.time);
          positionValues.push(transform.position.x, transform.position.y, transform.position.z);
        }
      });

      if (positionTimes.length > 0) {
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${track.boneName}.position`,
            positionTimes,
            positionValues
          )
        );
      }

      // Rotation track
      const rotationTimes: number[] = [];
      const rotationValues: number[] = [];

      track.keyframes.forEach((kf) => {
        const transform = kf.boneTransforms.get(track.boneName);
        if (transform) {
          rotationTimes.push(kf.time);
          rotationValues.push(
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z,
            transform.rotation.w
          );
        }
      });

      if (rotationTimes.length > 0) {
        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${track.boneName}.quaternion`,
            rotationTimes,
            rotationValues
          )
        );
      }

      // Scale track
      const scaleTimes: number[] = [];
      const scaleValues: number[] = [];

      track.keyframes.forEach((kf) => {
        const transform = kf.boneTransforms.get(track.boneName);
        if (transform) {
          scaleTimes.push(kf.time);
          scaleValues.push(transform.scale.x, transform.scale.y, transform.scale.z);
        }
      });

      if (scaleTimes.length > 0) {
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${track.boneName}.scale`,
            scaleTimes,
            scaleValues
          )
        );
      }
    });

    return new THREE.AnimationClip(name, this.getDuration(), tracks);
  }

  /**
   * Clear all keyframes
   */
  clear(): void {
    this.tracks.clear();
    this.currentFrame = 0;
  }

  /**
   * Get all bone names with keyframes
   */
  getBoneNames(): string[] {
    return Array.from(this.tracks.keys());
  }

  /**
   * Set interpolation mode for a bone
   */
  setInterpolation(boneName: string, interpolation: 'linear' | 'bezier' | 'step'): void {
    const track = this.tracks.get(boneName);
    if (track) {
      track.interpolation = interpolation;
    }
  }
}
