import type * as THREE from 'three';
import {
  generateComparisonMetrics,
  generateComparisonReport,
  type ComparisonMetrics,
} from './boneComparisonAnalysis';

export interface BatchComparisonTask {
  id: string;
  bone1Index: number;
  bone1Name: string;
  bone2Index: number;
  bone2Name: string;
  conflictThreshold: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  metrics?: ComparisonMetrics;
  error?: string;
  timestamp: number;
}

export interface BatchComparisonJob {
  id: string;
  name: string;
  tasks: BatchComparisonTask[];
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  startTime: number;
  endTime?: number;
  status: 'idle' | 'running' | 'completed' | 'paused';
  overallProgress: number; // 0-100
}

export interface BatchComparisonSummary {
  jobId: string;
  jobName: string;
  totalBonePairs: number;
  totalConflicts: number;
  averageConflictDensity: number;
  severeBonePairs: number;
  problemAreas: Array<{
    bone1Name: string;
    bone2Name: string;
    conflictCount: number;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  recommendations: string[];
}

/**
 * Generate all possible bone pair combinations
 */
export function generateBonePairs(
  bones: THREE.Bone[],
  excludeIndices?: number[]
): Array<[number, string, number, string]> {
  const pairs: Array<[number, string, number, string]> = [];
  const exclude = new Set(excludeIndices || []);

  for (let i = 0; i < bones.length; i++) {
    if (exclude.has(i)) continue;

    for (let j = i + 1; j < bones.length; j++) {
      if (exclude.has(j)) continue;

      const bone1Name = bones[i].name || `Bone_${i}`;
      const bone2Name = bones[j].name || `Bone_${j}`;

      pairs.push([i, bone1Name, j, bone2Name]);
    }
  }

  return pairs;
}

/**
 * Create batch comparison job
 */
export function createBatchComparisonJob(
  jobName: string,
  bonePairs: Array<[number, string, number, string]>,
  conflictThreshold: number = 0.1
): BatchComparisonJob {
  const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tasks: BatchComparisonTask[] = bonePairs.map((pair, idx) => ({
    id: `task_${jobId}_${idx}`,
    bone1Index: pair[0],
    bone1Name: pair[1],
    bone2Index: pair[2],
    bone2Name: pair[3],
    conflictThreshold,
    status: 'pending',
    progress: 0,
    timestamp: Date.now(),
  }));

  return {
    id: jobId,
    name: jobName,
    tasks,
    totalTasks: tasks.length,
    completedTasks: 0,
    failedTasks: 0,
    startTime: Date.now(),
    status: 'idle',
    overallProgress: 0,
  };
}

/**
 * Process batch comparison job
 */
export async function processBatchComparisonJob(
  job: BatchComparisonJob,
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  onProgress?: (job: BatchComparisonJob) => void
): Promise<BatchComparisonJob> {
  const updatedJob: BatchComparisonJob = { ...job, status: 'running', startTime: Date.now() };

  for (let i = 0; i < updatedJob.tasks.length; i++) {
    const task = updatedJob.tasks[i];

    try {
      task.status = 'processing';
      task.progress = 0;

      // Generate comparison metrics
      const metrics = generateComparisonMetrics(
        geometry,
        skinIndex,
        skinWeight,
        task.bone1Index,
        task.bone1Name,
        task.bone2Index,
        task.bone2Name,
        task.conflictThreshold
      );

      task.metrics = metrics;
      task.status = 'completed';
      task.progress = 100;
      updatedJob.completedTasks++;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      updatedJob.failedTasks++;
    }

    // Update overall progress
    updatedJob.overallProgress = Math.round(
      ((updatedJob.completedTasks + updatedJob.failedTasks) / updatedJob.totalTasks) * 100
    );

    // Call progress callback
    onProgress?.(updatedJob);

    // Yield to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  updatedJob.status = 'completed' as const;
  updatedJob.endTime = Date.now();

  return updatedJob;
}

/**
 * Generate batch comparison summary
 */
export function generateBatchComparisonSummary(job: BatchComparisonJob): BatchComparisonSummary {
  const completedTasks = job.tasks.filter(t => t.status === 'completed' && t.metrics);
  const totalConflicts = completedTasks.reduce((sum, t) => sum + (t.metrics?.conflicts.length || 0), 0);
  const averageConflictDensity =
    completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + (t.metrics?.conflictDensity || 0), 0) /
        completedTasks.length
      : 0;

  // Find severe bone pairs
  const severeBonePairs = completedTasks
    .filter(t => t.metrics && t.metrics.severityDistribution.severe > 0)
    .map(t => ({
      bone1Name: t.bone1Name,
      bone2Name: t.bone2Name,
      conflictCount: t.metrics?.conflicts.length || 0,
      severity: 'severe' as const,
    }));

  // Find problem areas
  const problemAreas = completedTasks
    .filter(t => t.metrics && t.metrics.conflicts.length > 0)
    .map(t => ({
      bone1Name: t.bone1Name,
      bone2Name: t.bone2Name,
      conflictCount: t.metrics?.conflicts.length || 0,
      severity: (t.metrics?.severityDistribution.severe || 0) > 0
        ? ('severe' as const)
        : (t.metrics?.severityDistribution.moderate || 0) > 0
          ? ('moderate' as const)
          : ('mild' as const),
    }))
    .sort((a, b) => b.conflictCount - a.conflictCount)
    .slice(0, 10);

  // Generate recommendations
  const recommendations: string[] = [];

  if (severeBonePairs.length > 0) {
    recommendations.push(
      `⚠️ Found ${severeBonePairs.length} bone pairs with severe conflicts - prioritize fixing these`
    );
  }

  if (averageConflictDensity > 10) {
    recommendations.push(`High average conflict density (${averageConflictDensity.toFixed(1)}%) - review overall skinning`);
  }

  if (problemAreas.length > 5) {
    recommendations.push(`Multiple problem areas detected - consider re-rigging affected bone groups`);
  }

  if (completedTasks.length > 0 && completedTasks.every(t => !t.metrics?.conflicts.length)) {
    recommendations.push(`✅ All bone pairs have clean weights - skinning is well-distributed`);
  }

  return {
    jobId: job.id,
    jobName: job.name,
    totalBonePairs: completedTasks.length,
    totalConflicts,
    averageConflictDensity,
    severeBonePairs: severeBonePairs.length,
    problemAreas,
    recommendations,
  };
}

/**
 * Export batch results as JSON
 */
export function exportBatchAsJSON(job: BatchComparisonJob): string {
  const summary = generateBatchComparisonSummary(job);
  const data = {
    summary,
    tasks: job.tasks.map(t => ({
      bone1: t.bone1Name,
      bone2: t.bone2Name,
      status: t.status,
      metrics: t.metrics
        ? {
            totalVertices: t.metrics.totalVertices,
            conflicts: t.metrics.conflicts.length,
            conflictDensity: t.metrics.conflictDensity,
            overlapPercentage: t.metrics.overlap.overlapPercentage,
            severityDistribution: t.metrics.severityDistribution,
          }
        : null,
      error: t.error,
    })),
    generatedAt: new Date().toISOString(),
    duration: job.endTime ? job.endTime - job.startTime : 0,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Export batch results as CSV
 */
export function exportBatchAsCSV(job: BatchComparisonJob): string {
  const lines: string[] = [];

  // Header
  lines.push(
    'Bone 1,Bone 2,Status,Conflicts,Conflict Density (%),Overlap (%),Mild,Moderate,Severe,Error'
  );

  // Data rows
  for (const task of job.tasks) {
    if (task.status === 'completed' && task.metrics) {
      const metrics = task.metrics;
      lines.push(
        [
          `"${task.bone1Name}"`,
          `"${task.bone2Name}"`,
          task.status,
          metrics.conflicts.length,
          metrics.conflictDensity.toFixed(2),
          metrics.overlap.overlapPercentage.toFixed(2),
          metrics.severityDistribution.mild,
          metrics.severityDistribution.moderate,
          metrics.severityDistribution.severe,
          '""',
        ].join(',')
      );
    } else if (task.status === 'failed') {
      lines.push(
        [
          `"${task.bone1Name}"`,
          `"${task.bone2Name}"`,
          'failed',
          0,
          0,
          0,
          0,
          0,
          0,
          `"${task.error || 'Unknown error'}"`,
        ].join(',')
      );
    }
  }

  return lines.join('\n');
}

/**
 * Export batch results as detailed report
 */
export function exportBatchAsReport(job: BatchComparisonJob): string {
  const summary = generateBatchComparisonSummary(job);
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('BATCH BONE COMPARISON REPORT');
  lines.push('═══════════════════════════════════════════════════════════════\n');

  lines.push(`Job Name: ${summary.jobName}`);
  lines.push(`Job ID: ${summary.jobId}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Duration: ${job.endTime ? ((job.endTime - job.startTime) / 1000).toFixed(2) : 'N/A'}s\n`);

  lines.push('SUMMARY');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`Total Bone Pairs Analyzed: ${summary.totalBonePairs}`);
  lines.push(`Total Conflicts Found: ${summary.totalConflicts}`);
  lines.push(`Average Conflict Density: ${summary.averageConflictDensity.toFixed(2)}%`);
  lines.push(`Severe Bone Pairs: ${summary.severeBonePairs}\n`);

  if (summary.problemAreas.length > 0) {
    lines.push('TOP PROBLEM AREAS');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const area of summary.problemAreas) {
      const severityIcon =
        area.severity === 'severe' ? '🔴' : area.severity === 'moderate' ? '🟠' : '🟡';
      lines.push(
        `${severityIcon} ${area.bone1Name} ↔ ${area.bone2Name}: ${area.conflictCount} conflicts`
      );
    }
    lines.push('');
  }

  if (summary.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const rec of summary.recommendations) {
      lines.push(`• ${rec}`);
    }
    lines.push('');
  }

  lines.push('DETAILED RESULTS');
  lines.push('───────────────────────────────────────────────────────────────');
  for (const task of job.tasks) {
    if (task.status === 'completed' && task.metrics) {
      const metrics = task.metrics;
      lines.push(`\n${task.bone1Name} ↔ ${task.bone2Name}`);
      lines.push(`  Conflicts: ${metrics.conflicts.length}`);
      lines.push(`  Conflict Density: ${metrics.conflictDensity.toFixed(2)}%`);
      lines.push(`  Overlap: ${metrics.overlap.overlapPercentage.toFixed(1)}%`);
      lines.push(`  Severity: ${metrics.severityDistribution.mild} mild, ${metrics.severityDistribution.moderate} moderate, ${metrics.severityDistribution.severe} severe`);
    } else if (task.status === 'failed') {
      lines.push(`\n${task.bone1Name} ↔ ${task.bone2Name}`);
      lines.push(`  Status: FAILED`);
      lines.push(`  Error: ${task.error || 'Unknown error'}`);
    }
  }

  lines.push('\n═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
