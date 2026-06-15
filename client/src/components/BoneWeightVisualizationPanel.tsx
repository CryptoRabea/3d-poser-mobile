import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Zap } from 'lucide-react';
import {
  calculateBoneWeights,
  getWeightStatistics,
  createHeatmapLegend,
  type WeightData,
  type HeatmapConfig,
} from '@/lib/boneWeightVisualization';
import type * as THREE from 'three';

interface BoneWeightVisualizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mesh: THREE.Mesh | null;
  bones: THREE.Bone[];
  onVisualizationChange?: (enabled: boolean, boneIndex: number) => void;
}

export function BoneWeightVisualizationPanel({
  isOpen,
  onClose,
  mesh,
  bones,
  onVisualizationChange,
}: BoneWeightVisualizationPanelProps) {
  const [selectedBoneIndex, setSelectedBoneIndex] = useState(0);
  const [visualizationEnabled, setVisualizationEnabled] = useState(false);
  const [colorScheme, setColorScheme] = useState<'heat' | 'viridis' | 'cool' | 'rainbow'>('heat');
  const [opacity, setOpacity] = useState(0.8);
  const [showLegend, setShowLegend] = useState(true);
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // Calculate weight data when bone selection changes
  useEffect(() => {
    if (!mesh || !mesh.geometry) return;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    const skinIndex = geometry.getAttribute('skinIndex')?.array as Float32Array | null;
    const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

    const weights = calculateBoneWeights(geometry, skinIndex, skinWeight, selectedBoneIndex);
    setWeightData(weights);

    const stats = getWeightStatistics(weights);
    setStatistics(stats);
  }, [mesh, selectedBoneIndex]);

  // Notify parent when visualization changes
  useEffect(() => {
    onVisualizationChange?.(visualizationEnabled, selectedBoneIndex);
  }, [visualizationEnabled, selectedBoneIndex, onVisualizationChange]);

  if (!mesh || bones.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Bone Weight Visualization</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-400 py-8">
            No mesh or bones available for visualization.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Bone Weight Visualization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visualization Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable Visualization</span>
            <Button
              onClick={() => setVisualizationEnabled(!visualizationEnabled)}
              className={`gap-2 ${
                visualizationEnabled
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {visualizationEnabled ? (
                <>
                  <Eye className="w-4 h-4" />
                  Enabled
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Disabled
                </>
              )}
            </Button>
          </div>

          {/* Bone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Bone</label>
            <Select value={selectedBoneIndex.toString()} onValueChange={(val) => setSelectedBoneIndex(parseInt(val))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                {bones.map((bone, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {bone.name || `Bone ${idx}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Scheme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Scheme</label>
            <Select value={colorScheme} onValueChange={(val: any) => setColorScheme(val)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                <SelectItem value="heat">Heat (Blue → Red)</SelectItem>
                <SelectItem value="viridis">Viridis (Purple → Yellow)</SelectItem>
                <SelectItem value="cool">Cool (Blue → White)</SelectItem>
                <SelectItem value="rainbow">Rainbow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opacity Control */}
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
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Legend Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Show Legend</span>
            <Button
              onClick={() => setShowLegend(!showLegend)}
              variant={showLegend ? 'default' : 'outline'}
              size="sm"
              className="w-20"
            >
              {showLegend ? 'Yes' : 'No'}
            </Button>
          </div>

          {/* Heatmap Legend */}
          {showLegend && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="text-xs font-medium text-slate-300 mb-2">Weight Distribution</div>
              <canvas
                ref={(canvas) => {
                  if (canvas && weightData) {
                    const legend = createHeatmapLegend(
                      canvas.parentElement?.clientWidth || 300,
                      30,
                      colorScheme,
                      `${Math.round(weightData.minWeight * 100)}%`,
                      `${Math.round(weightData.maxWeight * 100)}%`
                    );
                    canvas.parentElement?.replaceChild(legend, canvas);
                  }
                }}
                className="w-full"
              />
            </Card>
          )}

          {/* Statistics */}
          {statistics && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="text-xs font-medium text-slate-300 mb-3">Weight Statistics</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Affected Vertices:</span>
                  <div className="text-white font-semibold">
                    {statistics.affectedVertices} ({statistics.affectedPercentage.toFixed(1)}%)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Max Weight:</span>
                  <div className="text-white font-semibold">
                    {(statistics.distribution.max * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Average Weight:</span>
                  <div className="text-white font-semibold">
                    {(statistics.distribution.avg * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Std Deviation:</span>
                  <div className="text-white font-semibold">
                    {(statistics.distribution.stdDev * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Info */}
          <div className="bg-slate-800 border border-slate-700 rounded p-3 text-xs text-slate-300">
            <p className="mb-1">💡 <strong>Tip:</strong> The heatmap shows how much each bone influences the mesh vertices.</p>
            <p>Red areas = high influence, Blue areas = low influence</p>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
