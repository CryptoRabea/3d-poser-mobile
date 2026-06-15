import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  generateComparisonMetrics,
  findOverlappingBones,
  generateComparisonReport,
  type ComparisonMetrics,
  type InfluenceOverlap,
} from '@/lib/boneComparisonAnalysis';
import type * as THREE from 'three';

interface BoneComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mesh: THREE.Mesh | null;
  bones: THREE.Bone[];
  onConflictVisualization?: (conflicts: any[]) => void;
}

export function BoneComparisonPanel({
  isOpen,
  onClose,
  mesh,
  bones,
  onConflictVisualization,
}: BoneComparisonPanelProps) {
  const [bone1Index, setBone1Index] = useState(0);
  const [bone2Index, setBone2Index] = useState(1);
  const [conflictThreshold, setConflictThreshold] = useState(0.1);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [overlappingBones, setOverlappingBones] = useState<InfluenceOverlap[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState('');

  // Calculate comparison metrics when bones change
  useEffect(() => {
    if (!mesh || !mesh.geometry || bones.length < 2) return;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    const skinIndex = geometry.getAttribute('skinIndex')?.array as Float32Array | null;
    const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

    const bone1Name = bones[bone1Index]?.name || `Bone ${bone1Index}`;
    const bone2Name = bones[bone2Index]?.name || `Bone ${bone2Index}`;

    const newMetrics = generateComparisonMetrics(
      geometry,
      skinIndex,
      skinWeight,
      bone1Index,
      bone1Name,
      bone2Index,
      bone2Name,
      conflictThreshold
    );

    setMetrics(newMetrics);
    setReport(generateComparisonReport(newMetrics));

    // Notify parent of conflicts
    onConflictVisualization?.(newMetrics.conflicts);
  }, [mesh, bone1Index, bone2Index, conflictThreshold, bones]);

  // Find overlapping bones
  useEffect(() => {
    if (!mesh || !mesh.geometry) return;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    const skinIndex = geometry.getAttribute('skinIndex')?.array as Float32Array | null;
    const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

    const bone1Name = bones[bone1Index]?.name || `Bone ${bone1Index}`;
    const overlaps = findOverlappingBones(
      geometry,
      skinIndex,
      skinWeight,
      bone1Index,
      bone1Name,
      bones,
      10
    );

    setOverlappingBones(overlaps);
  }, [mesh, bone1Index, bones]);

  if (!mesh || bones.length < 2) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Bone Influence Comparison</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-400 py-8">
            At least 2 bones are required for comparison.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getSeverityIcon = (severity: number) => {
    if (severity < 0.3) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    if (severity < 0.6) return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  const getSeverityLabel = (severity: number) => {
    if (severity < 0.3) return 'Mild';
    if (severity < 0.6) return 'Moderate';
    return 'Severe';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Bone Influence Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bone Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bone 1</label>
              <Select value={bone1Index.toString()} onValueChange={(val) => setBone1Index(parseInt(val))}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Bone 2</label>
              <Select value={bone2Index.toString()} onValueChange={(val) => setBone2Index(parseInt(val))}>
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
          </div>

          {/* Conflict Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Conflict Threshold</label>
              <span className="text-xs text-slate-400">{Math.round(conflictThreshold * 100)}%</span>
            </div>
            <Slider
              value={[conflictThreshold]}
              onValueChange={(val) => setConflictThreshold(val[0])}
              min={0}
              max={0.5}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-slate-400">
              Vertices with both bones above this threshold are flagged as conflicts
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          {metrics && (
            <div className="grid grid-cols-2 gap-4">
              {/* Bone 1 Stats */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="text-sm font-semibold text-blue-400 mb-3">
                  {metrics.bone1.boneName}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Vertices:</span>
                    <span className="text-white font-semibold">{metrics.bone1.affectedVertices.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Weight:</span>
                    <span className="text-white font-semibold">{(metrics.bone1.maxWeight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Weight:</span>
                    <span className="text-white font-semibold">{(metrics.bone1.averageWeight * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              {/* Bone 2 Stats */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="text-sm font-semibold text-purple-400 mb-3">
                  {metrics.bone2.boneName}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Vertices:</span>
                    <span className="text-white font-semibold">{metrics.bone2.affectedVertices.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Weight:</span>
                    <span className="text-white font-semibold">{(metrics.bone2.maxWeight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Weight:</span>
                    <span className="text-white font-semibold">{(metrics.bone2.averageWeight * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Overlap Analysis */}
          {metrics && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="text-sm font-semibold text-green-400 mb-3">Overlap Analysis</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Overlapping Vertices:</span>
                  <div className="text-white font-semibold">{metrics.overlap.overlapVertices.length}</div>
                </div>
                <div>
                  <span className="text-slate-400">Overlap %:</span>
                  <div className="text-white font-semibold">{metrics.overlap.overlapPercentage.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-slate-400">Avg Conflict:</span>
                  <div className="text-white font-semibold">
                    {(metrics.overlap.averageConflictStrength * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Conflict Summary */}
          {metrics && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="text-sm font-semibold mb-3">Conflict Summary</div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Total Conflicts</div>
                  <div className="text-white font-semibold text-lg">{metrics.conflicts.length}</div>
                </div>
                <div className="bg-slate-700 rounded p-2">
                  <div className="text-slate-400">Conflict Density</div>
                  <div className="text-white font-semibold">{metrics.conflictDensity.toFixed(2)}%</div>
                </div>
                <div className="bg-yellow-900/30 rounded p-2 border border-yellow-700">
                  <div className="text-yellow-300">Mild</div>
                  <div className="text-white font-semibold">{metrics.severityDistribution.mild}</div>
                </div>
                <div className="bg-red-900/30 rounded p-2 border border-red-700">
                  <div className="text-red-300">Severe</div>
                  <div className="text-white font-semibold">{metrics.severityDistribution.severe}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Overlapping Bones */}
          {overlappingBones.length > 0 && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="text-sm font-semibold mb-3">Bones Overlapping with {metrics?.bone1.boneName}</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {overlappingBones.map((overlap, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700 rounded p-2 text-xs">
                    <span className="text-slate-300">{overlap.bone2Name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{overlap.overlapPercentage.toFixed(1)}%</span>
                      {getSeverityIcon(overlap.averageConflictStrength)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Report Button */}
          <Button
            onClick={() => setShowReport(!showReport)}
            className="w-full bg-slate-700 hover:bg-slate-600"
          >
            {showReport ? 'Hide Report' : 'Show Full Report'}
          </Button>

          {/* Report */}
          {showReport && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                {report}
              </pre>
            </Card>
          )}

          {/* Recommendations */}
          {metrics && metrics.conflicts.length > 0 && (
            <Card className="bg-amber-900/20 border-amber-700 p-4">
              <div className="text-sm font-semibold text-amber-300 mb-2">⚠️ Recommendations</div>
              <ul className="text-xs text-amber-100 space-y-1">
                {metrics.severityDistribution.severe > 0 && (
                  <li>• High severity conflicts detected - consider adjusting weights in your 3D software</li>
                )}
                {metrics.overlap.overlapPercentage > 50 && (
                  <li>• Significant overlap detected - bones may have conflicting influence</li>
                )}
                {metrics.conflictDensity > 10 && (
                  <li>• High conflict density - review skinning weights for this bone pair</li>
                )}
              </ul>
            </Card>
          )}

          {/* Success State */}
          {metrics && metrics.conflicts.length === 0 && (
            <Card className="bg-green-900/20 border-green-700 p-4">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">No conflicts detected - weights are well-distributed!</span>
              </div>
            </Card>
          )}

          {/* Close Button */}
          <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
