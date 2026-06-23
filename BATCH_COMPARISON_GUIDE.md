# Batch Bone Comparison Workflow Guide

## Overview

The Batch Comparison workflow enables analyzing multiple bone pairs simultaneously to identify weight conflicts and overlaps across your entire rigged model. This is essential for comprehensive skinning quality assurance and team collaboration.

## Features

### 🚀 Batch Processing
- Compare multiple bone pairs in a single operation
- Real-time progress tracking with visual feedback
- Automatic conflict detection and severity classification
- Detailed summary statistics

### 📊 Export Functionality
- **JSON Export** - Structured data for programmatic analysis
- **CSV Export** - Spreadsheet-compatible format for analysis
- **Report Export** - Human-readable text report with recommendations

### 🎯 Intelligent Analysis
- Automatic problem area identification
- Severity-based sorting and prioritization
- Actionable recommendations based on results
- Comprehensive statistics and metrics

## Workflow

### Step 1: Open Batch Comparison Panel

1. Click the **📋 Batch** button in the control bar
2. The Batch Comparison panel opens

### Step 2: Configure Job

**Job Name**
- Enter a descriptive name for your batch job
- Example: "Humanoid_Rigging_QA", "Character_Skinning_Check"
- Used in exported filenames for organization

**Conflict Threshold**
- Controls sensitivity of conflict detection
- Range: 0-50%
- Default: 10%
- Lower values detect minor conflicts, higher values focus on major issues

### Step 3: Select Bones

**Individual Selection**
- Click checkboxes next to bone names
- Select specific bones to compare

**Quick Actions**
- **Select All** - Choose all bones at once
- **Clear** - Deselect all bones

**Selection Display**
- Shows number of selected bones
- Displays total comparison pairs that will be analyzed
- Example: "5 bones selected - 10 comparisons"

### Step 4: Start Batch Comparison

1. Click **Start Batch Comparison** button
2. Processing begins with real-time progress display
3. Each bone pair is analyzed sequentially
4. Progress bar shows overall completion percentage

### Step 5: Review Results

#### Progress Display
- Real-time progress bar (0-100%)
- Completed/Total task count
- Failed task count (if any)

#### Summary Statistics
- **Total Conflicts** - Sum of all conflicts found
- **Avg Density** - Average conflict density percentage
- **Severe Pairs** - Number of bone pairs with severe conflicts
- **Pair Count** - Total bone pairs analyzed

#### Top Problem Areas
- Lists most problematic bone pairs
- Sorted by conflict count (descending)
- Color-coded severity indicators:
  - 🔴 Red = Severe conflicts
  - 🟠 Orange = Moderate conflicts
  - 🟡 Yellow = Mild conflicts

#### Recommendations
- Automatically generated based on results
- Prioritized by severity
- Actionable guidance for improvements

### Step 6: Export Results

After completion, choose export format:

#### JSON Export
**Best for:** Programmatic analysis, data integration
```json
{
  "summary": {
    "jobId": "batch_...",
    "jobName": "Humanoid_QA",
    "totalBonePairs": 10,
    "totalConflicts": 45,
    "averageConflictDensity": 3.2,
    "severeBonePairs": 2
  },
  "tasks": [...],
  "generatedAt": "2026-06-15T...",
  "duration": 2500
}
```

#### CSV Export
**Best for:** Spreadsheet analysis, team collaboration
```
Bone 1,Bone 2,Status,Conflicts,Conflict Density (%),Overlap (%),Mild,Moderate,Severe
Spine,LeftArm,completed,5,2.3,15.2,3,2,0
Spine,RightArm,completed,3,1.8,12.1,2,1,0
...
```

#### Report Export
**Best for:** Documentation, presentations, email sharing
```
═══════════════════════════════════════════════════════════════
BATCH BONE COMPARISON REPORT
═══════════════════════════════════════════════════════════════

Job Name: Humanoid_QA
Generated: 2026-06-15T...
Duration: 2.5s

SUMMARY
───────────────────────────────────────────────────────────────
Total Bone Pairs Analyzed: 10
Total Conflicts Found: 45
Average Conflict Density: 3.2%
Severe Bone Pairs: 2

TOP PROBLEM AREAS
───────────────────────────────────────────────────────────────
🔴 Spine ↔ LeftArm: 5 conflicts
🟠 Spine ↔ RightArm: 3 conflicts
...
```

## Best Practices

### Job Naming
- Use descriptive names with context
- Include character name and purpose
- Example: "MainCharacter_Rigging_v2_QA"

### Bone Selection
- Start with all bones for comprehensive analysis
- Later, focus on specific bone groups (arms, legs, spine)
- Compare adjacent bones for deformation quality

