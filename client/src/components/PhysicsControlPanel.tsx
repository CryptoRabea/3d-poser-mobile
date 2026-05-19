import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { BoneTransform } from '@/lib/poseStorage';
import type { PhysicsConfig } from '@/lib/bonePhysics';

interface PhysicsControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSimulation: (bones: BoneTransform[]) => void;
  onStopSimulation: () => void;
  onUpdateConfig: (config: Partial<PhysicsConfig>) => void;
  onApplyImpulse: (boneName: string, impulse: { x: number; y: number; z: number }) => void;
  onSetWind: (strength: number, direction: { x: number; y: number; z: number }) => void;
  isSimulating?: boolean;
  currentBones?: BoneTransform[];
  isLoading?: boolean;
}

export function PhysicsControlPanel({
  isOpen,
  onClose,
  onStartSimulation,
  onStopSimulation,
  onUpdateConfig,
  onApplyImpulse,
  onSetWind,
  isSimulating = false,
  currentBones = [],
  isLoading = false,
}: PhysicsControlPanelProps) {
  const [gravity, setGravity] = useState(-9.81);
  const [damping, setDamping] = useState(0.3);
  const [windStrength, setWindStrength] = useState(0);
  const [windDirectionX, setWindDirectionX] = useState(1);
  const [selectedBone, setSelectedBone] = useState('Head');
  const [impulseStrength, setImpulseStrength] = useState(5);

  const handleStartSimulation = () => {
    if (currentBones.length > 0) {
      onStartSimulation(currentBones);
    }
  };

  const handleStopSimulation = () => {
    onStopSimulation();
  };

  const handleGravityChange = (value: number[]) => {
    const newGravity = value[0];
    setGravity(newGravity);
    onUpdateConfig({
      gravity: { x: 0, y: newGravity, z: 0 },
    });
  };

  const handleDampingChange = (value: number[]) => {
    const newDamping = value[0];
    setDamping(newDamping);
    onUpdateConfig({
      damping: newDamping,
      angularDamping: newDamping,
    });
  };

  const handleWindChange = (value: number[]) => {
    const newStrength = value[0];
    setWindStrength(newStrength);
    onSetWind(newStrength, { x: windDirectionX, y: 0, z: 0 });
  };

  const handleApplyImpulse = (direction: 'up' | 'down' | 'forward' | 'back') => {
    const impulseMap = {
      up: { x: 0, y: impulseStrength, z: 0 },
      down: { x: 0, y: -impulseStrength, z: 0 },
      forward: { x: 0, y: 0, z: impulseStrength },
      back: { x: 0, y: 0, z: -impulseStrength },
    };
    onApplyImpulse(selectedBone, impulseMap[direction]);
  };

  const boneNames = currentBones.map((b) => b.name);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>⚡</span>
            Physics Simulation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Simulation Controls */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStartSimulation}
              disabled={isSimulating || isLoading || currentBones.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              ▶ Start Ragdoll
            </Button>
            <Button
              onClick={handleStopSimulation}
              disabled={!isSimulating || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              ⏹ Stop
            </Button>
          </div>

          {/* Status */}
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-gray-300">
              {isSimulating ? '🟢 Physics Active' : '⏸️ Physics Inactive'}
            </p>
          </div>

          {/* Gravity Control */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">Gravity</label>
              <span className="text-sm text-red-400 font-semibold">{gravity.toFixed(1)} m/s²</span>
            </div>
            <Slider
              value={[gravity]}
              onValueChange={handleGravityChange}
              min={-20}
              max={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Strong</span>
              <span>Normal (-9.81)</span>
              <span>None</span>
            </div>
          </div>

          {/* Damping Control */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">Damping (Air Resistance)</label>
              <span className="text-sm text-red-400 font-semibold">{(damping * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[damping]}
              onValueChange={handleDampingChange}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Bouncy</span>
              <span>Normal</span>
              <span>Stiff</span>
            </div>
          </div>

          {/* Wind Control */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">Wind Force</label>
              <span className="text-sm text-red-400 font-semibold">{windStrength.toFixed(1)}</span>
            </div>
            <Slider
              value={[windStrength]}
              onValueChange={handleWindChange}
              min={0}
              max={20}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Breeze</span>
              <span>Storm</span>
            </div>
          </div>

          {/* Impulse Application */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Apply Impulse</label>

            {/* Bone Selection */}
            <select
              value={selectedBone}
              onChange={(e) => setSelectedBone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            >
              {boneNames.map((bone) => (
                <option key={bone} value={bone}>
                  {bone}
                </option>
              ))}
            </select>

            {/* Impulse Strength */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-400">Impulse Strength</label>
                <span className="text-xs text-gray-500">{impulseStrength.toFixed(1)}</span>
              </div>
              <Slider
                value={[impulseStrength]}
                onValueChange={(value) => setImpulseStrength(value[0])}
                min={1}
                max={20}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Direction Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() => handleApplyImpulse('up')}
                disabled={!isSimulating || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
              >
                ⬆️ Up
              </Button>
              <Button
                onClick={() => handleApplyImpulse('down')}
                disabled={!isSimulating || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
              >
                ⬇️ Down
              </Button>
              <Button
                onClick={() => handleApplyImpulse('forward')}
                disabled={!isSimulating || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
              >
                ➡️ Fwd
              </Button>
              <Button
                onClick={() => handleApplyImpulse('back')}
                disabled={!isSimulating || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
              >
                ⬅️ Back
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-red-400 font-semibold">💡 Physics Simulation:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Start simulation to enable ragdoll physics</li>
              <li>Adjust gravity, damping, and wind for different effects</li>
              <li>Apply impulses to push bones around</li>
              <li>Perfect for creating dynamic animations</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
