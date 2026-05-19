# 3D Model Format Support Guide

## Supported Formats

The 3D Poser Mobile app now supports multiple 3D model formats for maximum compatibility:

### ✅ OBJ (Wavefront Object)
- **Extension**: `.obj`
- **Type**: Text-based 3D format
- **Best For**: Static models, simple geometry
- **Features**:
  - Vertex positions (v)
  - Vertex normals (vn)
  - Texture coordinates (vt)
  - Face definitions (f)
- **Limitations**: No skeleton/animation data
- **File Size**: Medium (text format)

### ✅ FBX (Autodesk FBX)
- **Extension**: `.fbx`
- **Type**: Binary 3D format
- **Best For**: Rigged models, animations, complex scenes
- **Features**:
  - Full mesh geometry
  - Skeleton/bone data
  - Animation clips
  - Material information
- **Limitations**: Requires specialized parsing
- **File Size**: Compact (binary format)

### ✅ GLB (GL Transmission Format Binary)
- **Extension**: `.glb`
- **Type**: Binary 3D format
- **Best For**: Web-optimized models, production use
- **Features**:
  - Efficient binary encoding
  - Embedded textures
  - Animation support
  - Wide browser compatibility
- **Limitations**: Requires GLB export tools
- **File Size**: Very compact

### ✅ GLTF (GL Transmission Format)
- **Extension**: `.gltf`
- **Type**: JSON-based 3D format
- **Best For**: Web applications, easy inspection
- **Features**:
  - Human-readable JSON structure
  - Separate texture files
  - Full feature support
  - Industry standard
- **Limitations**: Larger file sizes than GLB
- **File Size**: Large (JSON format)

---

## Loading Models

### Method 1: Using the Upload Button

1. Click the **📤 Upload** button in the control bar
2. Select a model file from your computer
3. Supported formats: `.obj`, `.fbx`, `.glb`, `.gltf`
4. Wait for the model to load and process

### Method 2: Drag and Drop

1. Drag your model file from your file explorer
2. Drop it onto the application window
3. The model will automatically load

### Method 3: Using Samples

1. Click **Samples** button
2. Choose from pre-loaded sample models
3. Models load instantly

---

## Format Conversion Guide

### OBJ to GLB Conversion

**Why Convert?**
- GLB is more efficient for web use
- Smaller file sizes
- Better performance
- Preserves all geometry

**How to Convert:**
1. Load your OBJ file using the Upload button
2. The app automatically optimizes it
3. Use the export function to save as GLB

**Tools:**
- Babylon.js Sandbox: https://www.babylonjs-playground.com/
- Three.js Editor: https://threejs.org/editor/
- Blender: Free open-source 3D software

### FBX to GLB Conversion

**Why Convert?**
- GLB preserves skeleton and animation data
- Better web compatibility
- Smaller file sizes than FBX

**How to Convert:**
1. Load your FBX file using the Upload button
2. The app processes the model
3. Export as GLB for web use

**Tools:**
- Babylon.js Sandbox
- Three.js Editor
- Blender
- Autodesk FBX Converter

---

## Best Practices

### File Preparation

1. **Clean Your Models**
   - Remove unnecessary geometry
   - Delete hidden objects
   - Merge duplicate vertices
   - Optimize polygon count

2. **Scale and Units**
   - Set scale to 1 unit = 1 meter
   - Center model at origin (0, 0, 0)
   - Ensure consistent units across model

3. **Materials and Textures**
   - Use simple, efficient materials
   - Embed textures when possible
   - Use power-of-2 texture sizes (512, 1024, 2048)
   - Compress textures for web

4. **Rigging and Bones**
   - For FBX: Ensure skeleton is properly named
   - Use standard bone naming conventions
   - Verify bone weights are correct
   - Test animations before export

### Export Settings

#### Blender OBJ Export
```
✓ Apply Modifiers
✓ Include Normals
✓ Include UVs
✓ Include Materials
✓ Triangulate Faces
```

#### Blender FBX Export
```
✓ Mesh
✓ Armature
✓ Animation
✓ Deformed Mesh
✓ Apply Scalings: FBX Units
```

