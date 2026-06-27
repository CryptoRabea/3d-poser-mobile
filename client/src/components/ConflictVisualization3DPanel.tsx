import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Zap } from 'lucide-react';
import * as THREE from 'three';
import {
  VisualizationMode,
  createConflictVisualizationMesh,
  getSeverityColor,
  getSeverityLabel,
} from '@/lib/conflictVisualizationShader';
import { extractConflictingVertices } from '@/lib/conflictHighlighting';
import type { ComparisonMetrics } from '@/lib/boneComparisonAnalysis';

interface ConflictVisualization3DPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scene: THREE.Scene | null;
  mesh: THREE.Mesh | null;
  metrics: ComparisonMetrics | null;
}

export function ConflictVisualization3DPanel({
  isOpen,
  onClose,
  scene,
  mesh,
  metrics,
}: ConflictVisualization3DPanelProps) {
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    VisualizationMode.SOLID
  );
  const [opacity, setOpacity] = useState(0.7);
  const [isVisible, setIsVisible] = useState(true);
  const [conflictVisualization, setConflictVisualization] = useState<THREE.Object3D | null>(null);
  const [conflictCount, setConflictCount] = useState(0);
  const [severityStats, setSeverityStats] = useState({
    mild: 0,
    moderate: 0,
    severe: 0,
  });

  // Initialize visualization
  useEffect(() => {
    if (!isOpen || !scene || !mesh || !mesh.geometry || !metrics) {
      return;
    }

    try {
      // Extract conflicting vertices
      const conflictVertices = extractConflictingVertices(metrics, mesh.geometry);

      if (conflictVertices.size === 0) {
        setConflictCount(0);
        return;
      }

      // Create visualization mesh
      const vizMesh = createConflictVisualizationMesh(
        mesh.geometry,
        conflictVertices,
        visualizationMode
      );

      // Position at same location as original mesh
      vizMesh.position.copy(mesh.position);
      vizMesh.quaternion.copy(mesh.quaternion);
      vizMesh.scale.copy(mesh.scale);

      // Add to scene
      scene.add(vizMesh);
      setConflictVisualization(vizMesh);

      // Calculate statistics
      setConflictCount(conflictVertices.size);

      // Count severity distribution
      let mildCount = 0,
        moderateCount = 0,
        severeCount = 0;

      for (const [_, count] of conflictVertices.entries()) {
        if (count <= 2) mildCount++;
        else if (count <= 5) moderateCount++;
        else severeCount++;
      }

      setSeverityStats({ mild: mildCount, moderate: moderateCount, severe: severeCount });

      // Cleanup function
      return () => {
        if (vizMesh.parent) {
          vizMesh.parent.remove(vizMesh);
        }
      };
    } catch (error) {
      console.error('Error creating conflict visualization:', error);
    }
  }, [isOpen, scene, mesh, metrics, visualizationMode]);

  // Update opacity
  useEffect(() => {
    if (conflictVisualization && conflictVisualization instanceof THREE.Mesh) {
      const material = conflictVisualization.material as THREE.Material;
      if ('opacity' in material) {
        (material as any).opacity = opacity;
        (material as any).needsUpdate = true;
      }
    }
  }, [opacity, conflictVisualization]);

  // Toggle visibility
  useEffect(() => {
    if (conflictVisualization) {
      conflictVisualization.visible = isVisible;
    }
  }, [isVisible, conflictVisualization]);

  const handleModeChange = (mode: string) => {
    setVisualizationMode(mode as VisualizationMode);
  };

  const handleClearVisualization = () => {
    if (conflictVisualization && conflictVisualization.parent) {
      conflictVisualization.parent.remove(conflictVisualization);
      setConflictVisualization(null);
    }
  };

  if (!mesh || !metrics) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>3D Conflict Visualization</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-400 py-8">
            Load a model and run comparison to visualize conflicts.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>3D Conflict Visualization</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visualization Stats */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-sm font-semibold mb-3">Conflict Statistics</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-700 rounded p-2">
                <div className="text-slate-400">Conflicting Vertices</div>
                <div className="text-white font-semibold text-lg">{conflictCount}</div>
              </div>
              <div className="bg-slate-700 rounded p-2">
                <div className="text-slate-400">Total Conflicts</div>
                <div className="text-white font-semibold text-lg">{metrics.conflicts.length}</div>
              </div>
              <div className="bg-yellow-900/30 rounded p-2 border border-yellow-700">
                <div className="text-yellow-300">Mild</div>
                <div className="text-white font-semibold">{severityStats.mild}</div>
              </div>
              <div className="bg-orange-900/30 rounded p-2 border border-orange-700">
                <div className="text-orange-300">Moderate</div>
                <div className="text-white font-semibold">{severityStats.moderate}</div>
              </div>
              <div className="bg-red-900/30 rounded p-2 border border-red-700">
                <div className="text-red-300">Severe</div>
                <div className="text-white font-semibold">{severityStats.severe}</div>
              </div>
              <div className="bg-slate-700 rounded p-2">
                <div className="text-slate-400">Conflict Density</div>
                <div className="text-white font-semibold">{metrics.conflictDensity.toFixed(2)}%</div>
              </div>
            </div>
          </Card>

          {/* Visualization Controls */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-sm font-semibold mb-4">Visualization Controls</div>

            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Visualization Mode</label>
                <Select value={visualizationMode} onValueChange={handleModeChange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value={VisualizationMode.SOLID}>Solid Mesh</SelectItem>
                    <SelectItem value={VisualizationMode.WIREFRAME}>Wireframe</SelectItem>
                    <SelectItem value={VisualizationMode.POINTS}>Point Cloud</SelectItem>
                    <SelectItem value={VisualizationMode.OVERLAY}>Overlay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Opacity</label>
                  <span className="text-xs text-slate-400">{Math.round(opacity * 100)}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={(val) => setOpacity(val[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between bg-slate-700 rounded p-3">
                <span className="text-sm font-medium">Visualization Visible</span>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className={`p-2 rounded transition-colors ${
                    isVisible
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                  }`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Severity Legend */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="text-sm font-semibold mb-3">Severity Legend</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-500"></div>
                <span className="text-slate-300">No Conflict</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-400"></div>
                <span className="text-slate-300">Mild (1-2 conflicts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500"></div>
                <span className="text-slate-300">Moderate (3-5 conflicts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500"></div>
                <span className="text-slate-300">Severe (6+ conflicts)</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleClearVisualization}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Clear Visualization
            </Button>
            <Button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600">
              Close
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-700 rounded p-3 text-xs text-blue-200">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p>
              Use different visualization modes to analyze conflicts. Solid mesh shows overall
              distribution, wireframe highlights specific vertices, and point cloud emphasizes
              conflict locations.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
