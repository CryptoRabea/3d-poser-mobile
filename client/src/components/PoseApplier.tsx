import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useState } from "react";
import type { BoneTransform } from "@/lib/boneTransformApplier";
import { applyBoneTransforms, resetBoneTransforms, animatePoseTransition, blendPoses } from "@/lib/boneTransformApplier";

interface PoseApplierProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: any;
  poses: Array<{ id: string; name: string; bones: BoneTransform[] }>;
  onApplyPose: (pose: BoneTransform[]) => void;
}

export default function PoseApplier({
  isOpen,
  onClose,
  currentModel,
  poses,
  onApplyPose,
}: PoseApplierProps) {
  const [selectedPoseId, setSelectedPoseId] = useState<string>("");
  const [blendMode, setBlendMode] = useState(false);
  const [secondPoseId, setSecondPoseId] = useState<string>("");
  const [blendFactor, setBlendFactor] = useState(0.5);
  const [animationDuration, setAnimationDuration] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cancelAnimation, setCancelAnimation] = useState<(() => void) | null>(null);

  const modules = (window as any).__THREE__;
  if (!modules) {
    return null;
  }
  const { THREE } = modules;

  const handleApplyPose = () => {
    if (!selectedPoseId || !currentModel) {
      toast.error("Please select a pose and load a model first");
      return;
    }

    const pose = poses.find((p) => p.id === selectedPoseId);
    if (!pose) {
      toast.error("Pose not found");
      return;
    }

    if (blendMode && secondPoseId) {
      const secondPose = poses.find((p) => p.id === secondPoseId);
      if (!secondPose) {
        toast.error("Second pose not found");
        return;
      }

      // Apply blended pose
      const blended = blendPoses(pose.bones, secondPose.bones, blendFactor);
      applyBoneTransforms(currentModel, blended, THREE);
      onApplyPose(blended);
      toast.success(`Applied blended pose (${Math.round(blendFactor * 100)}%)`);
    } else {
      // Apply single pose
      applyBoneTransforms(currentModel, pose.bones, THREE);
      onApplyPose(pose.bones);
      toast.success(`Applied pose: ${pose.name}`);
    }
  };

  const handleAnimatePose = async () => {
    if (!selectedPoseId || !currentModel) {
      toast.error("Please select a pose and load a model first");
      return;
    }

    const pose = poses.find((p) => p.id === selectedPoseId);
    if (!pose) {
      toast.error("Pose not found");
      return;
    }

    setIsAnimating(true);

    // Get current pose as starting point
    const currentPose: BoneTransform[] = [];
    currentModel.traverse((child: any) => {
      if (child.isBone || child.type === "Bone") {
        currentPose.push({
          name: child.name,
          position: { x: child.position.x, y: child.position.y, z: child.position.z },
          rotation: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
          scale: { x: child.scale.x, y: child.scale.y, z: child.scale.z },
        });
      }
    });

    const cancel = animatePoseTransition(
      currentPose,
      pose.bones,
      animationDuration,
      (blendedPose) => {
        applyBoneTransforms(currentModel, blendedPose, THREE);
        onApplyPose(blendedPose);
      },
      () => {
        setIsAnimating(false);
        setCancelAnimation(null);
        toast.success(`Animated to pose: ${pose.name}`);
      }
    );
    setCancelAnimation(() => cancel);
  };

  const handleResetPose = () => {
    if (!currentModel) {
      toast.error("No model loaded");
      return;
    }

    if (cancelAnimation) {
      cancelAnimation();
      setCancelAnimation(null);
    }

    resetBoneTransforms(currentModel);
    onApplyPose([]);
    toast.success("Pose reset to default");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Pose</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pose Selection */}
          <div>
            <Label htmlFor="pose-select">Select Pose</Label>
            <select
              id="pose-select"
              value={selectedPoseId}
              onChange={(e) => setSelectedPoseId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">-- Choose a pose --</option>
              {poses.map((pose) => (
                <option key={pose.id} value={pose.id}>
                  {pose.name}
                </option>
              ))}
            </select>
          </div>

          {/* Blend Mode Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="blend-mode"
              checked={blendMode}
              onChange={(e) => setBlendMode(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="blend-mode" className="cursor-pointer">
              Blend with another pose
            </Label>
          </div>

          {/* Second Pose Selection (if blend mode enabled) */}
          {blendMode && (
            <div>
              <Label htmlFor="pose-select-2">Blend with Pose</Label>
              <select
                id="pose-select-2"
                value={secondPoseId}
                onChange={(e) => setSecondPoseId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">-- Choose a pose --</option>
                {poses.map((pose) => (
                  <option key={pose.id} value={pose.id}>
                    {pose.name}
                  </option>
                ))}
              </select>

              {/* Blend Factor Slider */}
              <div className="mt-3">
                <Label>Blend Factor: {Math.round(blendFactor * 100)}%</Label>
                <Slider
                  value={[blendFactor]}
                  onValueChange={(value) => setBlendFactor(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Animation Duration */}
          <div>
            <Label htmlFor="duration">Animation Duration (ms)</Label>
            <Input
              id="duration"
              type="number"
              value={animationDuration}
              onChange={(e) => setAnimationDuration(Math.max(100, parseInt(e.target.value) || 500))}
              min={100}
              max={5000}
              step={100}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleApplyPose}
              disabled={!selectedPoseId || isAnimating}
              className="flex-1"
            >
              Apply Pose
            </Button>
            <Button
              onClick={handleAnimatePose}
              disabled={!selectedPoseId || isAnimating}
              variant="outline"
              className="flex-1"
            >
              {isAnimating ? "Animating..." : "Animate"}
            </Button>
            <Button onClick={handleResetPose} variant="destructive" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
