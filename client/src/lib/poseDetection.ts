/**
 * AI-Powered Pose Detection using MediaPipe
 * Detects human poses from webcam or image input and converts to bone transforms
 */

import type { BoneTransform } from './poseStorage';

export interface DetectedPose {
  landmarks: Array<{
    x: number;
    y: number;
    z: number;
    visibility: number;
  }>;
  confidence: number;
}

export interface PoseDetectionConfig {
  staticImageMode?: boolean;
  modelComplexity?: 'lite' | 'full' | 'heavy';
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  smoothSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

/**
 * Convert MediaPipe landmarks to bone transforms
 * Maps detected landmarks to character skeleton bones
 */
export function landmarksToBoneTransforms(
  landmarks: DetectedPose['landmarks'],
  scale: number = 1.0
): BoneTransform[] {
  const bones: BoneTransform[] = [];

  // Helper to get landmark or default
  const getLandmark = (index: number) => landmarks[index] || { x: 0, y: 0, z: 0 };

  // Head (average of eyes and nose)
  const nose = getLandmark(POSE_LANDMARKS.NOSE);
  const leftEye = getLandmark(POSE_LANDMARKS.LEFT_EYE);
  const rightEye = getLandmark(POSE_LANDMARKS.RIGHT_EYE);
  const headX = (nose.x + leftEye.x + rightEye.x) / 3;
  const headY = (nose.y + leftEye.y + rightEye.y) / 3;
  const headZ = (nose.z + leftEye.z + rightEye.z) / 3;

  bones.push({
    name: 'Head',
    position: { x: headX * scale, y: (1 - headY) * scale, z: headZ * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // Spine (between shoulders and hips)
  const leftShoulder = getLandmark(POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmark(POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getLandmark(POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(POSE_LANDMARKS.RIGHT_HIP);

  const spineX = ((leftShoulder.x + rightShoulder.x) / 2 + (leftHip.x + rightHip.x) / 2) / 2;
  const spineY = (((leftShoulder.y + rightShoulder.y) / 2 + (leftHip.y + rightHip.y) / 2) / 2);
  const spineZ = (((leftShoulder.z + rightShoulder.z) / 2 + (leftHip.z + rightHip.z) / 2) / 2);

  bones.push({
    name: 'Spine',
    position: { x: spineX * scale, y: (1 - spineY) * scale, z: spineZ * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // Left Arm
  const leftElbow = getLandmark(POSE_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmark(POSE_LANDMARKS.LEFT_WRIST);

  bones.push({
    name: 'LeftShoulder',
    position: { x: leftShoulder.x * scale, y: (1 - leftShoulder.y) * scale, z: leftShoulder.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'LeftElbow',
    position: { x: leftElbow.x * scale, y: (1 - leftElbow.y) * scale, z: leftElbow.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'LeftWrist',
    position: { x: leftWrist.x * scale, y: (1 - leftWrist.y) * scale, z: leftWrist.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // Right Arm
  const rightElbow = getLandmark(POSE_LANDMARKS.RIGHT_ELBOW);
  const rightWrist = getLandmark(POSE_LANDMARKS.RIGHT_WRIST);

  bones.push({
    name: 'RightShoulder',
    position: { x: rightShoulder.x * scale, y: (1 - rightShoulder.y) * scale, z: rightShoulder.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'RightElbow',
    position: { x: rightElbow.x * scale, y: (1 - rightElbow.y) * scale, z: rightElbow.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'RightWrist',
    position: { x: rightWrist.x * scale, y: (1 - rightWrist.y) * scale, z: rightWrist.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // Left Leg
  const leftKnee = getLandmark(POSE_LANDMARKS.LEFT_KNEE);
  const leftAnkle = getLandmark(POSE_LANDMARKS.LEFT_ANKLE);

  bones.push({
    name: 'LeftHip',
    position: { x: leftHip.x * scale, y: (1 - leftHip.y) * scale, z: leftHip.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'LeftKnee',
    position: { x: leftKnee.x * scale, y: (1 - leftKnee.y) * scale, z: leftKnee.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'LeftAnkle',
    position: { x: leftAnkle.x * scale, y: (1 - leftAnkle.y) * scale, z: leftAnkle.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // Right Leg
  const rightKnee = getLandmark(POSE_LANDMARKS.RIGHT_KNEE);
  const rightAnkle = getLandmark(POSE_LANDMARKS.RIGHT_ANKLE);

  bones.push({
    name: 'RightHip',
    position: { x: rightHip.x * scale, y: (1 - rightHip.y) * scale, z: rightHip.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'RightKnee',
    position: { x: rightKnee.x * scale, y: (1 - rightKnee.y) * scale, z: rightKnee.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  bones.push({
    name: 'RightAnkle',
    position: { x: rightAnkle.x * scale, y: (1 - rightAnkle.y) * scale, z: rightAnkle.z * scale },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  return bones;
}

/**
 * Smooth pose landmarks using exponential moving average
 */
export function smoothPoseLandmarks(
  currentLandmarks: DetectedPose['landmarks'],
  previousLandmarks: DetectedPose['landmarks'] | null,
  smoothingFactor: number = 0.5
): DetectedPose['landmarks'] {
  if (!previousLandmarks) {
    return currentLandmarks;
  }

  return currentLandmarks.map((landmark, index) => {
    const prev = previousLandmarks[index];
    if (!prev) return landmark;

    return {
      x: prev.x * smoothingFactor + landmark.x * (1 - smoothingFactor),
      y: prev.y * smoothingFactor + landmark.y * (1 - smoothingFactor),
      z: prev.z * smoothingFactor + landmark.z * (1 - smoothingFactor),
      visibility: prev.visibility * smoothingFactor + landmark.visibility * (1 - smoothingFactor),
    };
  });
}

/**
 * Calculate confidence score from landmarks
 */
export function calculatePoseConfidence(landmarks: DetectedPose['landmarks']): number {
  if (landmarks.length === 0) return 0;

  const visibleLandmarks = landmarks.filter((l) => l.visibility > 0.5);
  return visibleLandmarks.length / landmarks.length;
}

/**
 * Detect if pose is valid (enough visible landmarks)
 */
export function isPoseValid(landmarks: DetectedPose['landmarks'], minConfidence: number = 0.5): boolean {
  return calculatePoseConfidence(landmarks) >= minConfidence;
}

/**
 * Normalize pose landmarks to [-1, 1] range
 */
export function normalizePoseLandmarks(
  landmarks: DetectedPose['landmarks'],
  imageWidth: number,
  imageHeight: number
): DetectedPose['landmarks'] {
  return landmarks.map((landmark) => ({
    x: (landmark.x / imageWidth) * 2 - 1,
    y: (landmark.y / imageHeight) * 2 - 1,
    z: landmark.z,
    visibility: landmark.visibility,
  }));
}

/**
 * Denormalize pose landmarks from [-1, 1] range
 */
export function denormalizePoseLandmarks(
  landmarks: DetectedPose['landmarks'],
  imageWidth: number,
  imageHeight: number
): DetectedPose['landmarks'] {
  return landmarks.map((landmark) => ({
    x: ((landmark.x + 1) / 2) * imageWidth,
    y: ((landmark.y + 1) / 2) * imageHeight,
    z: landmark.z,
    visibility: landmark.visibility,
  }));
}
