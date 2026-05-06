# Custom Model Upload Guide - C.R.G 3D Poser

## Overview

The C.R.G 3D Poser app now supports uploading your own custom 3D models in **GLB** and **FBX** formats. This allows you to work with your own character models, rigs, and animations.

## Supported Formats

### ✅ GLB (Recommended)
- **Format**: Binary glTF (GL Transmission Format)
- **Extension**: `.glb`
- **Advantages**: 
  - Smaller file size
  - Faster loading
  - Better compression
  - Full animation support
- **Best For**: Production models, optimized assets

### ✅ GLTF
- **Format**: Text-based glTF
- **Extension**: `.gltf` (with `.bin` and texture files)
- **Advantages**: 
  - Human-readable format
  - Easy to debug
  - Modular structure
- **Best For**: Development, debugging

### ⚠️ FBX (Requires Conversion)
- **Format**: Autodesk FBX
- **Extension**: `.fbx`
- **Status**: Supported but requires conversion to GLB
- **Why**: FBX parsing is complex; GLB is the standard for web
- **Solution**: Convert FBX to GLB before uploading (see conversion methods below)

## How to Upload a Model

### Step 1: Prepare Your Model
Ensure your model is in one of the supported formats:
- `.glb` - Ready to upload (recommended)
- `.gltf` - Ready to upload
- `.fbx` - Convert to GLB first (see conversion methods)

### Step 2: Open Upload Dialog
1. Click the **📤 Upload** button in the top control bar
2. A dialog will appear with upload options

### Step 3: Upload Your Model
Choose one of two methods:

**Method A: Drag and Drop**
- Drag your `.glb` or `.gltf` file onto the upload area
- The file will automatically load

**Method B: File Browser**
- Click the **Select File** button
- Browse to your model file
- Select and open

### Step 4: Wait for Processing
- The app will validate the file format
- Check file size (max 50MB)
- Load the model into the 3D scene
- You'll see a success message when ready

### Step 5: Start Working
- Your model is now loaded and ready to edit
- Use all the app features: rigging, posing, animation, etc.

## File Size Limits

- **Maximum file size**: 50 MB
- **Recommended size**: Under 10 MB for optimal performance
- **Mobile optimization**: Keep models under 5 MB for mobile devices

## Converting FBX to GLB

If you have an FBX file, you need to convert it to GLB format first. Here are the recommended methods:

### Method 1: Blender (Recommended - Free)

**Best For**: Full control, all features, free

