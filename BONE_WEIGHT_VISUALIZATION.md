# Bone Weight Visualization Guide

## Overview

The Bone Weight Visualization system provides real-time heatmap overlays that display how much influence each bone has on mesh vertices. This is essential for rigging feedback and skinning quality assessment.

## Features

### 🎨 Multiple Color Schemes
- **Heat**: Blue → Cyan → Green → Yellow → Red (classic thermal)
- **Viridis**: Purple → Green → Yellow (perceptually uniform)
- **Cool**: Blue → Cyan → White (cool tones)
- **Rainbow**: Full spectrum visualization

### 📊 Real-Time Statistics
- **Affected Vertices**: Number and percentage of vertices influenced by the bone
- **Weight Distribution**: Min, max, average, median, and standard deviation
- **Visual Feedback**: Heatmap legend with min/max weight labels

### 🎛️ Interactive Controls
- Bone selection dropdown
- Opacity slider (0-100%)
- Color scheme selector
- Legend toggle
- Enable/disable visualization

## Usage

### Opening the Panel

1. Click the **🎨 Weights** button in the control bar
2. The Bone Weight Visualization panel opens

### Selecting a Bone

1. Use the **Select Bone** dropdown
2. The heatmap updates to show the selected bone's influence
3. Statistics automatically recalculate

### Adjusting Visualization

**Color Scheme**: Choose from Heat, Viridis, Cool, or Rainbow
- Different schemes suit different preferences
- Viridis is recommended for accessibility

**Opacity**: Adjust from 0% (transparent) to 100% (opaque)
- Lower opacity: See mesh underneath
- Higher opacity: See weight influence clearly

**Legend**: Toggle to show/hide the weight distribution scale

## Understanding Weight Values

### Color Interpretation

| Color | Weight | Meaning |
|-------|--------|---------|
| Blue | 0% | No influence |
| Cyan | 25% | Light influence |
| Green | 50% | Medium influence |
| Yellow | 75% | Strong influence |
| Red | 100% | Full influence |

### Statistics Explained

**Affected Vertices**: 
- Shows how many vertices are influenced by this bone
- Higher percentage = wider influence area
- Lower percentage = localized influence

**Max Weight**:
- Peak influence value
- 100% = bone fully controls those vertices

**Average Weight**:
- Mean influence across affected vertices
- Indicates overall strength of influence

**Std Deviation**:
- Spread of weight values
- High = uneven influence (potential artifacts)
- Low = smooth, consistent influence

## Best Practices

### Quality Assessment

✅ **Good Skinning**:
- Smooth color gradients (no sharp transitions)
- Appropriate bone influence areas
- Minimal weight values < 5%
- Even distribution (low std deviation)

❌ **Problem Areas**:
- Sharp color boundaries (weight discontinuities)
- Unexpected influence areas
- Extreme weight values (0% or 100%)
- High standard deviation

### Workflow

1. **Load Model**: Import your rigged model
2. **Select Bone**: Choose a bone to inspect
3. **Enable Visualization**: Toggle visualization on
4. **Analyze**: Check for smooth gradients and appropriate influence
5. **Adjust**: If needed, paint weights in your 3D modeling software
6. **Re-import**: Reload the model to verify fixes

### Tips

- Use **Viridis** for presentations (colorblind-friendly)
- Use **Heat** for detailed inspection
- Lower opacity to see mesh geometry underneath
- Compare adjacent bones to spot weight conflicts
- Check high-influence areas for deformation artifacts

## Technical Details

### Weight Calculation

Weights are extracted from the model's skin binding data:
- Each vertex can be influenced by up to 4 bones
- Weights are normalized (sum to 1.0)
- Visualization shows per-bone influence on each vertex

### Heatmap Generation

- Procedurally generated 256-pixel gradient texture
- Applied as vertex colors or shader material
- Real-time updates as bone selection changes
- No performance impact on 3D rendering

### Supported Formats

- **GLB/GLTF**: Full support with skin bindings
- **FBX**: Requires skin data in file
- **OBJ**: Limited support (no skin data)

## Troubleshooting

### No Visualization Appears

**Problem**: Heatmap doesn't show
- **Solution**: Ensure model has skin bindings (GLB/GLTF with proper rigging)

### Visualization is Uniform Color

**Problem**: All vertices show same color
- **Solution**: Bone may have no influence; select a different bone

### Statistics Show Zero

**Problem**: "Affected Vertices: 0"
- **Solution**: Bone has no weight influence; check model rigging

### Colors Look Wrong

**Problem**: Heatmap colors don't match expectations
- **Solution**: Try different color scheme; verify weight values in model

## API Reference

### BoneWeightVisualization Module

```typescript
// Calculate weights for a bone
calculateBoneWeights(
  geometry: THREE.BufferGeometry,
  skinIndex: Float32Array,
  skinWeight: Float32Array,
  boneIndex: number
): WeightData

// Get color for weight value
getHeatmapColor(
  value: number,
  min: number,
  max: number,
  scheme: 'heat' | 'viridis' | 'cool' | 'rainbow'
): THREE.Color

// Create heatmap texture
createHeatmapTexture(
  width?: number,
  height?: number,
  scheme?: string
): THREE.Texture

// Get statistics
getWeightStatistics(weightData: WeightData): {
  affectedVertices: number
  affectedPercentage: number
  distribution: { min, max, avg, median, stdDev }
}
```

### Component Props

```typescript
interface BoneWeightVisualizationPanelProps {
  isOpen: boolean
  onClose: () => void
  mesh: THREE.Mesh | null
  bones: THREE.Bone[]
  onVisualizationChange?: (enabled: boolean, boneIndex: number) => void
}
```

## Performance

- **Lightweight**: Minimal GPU/CPU overhead
- **Real-time**: Instant updates on bone selection
- **Scalable**: Works with models up to 100k+ vertices
- **No Cache**: Recalculates on each bone change (< 1ms)

## Future Enhancements

- [ ] Weight painting tool (adjust weights interactively)
- [ ] Comparison view (side-by-side bone influence)
- [ ] Export weight maps as textures
- [ ] Automated weight analysis and suggestions
- [ ] Bone influence overlap detection
- [ ] Weight smoothing recommendations

## Related Features

- **Auto-Rig**: Automatically create bone hierarchies
- **Physics Simulation**: Test rigging with ragdoll dynamics
- **Animation Blending**: Smooth transitions between animations
- **Pose Detection**: AI-powered pose capture

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify model format (GLB/GLTF recommended)
3. Ensure skin bindings are present in model
4. Try different color schemes
