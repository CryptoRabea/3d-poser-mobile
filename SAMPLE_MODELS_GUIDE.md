# Sample Models Guide - C.R.G 3D Poser

## Overview

The C.R.G 3D Poser app includes three pre-built humanoid models for testing rigging, bone selection, pose creation, and animation workflows. These models are perfect for learning the app without needing to import your own 3D assets.

## Available Models

### 1. **Simple Humanoid** 🤖
- **Scale**: 1.0x (standard)
- **Description**: Basic humanoid model with standard proportions
- **Best For**: Learning the fundamentals of bone selection and pose creation
- **File**: `/models/SimpleHumanoid.glb`

### 2. **Tall Humanoid** 🏀
- **Scale**: 1.2x (20% larger)
- **Description**: Taller character model, great for variety
- **Best For**: Testing how the app handles different character proportions
- **File**: `/models/TallHumanoid.glb`

### 3. **Compact Humanoid** 🧒
- **Scale**: 0.8x (20% smaller)
- **Description**: Smaller character model, like a child or compact character
- **Best For**: Exploring how the app scales with different character sizes
- **File**: `/models/CompactHumanoid.glb`

## How to Load Sample Models

### Method 1: Using the Samples Button (Recommended)
1. Open the C.R.G 3D Poser app
2. Tap the **📦 Samples** button in the top control bar
3. Select a model from the dialog
4. The model will load automatically into the 3D canvas

### Method 2: Manual Import
1. Tap the **📁 Import** button
2. Navigate to `/models/` directory
3. Select any `.glb` file
4. The model will load into the 3D canvas

## Testing Workflow

### Step 1: Load a Model
- Use the Samples button to quickly load a humanoid model
- The model will appear in the 3D canvas with a skeleton visible

### Step 2: Explore Bone Structure
- **Rotate**: Drag on the canvas to rotate the view
- **Zoom**: Pinch on mobile or scroll on desktop to zoom in/out
- **Pan**: Two-finger drag to pan the camera

### Step 3: Create a Pose
1. Tap the **💾 Save** button
2. Enter a name for your pose (e.g., "Standing Pose")
3. Add a description (optional)
4. Add tags for organization (optional)
5. Tap **Save** to store the pose

### Step 4: Save Multiple Poses
1. Adjust the model's position/rotation using the transform controls
2. Save another pose with a different name
3. Create 3-5 different poses to build a library

### Step 5: Load and Apply Poses
1. Tap the **📚 Library** button to view saved poses
2. Select a pose to preview it
3. Tap **Apply** to apply the pose to the current model
4. Use the **Apply Pose** panel to blend between poses

### Step 6: Create an Animation
1. Tap the **🎬 Timeline** button
2. Record keyframes at different frames:
   - Adjust the model pose
   - Click "Record Keyframe" at frame 0
   - Move to frame 30
   - Adjust the pose differently
   - Click "Record Keyframe" at frame 30
3. Tap **Play** to preview the animation

### Step 7: Export Your Work
1. Tap the **📤 Share** button
2. Export all poses as JSON
3. Share the file or save it for later use
4. Import poses back using the same panel

## Model Specifications

### Bone Structure
Each humanoid model includes the following bones:
- **Root** - Base of the skeleton
- **Spine** - Lower spine
- **Chest** - Upper torso
- **Neck** - Neck joint
- **Head** - Head bone
- **LeftShoulder, LeftArm, LeftForearm, LeftHand** - Left arm chain
- **RightShoulder, RightArm, RightForearm, RightHand** - Right arm chain
- **LeftHip, LeftLeg, LeftFoot** - Left leg chain
- **RightHip, RightLeg, RightFoot** - Right leg chain

### Geometry
- Simple box-based geometry for fast rendering
- Standard material with metalness and roughness properties
- Optimized for mobile performance

## Tips & Tricks

### Performance
- The sample models are lightweight and optimized for mobile
- They render smoothly even on older devices
- Use X-Ray mode to see through the model for better bone visibility

### Bone Selection
- Tap on different parts of the model to select bones
- Selected bones are highlighted in the inspector
- Use the **Bone Inspector** to view and edit transform values

### Pose Creation Best Practices
1. **Name poses descriptively** - Use names like "Standing", "Sitting", "Jumping"
2. **Add tags** - Organize poses by category (e.g., "idle", "action", "emotion")
3. **Use descriptions** - Add context about the pose for future reference
4. **Save frequently** - Create poses as you experiment

### Animation Tips
1. **Start simple** - Create 2-3 keyframe animations first
2. **Use easing** - Apply easing functions for smooth transitions
3. **Test playback** - Preview animations to ensure smooth motion
4. **Export frequently** - Save your work to avoid losing progress

## Troubleshooting

### Model Won't Load
- Ensure you're using a supported `.glb` or `.gltf` file
- Check that the file isn't corrupted
- Try loading a sample model first to verify the app is working

### Bones Not Visible
- Tap the **👁 X-Ray** button to see through the model
- Try rotating the view to see the skeleton better
- Zoom in to get a closer look at the bone structure

### Poses Not Saving
- Check that you have enough local storage available
- Ensure the pose name is not empty
- Try exporting poses to backup your data

### Performance Issues
- Reduce the number of saved poses in memory
- Close other browser tabs
- Try using a different device or browser
- Clear browser cache and restart

## Advanced Usage

### Custom Models
Once comfortable with the sample models, you can:
1. Create your own 3D models in Blender, Maya, or other 3D software
2. Rig them with bones/armatures
3. Export as `.glb` or `.gltf`
4. Import into C.R.G 3D Poser using the **📁 Import** button

### Batch Operations
- Export all poses to JSON
- Share pose files with other users
- Import pose libraries created by others

### Mobile APK
- All sample models are included in the APK
- Models are accessible offline
- Perfect for testing on Android devices

## Next Steps

1. **Load a sample model** - Start with the Simple Humanoid
2. **Create 3-5 poses** - Practice saving different poses
3. **Create an animation** - Record a simple 2-frame animation
4. **Export your work** - Save poses and share them
5. **Explore advanced features** - Try bone selection, pose blending, and more

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review the main README.md for general app documentation
3. Check DEPLOYMENT.md for APK-specific information
4. Review POSE_SYSTEM_GUIDE.md for detailed pose management documentation

---

**Happy Animating! 🎬**

Created by **C.R.G Studio** - Professional 3D Animation Tools