**Steps:**
1. Download and install [Blender](https://www.blender.org/) (free)
2. Open your FBX file: `File > Open`
3. Select your `.fbx` file and click "Open Model"
4. Wait for import to complete
5. Export as GLB: `File > Export As`
6. Select **glTF Binary (.glb)** format
7. Choose output location and click **Export glTF Binary**
8. Your `.glb` file is ready!

**Tips:**
- Check "Include Animations" if your model has animations
- Check "Include All Bone Influences" for complex rigs
- Adjust scale if needed (usually 1.0 is fine)

### Method 2: Babylon.js Sandbox (Free, No Installation)

**Best For**: Quick conversion, browser-based, no installation

**Steps:**
1. Open [Babylon.js Sandbox](https://sandbox.babylonjs.com/) in your browser
2. Drag and drop your `.fbx` file onto the canvas
3. Wait for the model to load
4. Go to `File > Export`
5. Choose **GLB** format
6. The file will download automatically

**Limitations:**
- File size limit: ~100 MB
- May not handle complex rigs perfectly
- Requires internet connection

### Method 3: Online 3D Converter (Free, No Installation)

**Best For**: Simple models, quick conversion

**Steps:**
1. Visit [Aspose 3D Converter](https://products.aspose.app/3d/conversion)
2. Click "Upload Files" and select your `.fbx` file
3. Select **GLB** as the output format
4. Click "Convert"
5. Download the converted `.glb` file

**Limitations:**
- File size limit: ~50 MB
- May not preserve all features
- Requires internet connection
- Privacy concerns with file upload

### Method 4: Autodesk FBX Review (Free, Official)

**Best For**: Official Autodesk tool, reliable

**Steps:**
1. Download [Autodesk FBX Review](https://www.autodesk.com/products/fbx/fbx-review)
2. Open your `.fbx` file
3. Go to `File > Export`
4. Choose **glTF Binary (.glb)** format
5. Save your file

**Limitations:**
- Requires installation
- Desktop application only

## Model Requirements

### Optimal Model Structure
- **Mesh**: Single or multiple meshes (combined is better)
- **Materials**: PBR materials recommended
- **Textures**: Embedded in GLB or referenced
- **Bones**: Proper bone hierarchy for rigging
- **Animations**: Optional, will be loaded if present

### Bone Structure
For best rigging results, ensure your model has:
- Clear bone hierarchy (parent-child relationships)
- Proper bone naming (optional but helpful)
- Correct bone weights (if using skinning)

### Texture Support
- **Embedded textures**: Included in GLB file (recommended)
- **External textures**: Must be in same folder as model
- **Supported formats**: PNG, JPG, WebP
- **Size**: Keep textures under 2MB each

## Troubleshooting

### Upload Failed - Invalid Format
**Problem**: File format not recognized
**Solution**: 
- Ensure file extension is `.glb`, `.gltf`, or `.fbx`
- Check file is not corrupted
- Try converting FBX to GLB using one of the methods above

### Upload Failed - File Too Large
**Problem**: File exceeds 50 MB limit
**Solution**:
- Compress textures (reduce resolution)
- Remove unused materials or meshes
- Use GLB format instead of GLTF (smaller)
- Split model into multiple parts

### Model Loads But Looks Wrong
**Problem**: Model appears distorted or incorrectly scaled
**Solution**:
- Check model scale in original application
- Try scaling in Blender before export
- Verify bone structure is correct
- Check for animation conflicts

### Animations Not Playing
**Problem**: Model has animations but they don't play
**Solution**:
- Ensure animations are embedded in GLB file
- Check animation names in export settings
- Verify animation tracks are not empty
- Try re-exporting from source application

### Model is Too Dark/Bright
**Problem**: Lighting doesn't look right
**Solution**:
- Check material settings in original app
- Verify textures are correct
- Try adjusting X-Ray mode (👁 button)
- Check lighting in 3D Poser app

## Best Practices

### Before Uploading
1. ✅ Test model in original application
2. ✅ Verify bone structure and weights
3. ✅ Check animations play correctly
4. ✅ Optimize textures for web
5. ✅ Convert FBX to GLB if needed

### After Uploading
1. ✅ Check model loads completely
2. ✅ Verify bones are selectable
3. ✅ Test rigging tools
4. ✅ Create and save test poses
5. ✅ Record test animations

### Performance Tips
- Keep models under 10 MB for desktop
- Keep models under 5 MB for mobile
- Use GLB format for better compression
- Optimize textures (reduce resolution if needed)
- Remove unused bones and meshes

### Workflow Tips
1. **Start with sample models** - Learn the app with SimpleHumanoid first
2. **Test rigging** - Try rigging before uploading complex models
3. **Save frequently** - Save poses and animations as you work
4. **Export backups** - Export your work regularly
5. **Use presets** - Apply preset poses to test your model

## Advanced Usage

### Batch Uploading
Currently, upload one model at a time. To work with multiple models:
1. Upload first model
2. Save your work (poses, animations)
3. Click Reset to clear scene
4. Upload next model

### Model Variants
Create variations of your model:
1. Upload base model
2. Save poses for each variant
3. Export poses as JSON
4. Share with others

### Custom Animations
1. Upload model with embedded animations
2. Use Timeline to record additional animations
3. Export animation sequences
4. Share with others

## Supported Model Features

| Feature | Status | Notes |
|---------|--------|-------|
| Meshes | ✅ Full | Multiple meshes supported |
| Materials | ✅ Full | PBR materials recommended |
| Textures | ✅ Full | Embedded or referenced |
| Bones | ✅ Full | Full skeleton support |
| Skinning | ✅ Full | Bone weights preserved |
| Animations | ✅ Full | All animation types |
| Morphs | ⚠️ Limited | Blend shapes may not work |
| IK Rigs | ⚠️ Limited | Use FK rigs for best results |
| Constraints | ⚠️ Limited | Some constraints not supported |

## File Size Optimization

### Before Export
1. Remove unused meshes
2. Remove unused materials
3. Optimize bone count (remove unnecessary bones)
4. Bake complex rigs to simple bones

### Texture Optimization
1. Reduce resolution (2048x2048 or less)
2. Use compressed formats (WebP if supported)
3. Combine multiple textures into atlases
4. Remove unused texture channels

### Export Settings
1. Use GLB format (smaller than GLTF)
2. Enable compression if available
3. Disable unused features
4. Set appropriate quality levels

## Next Steps

1. **Prepare your model** - Ensure it's in GLB format
2. **Upload your model** - Click 📤 Upload button
3. **Test rigging** - Try the rigging tools
4. **Create poses** - Save custom poses
5. **Record animations** - Use the timeline
6. **Export your work** - Share with others

## Support & Resources

### Need Help?
- Check troubleshooting section above
- Review SAMPLE_MODELS_GUIDE.md for model examples
- Check POSE_SYSTEM_GUIDE.md for pose workflows
- Review main README.md for general app documentation

### Conversion Tools
- [Blender](https://www.blender.org/) - Free, full-featured
- [Babylon.js Sandbox](https://sandbox.babylonjs.com/) - Browser-based
- [Aspose 3D Converter](https://products.aspose.app/3d/conversion) - Online tool
- [Autodesk FBX Review](https://www.autodesk.com/products/fbx/fbx-review) - Official tool

### 3D Model Resources
- [Sketchfab](https://sketchfab.com/) - Free 3D models
- [TurboSquid](https://www.turbosquid.com/) - Premium models
- [CGTrader](https://www.cgtrader.com/) - 3D marketplace
- [Poly Haven](https://polyhaven.com/) - Free assets

## Credits

Custom model upload feature developed by **C.R.G Studio** for professional character animation workflows.

---

**Happy Animating! 🎬**

C.R.G Studio - Professional 3D Animation Tools
