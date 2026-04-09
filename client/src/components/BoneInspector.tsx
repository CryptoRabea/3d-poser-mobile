import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { BoneInfo } from "@/lib/boneSelector";
import { getBoneInfo, updateBoneTransform, getBoneHierarchy } from "@/lib/boneSelector";

interface BoneInspectorProps {
  selectedBone: any;
  currentModel: any;
  onBoneUpdate?: (boneName: string, transforms: any) => void;
}

export default function BoneInspector({
  selectedBone,
  currentModel,
  onBoneUpdate,
}: BoneInspectorProps) {
  const [boneInfo, setBoneInfo] = useState<BoneInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [hierarchy, setHierarchy] = useState<any[]>([]);

  useEffect(() => {
    if (selectedBone) {
      const info = getBoneInfo(selectedBone);
      setBoneInfo(info);
      setPosition(info.position);
      setRotation(info.rotation);
      setScale(info.scale);
    }
  }, [selectedBone]);

  useEffect(() => {
    if (currentModel) {
      const hier = getBoneHierarchy(currentModel);
      setHierarchy(hier);
    }
  }, [currentModel]);

  const handleUpdateTransform = () => {
    if (!selectedBone) {
      toast.error("No bone selected");
      return;
    }

    updateBoneTransform(selectedBone, position, rotation, scale);
    selectedBone.updateMatrixWorld(true);

    if (onBoneUpdate) {
      onBoneUpdate(selectedBone.name, { position, rotation, scale });
    }

    toast.success(`Updated bone: ${selectedBone.name}`);
    setEditMode(false);
  };

  const handleReset = () => {
    if (!selectedBone) return;
    setPosition(boneInfo?.position || { x: 0, y: 0, z: 0 });
    setRotation(boneInfo?.rotation || { x: 0, y: 0, z: 0 });
    setScale(boneInfo?.scale || { x: 1, y: 1, z: 1 });
  };

  if (!selectedBone || !boneInfo) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-gray-400 text-sm">
        <p>👆 Select a bone to inspect</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">🦴 Bone Inspector</h3>
        <p className="text-gray-300 text-sm mb-2">
          <strong>Name:</strong> {boneInfo.name}
        </p>
        <p className="text-gray-300 text-sm mb-2">
          <strong>Type:</strong> {boneInfo.type}
        </p>
        <p className="text-gray-300 text-sm">
          <strong>Children:</strong> {boneInfo.children}
        </p>
      </div>

      <Tabs defaultValue="transforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transforms">Transforms</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        {/* Transforms Tab */}
        <TabsContent value="transforms" className="space-y-4">
          {!editMode ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Position</p>
                <p className="text-white font-mono">
                  X: {boneInfo.position.x.toFixed(3)} Y: {boneInfo.position.y.toFixed(3)} Z:{" "}
                  {boneInfo.position.z.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Rotation (Radians)</p>
                <p className="text-white font-mono">
                  X: {boneInfo.rotation.x.toFixed(3)} Y: {boneInfo.rotation.y.toFixed(3)} Z:{" "}
                  {boneInfo.rotation.z.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Scale</p>
                <p className="text-white font-mono">
                  X: {boneInfo.scale.x.toFixed(3)} Y: {boneInfo.scale.y.toFixed(3)} Z:{" "}
                  {boneInfo.scale.z.toFixed(3)}
                </p>
              </div>
              <Button onClick={() => setEditMode(true)} className="w-full mt-4">
                Edit Transforms
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Position Inputs */}
              <div>
                <Label className="text-gray-300">Position</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-400">X</Label>
                    <Input
                      type="number"
                      value={position.x}
                      onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Y</Label>
                    <Input
                      type="number"
                      value={position.y}
                      onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Z</Label>
                    <Input
                      type="number"
                      value={position.z}
                      onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation Inputs */}
              <div>
                <Label className="text-gray-300">Rotation (Radians)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-400">X</Label>
                    <Input
                      type="number"
                      value={rotation.x}
                      onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Y</Label>
                    <Input
                      type="number"
                      value={rotation.y}
                      onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Z</Label>
                    <Input
                      type="number"
                      value={rotation.z}
                      onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) })}
                      step={0.01}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Scale Inputs */}
              <div>
                <Label className="text-gray-300">Scale</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-400">X</Label>
                    <Input
                      type="number"
                      value={scale.x}
                      onChange={(e) => setScale({ ...scale, x: parseFloat(e.target.value) })}
                      step={0.01}
                      min={0.1}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Y</Label>
                    <Input
                      type="number"
                      value={scale.y}
                      onChange={(e) => setScale({ ...scale, y: parseFloat(e.target.value) })}
                      step={0.01}
                      min={0.1}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Z</Label>
                    <Input
                      type="number"
                      value={scale.z}
                      onChange={(e) => setScale({ ...scale, z: parseFloat(e.target.value) })}
                      step={0.01}
                      min={0.1}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateTransform} className="flex-1">
                  Apply
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Reset
                </Button>
                <Button onClick={() => setEditMode(false)} variant="ghost" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="max-h-64 overflow-y-auto">
          <BoneHierarchyTree nodes={hierarchy} />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-2 text-sm">
          <div>
            <p className="text-gray-400">Visible:</p>
            <p className="text-white">{boneInfo.isVisible ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-gray-400">Children Count:</p>
            <p className="text-white">{boneInfo.children}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Recursive component for displaying bone hierarchy
function BoneHierarchyTree({ nodes, level = 0 }: { nodes: any[]; level?: number }) {
  return (
    <div className="space-y-1">
      {nodes.map((node, idx) => (
        <div key={idx} style={{ marginLeft: `${level * 12}px` }} className="text-xs">
          <div className="text-gray-300 py-1">
            🦴 {node.name}
            {node.children.length > 0 && ` (${node.children.length} children)`}
          </div>
          {node.children.length > 0 && <BoneHierarchyTree nodes={node.children} level={level + 1} />}
        </div>
      ))}
    </div>
  );
}
