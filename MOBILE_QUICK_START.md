# 3D Poser Mobile - Quick Start Guide

Welcome to **3D Poser Mobile**, a professional character rigging and animation tool optimized for Android and iOS devices!

## What You Can Do

✨ **Import 3D Models** - Load .glb and .gltf files  
🦴 **Create Bone Rigs** - Automatic skeleton generation with Mixamo-style point placement  
🎬 **Animate Characters** - Import and play animations  
✏️ **Edit Poses** - Rotate bones and create custom poses  
💾 **Save & Export** - Store your work locally  
📱 **Use Offline** - Full offline support via PWA  

## Getting Started

### 1. Open the App

**On Mobile Browser:**
- Visit the app URL in your mobile browser
- Tap the menu button (⋯)
- Select "Install app" or "Add to Home Screen"
- The app will appear on your home screen

**On Android (APK):**
- Download the APK file
- Enable "Unknown Sources" in Settings
- Tap the APK to install
- Launch from your app drawer

### 2. Import a 3D Model

1. Tap **📁 Import** button
2. Select a .glb or .gltf file from your device
3. Wait for the model to load
4. The model will appear in the 3D view

### 3. Create a Bone Rig

1. Tap **🦴 Rig** button
2. Follow the rigging wizard:
   - **Step 1:** Choose which fingers to include (optional)
   - **Step 2:** Click on body landmarks (head, shoulders, elbows, etc.)
   - **Step 3:** Confirm each point
   - **Step 4:** Your rig is created!

### 4. Pose Your Character

1. **Rotate the view:** Drag with one finger
2. **Zoom:** Pinch with two fingers
3. **Select a bone:** Tap the green sphere on a joint
4. **Rotate bone:** Drag the colored rings:
   - 🔴 Red ring = X-axis rotation
   - 🟢 Green ring = Y-axis rotation
   - 🔵 Blue ring = Z-axis rotation

### 5. Play Animations

1. Import animation files (.glb/.gltf with animation data)
2. Select animation from dropdown
3. Tap **▶ Play** to start
4. Use **Speed** slider to adjust playback speed
5. Use **Progress** slider to scrub through animation

## Controls Guide

### Touch Controls

| Action | Result |
|--------|--------|
| Drag with 1 finger | Rotate view |
| Pinch with 2 fingers | Zoom in/out |
| Tap green sphere | Select bone |
| Drag colored ring | Rotate bone |
| Double tap | Reset view |

### Buttons

| Button | Function |
|--------|----------|
| 📁 Import | Load 3D model |
| 🦴 Rig | Create bone skeleton |
| ⟲ Reset | Reset camera view |
| 👁 X-Ray | Toggle transparency mode |
| ▶ Play | Play animation |
| ⏸ Pause | Pause animation |
| ⏹ Stop | Stop animation |

## Tips & Tricks

### For Better Performance

- **Close other apps** to free up memory
- **Reduce model complexity** for smoother performance
- **Use DRACO compression** for faster loading
- **Lower screen brightness** to save battery

### For Better Rigging

- **Use high-poly models** for accurate bone placement
- **Place landmarks carefully** at joint centers
- **Include fingers** for more detailed control
- **Test the rig** by moving each bone

### For Better Animation

- **Use 30-60 FPS** animations for smooth playback
- **Keep animation length** under 10 seconds for mobile
- **Use keyframe optimization** to reduce file size
- **Test on target device** before finalizing

## File Format Support

### Supported 3D Formats

- **.glb** (GLTF Binary) - Recommended, smaller file size
- **.gltf** (GLTF JSON) - Human-readable, larger file size

### Recommended File Sizes

- **Model:** 1-10 MB
- **Animation:** 100 KB - 2 MB
- **Total project:** 50 MB (device storage limit)

## Troubleshooting

### Model won't load

**Problem:** "Loading..." appears but nothing happens  
**Solution:**
- Check file format (.glb or .gltf)
- Verify file isn't corrupted
- Try a smaller file first
- Check internet connection