### Threshold Adjustment
- **Initial Pass**: Use default (10%) for overview
- **Detailed Analysis**: Lower to 5% for sensitive areas
- **Quick Check**: Raise to 15-20% for major issues only

### Export Strategy
- **JSON** for data pipelines and automation
- **CSV** for team spreadsheet analysis
- **Report** for documentation and sharing

### Iterative Workflow
1. Run initial batch with all bones
2. Identify problem areas from report
3. Export results for team review
4. Make corrections in 3D software
5. Re-import and run batch again
6. Compare reports to verify improvements

## Understanding Results

### Conflict Density
- **< 2%**: Excellent - minimal conflicts
- **2-5%**: Good - acceptable for most uses
- **5-10%**: Fair - review problem areas
- **> 10%**: Poor - significant issues need fixing

### Severity Distribution
- **Mild (0-30%)**: Minor weight overlap, usually acceptable
- **Moderate (30-60%)**: Noticeable conflicts, should be addressed
- **Severe (60-100%)**: Major issues, must be corrected

### Problem Area Priority
1. Fix severe conflicts first (red 🔴)
2. Then moderate conflicts (orange 🟠)
3. Finally mild conflicts (yellow 🟡)

## Common Scenarios

### Scenario 1: Initial Rigging QA
1. Select all bones
2. Run batch with default threshold
3. Export report for documentation
4. Share with team for review

### Scenario 2: Focused Problem Solving
1. Select specific bone groups (e.g., arms)
2. Lower threshold to 5%
3. Identify exact problem pairs
4. Make targeted corrections

### Scenario 3: Before Delivery
1. Select all bones
2. Run batch with 5% threshold
3. Ensure no severe conflicts
4. Export final report as deliverable

## Troubleshooting

### No Conflicts Detected
**Possible Causes:**
- Threshold too high
- Model has clean weights
- Insufficient bone pairs selected

**Solution:**
- Lower conflict threshold
- Select more bones
- Check model format (GLB/GLTF required)

### Processing Stalls
**Possible Causes:**
- Large model with many bones
- Browser memory limitation
- Network timeout

**Solution:**
- Try fewer bones
- Close other browser tabs
- Refresh and try again

### Export File Not Downloading
**Possible Causes:**
- Browser popup blocker
- Insufficient disk space
- File too large

**Solution:**
- Check browser permissions
- Verify disk space
- Try different export format

## Performance

| Metric | Value |
|--------|-------|
| Typical Processing Speed | 1-5 pairs/second |
| 10 Bone Pairs | ~2-10 seconds |
| 20 Bone Pairs | ~4-20 seconds |
| Memory Usage | ~50-100MB per job |
| Export File Size | 50-500KB depending on format |

## API Reference

### BatchComparisonEngine Module

```typescript
// Create batch job
createBatchComparisonJob(
  jobName: string,
  bonePairs: Array<[number, string, number, string]>,
  conflictThreshold?: number
): BatchComparisonJob

// Process batch
processBatchComparisonJob(
  job: BatchComparisonJob,
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array | null,
  skinWeight: Float32Array | null,
  onProgress?: (job: BatchComparisonJob) => void
): Promise<BatchComparisonJob>

// Generate summary
generateBatchComparisonSummary(job: BatchComparisonJob): BatchComparisonSummary

// Export functions
exportBatchAsJSON(job: BatchComparisonJob): string
exportBatchAsCSV(job: BatchComparisonJob): string
exportBatchAsReport(job: BatchComparisonJob): string

// Helper
downloadFile(content: string, filename: string, mimeType?: string): void
```

## Integration with Other Tools

### Bone Weight Visualization
- Use after batch to visualize specific problem bones
- Compare individual bone influences

### Single Pair Comparison
- Use for detailed analysis of problem pairs
- Adjust threshold and settings

### Physics Simulation
- Test rigging with ragdoll dynamics
- Verify weights during deformation

## Related Features

- **Bone Comparison** - Single pair detailed analysis
- **Weight Visualization** - Individual bone influence heatmaps
- **Auto-Rig** - Automatic bone hierarchy creation
- **Physics Simulation** - Test rigging with dynamics

## Future Enhancements

- [ ] Batch scheduling for large jobs
- [ ] Incremental processing with pause/resume
- [ ] Custom export templates
- [ ] Comparison history and trending
- [ ] Automated correction suggestions
- [ ] Team collaboration features
- [ ] Cloud storage integration

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify model format (GLB/GLTF)
3. Try with fewer bones
4. Check browser console for errors
5. Try different export format
