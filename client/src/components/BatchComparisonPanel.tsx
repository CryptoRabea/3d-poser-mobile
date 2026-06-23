import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle, Download, Play, Pause, RotateCcw } from 'lucide-react';
import {
  createBatchComparisonJob,
  generateBonePairs,
  processBatchComparisonJob,
  generateBatchComparisonSummary,
  exportBatchAsJSON,
  exportBatchAsCSV,
  exportBatchAsReport,
  downloadFile,
  type BatchComparisonJob,
} from '@/lib/batchComparisonEngine';
import type * as THREE from 'three';

interface BatchComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mesh: THREE.Mesh | null;
  bones: THREE.Bone[];
}

export function BatchComparisonPanel({
  isOpen,
  onClose,
  mesh,
  bones,
}: BatchComparisonPanelProps) {
  const [jobName, setJobName] = useState('Batch Comparison');
  const [conflictThreshold, setConflictThreshold] = useState(0.1);
  const [selectedBones, setSelectedBones] = useState<Set<number>>(new Set());
  const [job, setJob] = useState<BatchComparisonJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle bone selection
  const toggleBone = (index: number) => {
    const newSelected = new Set(selectedBones);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBones(newSelected);
  };

  // Select all bones
  const selectAllBones = () => {
    const all = new Set(bones.map((_, idx) => idx));
    setSelectedBones(all);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedBones(new Set());
  };

  // Start batch comparison
  const startBatchComparison = async () => {
    if (!mesh || !mesh.geometry || selectedBones.size < 2) return;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    const skinIndex = geometry.getAttribute('skinIndex')?.array as Float32Array | null;
    const skinWeight = geometry.getAttribute('skinWeight')?.array as Float32Array | null;

    // Generate bone pairs from selected bones
    const bonePairs = generateBonePairs(bones, Array.from(selectedBones).map(i => (i >= 0 ? -1 : i)));
    const selectedPairs = bonePairs.filter(
      pair => selectedBones.has(pair[0]) && selectedBones.has(pair[2])
    );

    if (selectedPairs.length === 0) return;

    // Create batch job
    const newJob = createBatchComparisonJob(jobName, selectedPairs, conflictThreshold);
    setJob(newJob);
    setIsProcessing(true);

    try {
      // Process batch
      const completedJob = await processBatchComparisonJob(
        newJob,
        geometry,
        skinIndex,
        skinWeight,
        (updatedJob) => {
          setJob(updatedJob);
        }
      );

      setJob(completedJob);
      setIsProcessing(false);
    } catch (error) {
      console.error('Batch comparison error:', error);
      setIsProcessing(false);
    }
  };

  // Reset batch
  const resetBatch = () => {
    setJob(null);
    setIsProcessing(false);
  };

  if (!mesh || bones.length < 2) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Batch Bone Comparison</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-400 py-8">
            At least 2 bones are required for batch comparison.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const summary = job ? generateBatchComparisonSummary(job) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Bone Comparison</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!job ? (
            <>
              {/* Job Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Name</label>
                  <Input
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="Enter job name"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

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
                </div>
              </div>

              {/* Bone Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Bones to Compare</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={selectAllBones}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={clearSelection}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-800 rounded p-3 max-h-48 overflow-y-auto space-y-2">
                  {bones.map((bone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedBones.has(idx)}
                        onCheckedChange={() => toggleBone(idx)}
                        className="border-slate-600"
                      />
                      <span className="text-sm text-slate-300">{bone.name || `Bone ${idx}`}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  {selectedBones.size} bones selected
                  {selectedBones.size >= 2 &&
                    ` - ${(selectedBones.size * (selectedBones.size - 1)) / 2} comparisons`}
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startBatchComparison}
                disabled={selectedBones.size < 2}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Batch Comparison
              </Button>
            </>
          ) : (
            <>
              {/* Progress Display */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Progress</span>
                    <span className="text-sm text-slate-400">{job.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${job.overallProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    {job.completedTasks}/{job.totalTasks} completed
                    {job.failedTasks > 0 && ` • ${job.failedTasks} failed`}
                  </div>
                </div>
              </Card>

              {/* Summary */}
              {summary && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="text-sm font-semibold mb-3">Summary</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-700 rounded p-2">
                      <div className="text-slate-400">Total Conflicts</div>
                      <div className="text-white font-semibold text-lg">{summary.totalConflicts}</div>
                    </div>
                    <div className="bg-slate-700 rounded p-2">
                      <div className="text-slate-400">Avg Density</div>
                      <div className="text-white font-semibold">
                        {summary.averageConflictDensity.toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-red-900/30 rounded p-2 border border-red-700">
                      <div className="text-red-300">Severe Pairs</div>
                      <div className="text-white font-semibold">{summary.severeBonePairs}</div>
                    </div>
                    <div className="bg-slate-700 rounded p-2">
                      <div className="text-slate-400">Pair Count</div>
                      <div className="text-white font-semibold">{summary.totalBonePairs}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Problem Areas */}
              {summary && summary.problemAreas.length > 0 && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="text-sm font-semibold mb-3">Top Problem Areas</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {summary.problemAreas.map((area, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-700 rounded p-2 text-xs">
                        <span className="text-slate-300">
                          {area.bone1Name} ↔ {area.bone2Name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{area.conflictCount}</span>
                          {area.severity === 'severe' && <span className="text-red-400">🔴</span>}
                          {area.severity === 'moderate' && <span className="text-orange-400">🟠</span>}
                          {area.severity === 'mild' && <span className="text-yellow-400">🟡</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recommendations */}
              {summary && summary.recommendations.length > 0 && (
                <Card className="bg-amber-900/20 border-amber-700 p-4">
                  <div className="text-sm font-semibold text-amber-300 mb-2">Recommendations</div>
                  <ul className="text-xs text-amber-100 space-y-1">
                    {summary.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Export Options */}
              {job.status === 'completed' && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="text-sm font-semibold mb-3">Export Results</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => {
                        const json = exportBatchAsJSON(job);
                        downloadFile(
                          json,
                          `batch_comparison_${job.id}.json`,
                          'application/json'
                        );
                      }}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      JSON
                    </Button>
                    <Button
                      onClick={() => {
                        const csv = exportBatchAsCSV(job);
                        downloadFile(
                          csv,
                          `batch_comparison_${job.id}.csv`,
                          'text/csv'
                        );
                      }}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      CSV
                    </Button>
                    <Button
                      onClick={() => {
                        const report = exportBatchAsReport(job);
                        downloadFile(
                          report,
                          `batch_comparison_${job.id}.txt`,
                          'text/plain'
                        );
                      }}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={resetBatch}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Comparison
                </Button>
                <Button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600">
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