### Rigging wizard crashes

**Problem:** App freezes during rigging  
**Solution:**
- Restart the app
- Use a simpler model
- Close other apps
- Clear app cache

### Animations play too fast/slow

**Problem:** Animation speed is wrong  
**Solution:**
- Use the Speed slider to adjust
- Check animation FPS in source file
- Verify animation duration

### Touch controls not responding

**Problem:** Can't rotate or zoom  
**Solution:**
- Tap the canvas first to focus it
- Check for UI elements blocking touch
- Restart the app
- Update your browser/app

### File storage issues

**Problem:** Can't save or export files  
**Solution:**
- Check device storage space
- Enable file permissions in Settings
- Try a different file location
- Restart the device

## Keyboard Shortcuts (Desktop/Tablet)

| Key | Action |
|-----|--------|
| R | Reset view |
| X | Toggle X-Ray |
| Space | Play/Pause animation |
| Delete | Delete selected bone |
| Ctrl+S | Save project |
| Ctrl+Z | Undo |

## Exporting Your Work

### Save as JSON

1. Create your rig
2. Tap **💾 Export**
3. Choose "Save as JSON"
4. Share or backup the file

### Export as GLB

1. Pose your character
2. Tap **💾 Export**
3. Choose "Export as GLB"
4. Use in other 3D software

## Performance Metrics

Typical performance on modern Android devices:

| Device | FPS | Model Size | Notes |
|--------|-----|-----------|-------|
| Flagship (2024) | 60 | 10 MB | Smooth performance |
| Mid-range (2023) | 30-45 | 5 MB | Good performance |
| Budget (2022) | 15-30 | 2 MB | Playable |
| Older devices | 10-15 | 1 MB | Basic functionality |

## Data Privacy

- ✅ All data stored locally on your device
- ✅ No cloud upload required
- ✅ No tracking or analytics
- ✅ Offline-first design
- ✅ Your models are yours

## Getting Help

### In-App Help

- Tap **?** icon for tooltips
- Hover over buttons for descriptions
- Check the info panel at bottom-left

### Online Resources

- Documentation: [3D Poser Docs](https://docs.example.com)
- Video Tutorials: [YouTube Channel](https://youtube.com)
- Community Forum: [Discord Server](https://discord.gg)
- Bug Reports: [GitHub Issues](https://github.com)

## Advanced Features

### Finger Rigging

When creating a rig, you can optionally add finger bones:
- Thumb (2 joints)
- Index finger (3 joints)
- Middle finger (3 joints)
- Ring finger (3 joints)
- Pinky finger (3 joints)

Each hand gets full finger control!

### Animation Blending

Combine multiple animations:
1. Load multiple animation files
2. Select animations from dropdown
3. Adjust blend weight slider
4. Animations play simultaneously

### Custom Bone Colors

Customize bone appearance:
1. Select a bone
2. Tap color picker
3. Choose your color
4. Bones update in real-time

## System Requirements

### Minimum

- Android 8.0+
- 2 GB RAM
- 100 MB storage
- Modern GPU

### Recommended

- Android 11+
- 4+ GB RAM
- 500 MB storage
- Snapdragon 800+ or equivalent

### iOS

- iOS 13+
- iPhone 7 or later
- 200 MB storage

## What's New

### Version 1.0.0

- ✨ Initial release
- 🦴 Full rigging system
- 🎬 Animation playback
- 📱 Mobile-optimized UI
- 💾 Local storage
- 🔄 Offline support

## Feedback & Suggestions

Have ideas for improvements? Found a bug?

- **Report bugs:** [GitHub Issues](https://github.com)
- **Suggest features:** [Feature Requests](https://github.com)
- **Share your work:** [Community Gallery](https://example.com)
- **Contact support:** support@crg-studio.com

---

**Happy Creating! 🎨**

*3D Poser Mobile - Professional Character Animation for Everyone*

**Brand:** C.R.G Studio (Crazy Rooster Games)  
**Version:** 1.0.0  
**Last Updated:** 2026-04-04