#### Blender GLB/GLTF Export
```
✓ Format: glTF Binary (.glb)
✓ Include Animations
✓ Include All Bone Influences
✓ Export Normals
✓ Compression: Enabled
```

---

## Troubleshooting

### Model Won't Load

**Problem**: Upload fails or model doesn't appear
**Solutions**:
- Check file format is supported
- Verify file is not corrupted
- Try converting to GLB format
- Check browser console for errors
- Ensure file size < 100 MB

### Model Appears Distorted

**Problem**: Model looks stretched, rotated, or scaled incorrectly
**Solutions**:
- Check model scale in original software
- Verify model is centered at origin
- Try rotating model 90 degrees
- Check for negative scaling values
- Re-export with correct settings

### Skeleton/Bones Not Working

**Problem**: Rigging features don't work with loaded model
**Solutions**:
- Use FBX format for rigged models
- Verify skeleton is properly named
- Check bone hierarchy is correct
- Ensure bones are properly weighted
- Re-export from 3D software

### Animation Not Playing

**Problem**: Animations don't play or appear broken
**Solutions**:
- Ensure FBX format is used
- Verify animations are included in export
- Check animation names are correct
- Use Blend feature to test animations
- Re-export with animation data

### Performance Issues

**Problem**: App runs slowly with loaded model
**Solutions**:
- Reduce polygon count
- Use GLB format instead of OBJ
- Compress textures
- Remove unnecessary materials
- Simplify geometry in 3D software

---

## Format Comparison

| Feature | OBJ | FBX | GLB | GLTF |
|---------|-----|-----|-----|------|
| **Geometry** | ✅ | ✅ | ✅ | ✅ |
| **Normals** | ✅ | ✅ | ✅ | ✅ |
| **Textures** | ⚠️ | ✅ | ✅ | ✅ |
| **Skeleton** | ❌ | ✅ | ✅ | ✅ |
| **Animation** | ❌ | ✅ | ✅ | ✅ |
| **Materials** | ⚠️ | ✅ | ✅ | ✅ |
| **File Size** | Large | Medium | Small | Medium |
| **Web Ready** | ⚠️ | ❌ | ✅ | ✅ |
| **Human Readable** | ✅ | ❌ | ❌ | ✅ |

---

## Advanced Topics

### Custom Material Setup

For OBJ files, materials can be defined in MTL files:

```mtl
newmtl Material_1
Ka 0.2 0.2 0.2
Kd 0.8 0.8 0.8
Ks 1.0 1.0 1.0
Ns 32.0
map_Kd texture.png
```

### Bone Naming Conventions

For FBX rigged models, use standard bone names:
- `Armature` - Root skeleton
- `Spine` - Central spine
- `Head` - Head bone
- `LeftShoulder`, `RightShoulder` - Shoulders
- `LeftArm`, `RightArm` - Upper arms
- `LeftForeArm`, `RightForeArm` - Forearms
- `LeftHand`, `RightHand` - Hands
- `LeftLeg`, `RightLeg` - Upper legs
- `LeftFoot`, `RightFoot` - Feet

### Texture Optimization

For web use, optimize textures:
1. Use PNG or WebP format
2. Compress to 50-75% quality
3. Use power-of-2 dimensions
4. Embed in GLB when possible
5. Maximum 2048x2048 resolution

---

## Resources

### 3D Software
- **Blender** (Free): https://www.blender.org/
- **Maya** (Paid): https://www.autodesk.com/products/maya/
- **3DS Max** (Paid): https://www.autodesk.com/products/3ds-max/

### Conversion Tools
- **Babylon.js Sandbox**: https://www.babylonjs-playground.com/
- **Three.js Editor**: https://threejs.org/editor/
- **Sketchfab**: https://sketchfab.com/

### Learning Resources
- **Blender Tutorials**: https://www.blender.org/support/tutorials/
- **Three.js Documentation**: https://threejs.org/docs/
- **Babylon.js Documentation**: https://doc.babylonjs.com/

---

## Support

For issues with specific file formats:
1. Check the troubleshooting section above
2. Try converting to GLB format
3. Verify file integrity
4. Check browser console for detailed errors
5. Report issues with file details

Enjoy working with your 3D models! 🎨
