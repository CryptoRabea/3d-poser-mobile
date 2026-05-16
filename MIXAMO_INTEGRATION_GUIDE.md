# Mixamo Integration Guide

## Overview

3D Poser Mobile now includes full integration with **Mixamo**, Adobe's professional platform for rigged 3D characters and motion capture animations. This guide explains how to use Mixamo to enhance your 3D Poser workflow.

## What is Mixamo?

**Mixamo** (https://www.mixamo.com) is Adobe's free online platform that provides:

- **Thousands of rigged 3D characters** - Humanoids, fantasy characters, sci-fi robots, animals
- **Professional motion capture animations** - Walk cycles, jump, dance, combat, gestures, emotions
- **One-click rigging** - Automatically rig your own 3D models with Mixamo's AI-powered system
- **Free account** - No subscription required to download models and animations
- **High-quality assets** - Production-ready models and animations

## Getting Started with Mixamo

### Step 1: Create a Free Account

1. Visit https://www.mixamo.com
2. Click "Sign Up" or "Sign In with Adobe ID"
3. Create a free Adobe account or use existing credentials
4. Verify your email address

### Step 2: Browse Characters

1. Click "Characters" in the main menu
2. Browse available models by category:
   - **Humanoid** - Human characters with realistic proportions
   - **Fantasy** - Elves, dwarves, magical creatures
   - **Sci-Fi** - Robots, aliens, futuristic characters
   - **Animals** - Rigged animal models
3. Click on any character to view details and preview

### Step 3: Download Character

1. Click the "Download" button on a character page
2. Select download options:
   - **Format**: Choose **glTF Binary (.glb)** for 3D Poser compatibility
   - **Skin**: Select "With Skin" for textured models
   - **Pose**: Choose a default pose (optional)
3. Click "Download" to save the .glb file

### Step 4: Import into 3D Poser

1. Open 3D Poser Mobile app
2. Click **"📤 Upload"** button in the control bar
3. Select the downloaded .glb file from your device
4. The character will load into the 3D scene with full rigging
5. You can now:
   - Save poses
   - Apply animations
   - Edit bones and transforms
   - Create custom animations

## Downloading Animations

### Step 1: Browse Animations

1. On Mixamo website, click "Animations"
2. Browse animations by category:
   - **Locomotion** - Walking, running, movement
   - **Idle** - Standing, waiting, breathing
   - **Actions** - Jumping, combat, interactions
   - **Gestures** - Hand gestures, waving
   - **Emotions** - Laughing, crying, reacting

### Step 2: Download Animation

1. Click on an animation to preview
2. Click "Download" button
3. Select **glTF Binary (.glb)** format
4. Choose animation settings (FPS, frame range)
5. Click "Download"

### Step 3: Apply Animation in 3D Poser

1. Upload the animation file using **"📤 Upload"** button
2. Open **"🎬 Timeline"** panel
3. Import the animation keyframes
4. Play the animation using Timeline controls
5. Adjust animation speed and timing as needed

## Using the Mixamo Integration Panel

### Access Mixamo Panel

Click the **"🎭 Mixamo"** button in the control bar to open the Mixamo Integration Panel.

### Features

The panel includes three tabs:

#### 👤 Models Tab
- Browse popular Mixamo characters
- Filter by category (Humanoid, Fantasy, Sci-Fi, Animals)
- Search for specific models
- Click "Download" to open Mixamo website with model selected
- Instructions for downloading and importing

#### 🎬 Animations Tab
- Browse popular Mixamo animations
- Filter by category (Locomotion, Idle, Actions, Gestures, Emotions)
- Search for specific animations
- View animation duration and FPS
- Click "Download" to open Mixamo website with animation selected

#### 📖 Guide Tab
- Step-by-step download instructions
- Tips for using Mixamo with 3D Poser
- Direct link to Mixamo website

## Workflow Examples

### Example 1: Create a Walking Character

1. **Download Character**
   - Go to Mixamo, download "Mixamo Default Male" in .glb format
   - Import into 3D Poser using Upload button

2. **Download Animation**
   - Go to Mixamo Animations, download "Walking" animation
   - Import into 3D Poser

3. **Apply Animation**
   - Open Timeline panel
   - Import the walking animation
   - Click Play to see the character walk
   - Adjust animation speed with Timeline controls

4. **Save Result**
   - Click "💾 Save" to save the character with animation
   - Save to Model Library for future use

### Example 2: Create a Dance Sequence

1. **Download Character**
   - Download "Mixamo Default Female" character

2. **Download Multiple Animations**
   - Download "Idle" animation
   - Download "Dance" animation
   - Download "Wave" animation

3. **Create Animation Sequence**
   - Open Timeline
   - Add Idle animation (0-3 seconds)
   - Add Dance animation (3-5.5 seconds)
   - Add Wave animation (5.5-7 seconds)
   - Play full sequence

4. **Export Animation**
   - Click "📤 Share" to export the animation sequence
   - Save as JSON for sharing or backup

### Example 3: Custom Rig Your Own Model

1. **Prepare Your Model**
   - Export your 3D model as .fbx or .glb format
   - Ensure model is humanoid-shaped

2. **Upload to Mixamo**
   - Go to Mixamo website
   - Click "Upload Character"
   - Upload your model file
   - Follow Mixamo's rigging wizard

3. **Download Rigged Model**
   - After rigging completes, download as .glb
   - Import into 3D Poser

4. **Use with Animations**
   - Download any Mixamo animations
   - Apply to your rigged model
   - Animations will work with your custom model

## Tips & Best Practices

### Format Compatibility
- **Always download in .glb (glTF Binary) format** for best compatibility
- .fbx format requires conversion (see CUSTOM_MODEL_UPLOAD_GUIDE.md)
- .glb files are smaller and load faster

### Model Selection
- Start with "Mixamo Default" characters for best animation compatibility
- Custom characters may have different bone structures
- Test animations before saving

### Animation Blending
- Use Timeline to blend animations smoothly
- Adjust transition duration for natural movement
- Preview before saving

### Performance
- Mixamo models are optimized for real-time rendering
- Models with fewer bones load faster on mobile
- Use X-Ray mode to see bone structure

### Organization
- Use Model Library to organize downloaded characters
- Tag models by category (humanoid, fantasy, etc.)
- Save animation sequences for reuse

## Troubleshooting

### Animation Won't Apply to Model
- **Issue**: Downloaded animation doesn't match model skeleton
- **Solution**: Ensure animation is for humanoid rig, download from same Mixamo version

### Model Looks Distorted
- **Issue**: Model appears broken or twisted
- **Solution**: Try re-downloading with "With Skin" option, check .glb file integrity

### File Won't Import
- **Issue**: Upload fails or model doesn't load
- **Solution**: Ensure file is .glb format, check file size (max 50MB)

### Animation Plays Too Fast/Slow
- **Issue**: Animation speed doesn't match expectations
- **Solution**: Use Timeline speed slider to adjust playback speed (0.5x to 2x)

## Advanced: Mixamo API

For developers interested in programmatic access to Mixamo:

- Mixamo provides REST API for enterprise users
- Requires Adobe OAuth 2.0 authentication
- Access to character and animation libraries
- Batch download capabilities
- See `mixamoIntegration.ts` for API documentation

## Resources

- **Mixamo Website**: https://www.mixamo.com
- **Mixamo Help**: https://www.mixamo.com/#help
- **Adobe Account**: https://account.adobe.com
- **3D Poser Documentation**: See README.md and other guides

## Next Steps

1. **Explore Mixamo** - Visit https://www.mixamo.com and browse available assets
2. **Download Your First Character** - Choose a humanoid character and download as .glb
3. **Import into 3D Poser** - Use Upload button to load the character
4. **Apply Animations** - Download animations and use Timeline to apply them
5. **Create Custom Poses** - Save poses and build your animation library
6. **Share Your Work** - Export animations and share with others

## Support

For issues with:
- **3D Poser**: Check README.md and other documentation
- **Mixamo**: Visit https://www.mixamo.com/help or contact Adobe support
- **Model Import**: See CUSTOM_MODEL_UPLOAD_GUIDE.md

---

**Happy animating! 🎭**
