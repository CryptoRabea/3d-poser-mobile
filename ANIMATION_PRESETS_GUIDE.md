# Animation Presets Guide

## Overview

The 3D Poser Mobile app includes a comprehensive library of pre-made animation sequences that users can instantly apply to their 3D models. These animations are organized by category and difficulty level, making it easy to find and apply the perfect animation for any scenario.

## Available Animations

### 🚶 Locomotion Animations

#### Walk Cycle
- **Duration:** 2 seconds
- **Difficulty:** Easy
- **Description:** A natural walking animation with alternating leg movement and arm swinging
- **Best For:** Character movement, demonstrations, walk-throughs
- **Features:**
  - Realistic leg alternation
  - Synchronized arm swinging
  - Subtle body sway
  - Loops seamlessly

### ⚡ Action Animations

#### Jump
- **Duration:** 1 second
- **Difficulty:** Medium
- **Description:** A dynamic jump animation with crouch, takeoff, and landing
- **Best For:** Action sequences, gameplay, dynamic poses
- **Features:**
  - Crouch preparation phase
  - Powerful takeoff with arm raise
  - Realistic landing impact
  - Full body extension during flight

#### Dance
- **Duration:** 2 seconds
- **Difficulty:** Medium
- **Description:** A fun dance animation with hip sway and arm movement
- **Best For:** Entertainment, celebrations, character personality
- **Features:**
  - Hip swaying motion
  - Alternating arm movement
  - Leg movement synchronized with arms
  - Head bobbing for personality

### 😌 Idle Animations

#### Idle
- **Duration:** 3 seconds
- **Difficulty:** Easy
- **Description:** A subtle idle animation with breathing and weight shifting
- **Best For:** Standing characters, default pose, waiting states
- **Features:**
  - Breathing motion (chest expansion)
  - Weight shifting between feet
  - Head tilting
  - Arm sway
  - Natural and calming

### 👋 Gesture Animations

#### Wave
- **Duration:** 1 second
- **Difficulty:** Easy
- **Description:** A friendly wave gesture with arm raising and hand waving
- **Best For:** Greetings, acknowledgments, social interactions
- **Features:**
  - Arm raising motion
  - Hand waving motion
  - Head tilting for friendliness
  - Quick and expressive

## How to Use Animation Presets

### Playing an Animation

1. **Load a Model**
   - Click **📁 Import** to load your own .glb/.gltf model, or
   - Click **📦 Samples** to use a pre-made humanoid model

2. **Open Animation Presets**
   - Click the **🎥 Animations** button in the control bar
   - The Animation Presets panel will open

3. **Select an Animation**
   - Browse animations by category using the tabs:
     - 🚶 Locomotion
     - ⚡ Actions
     - 😌 Idle
     - 👋 Gestures
   - Click **Play** to apply the animation to your model

4. **Control Playback**
   - **Play** - Start the animation (loops continuously)
   - **Stop** - Stop the animation and reset to default pose
   - **Reset** - Return to default pose without stopping

### Animation Categories

**Locomotion** - Movement animations for characters walking, running, or moving
- Best for: Character movement, walk cycles, navigation

**Actions** - Dynamic action animations like jumping, dancing, or performing
- Best for: Gameplay, action sequences, dynamic poses

**Idle** - Subtle animations for standing characters
- Best for: Default poses, waiting states, character presence

**Gestures** - Hand and body gestures for communication
- Best for: Greetings, expressions, social interactions

## Combining Animations with Other Features

### Animation + Pose Saving
1. Play an animation to see your character in motion
2. Pause at a specific frame you like
3. Click **💾 Save** to save that pose
4. Create a library of key poses from animations

### Animation + Timeline
1. Play an animation preset to see the motion
2. Open the **🎬 Timeline** to record custom variations
3. Modify keyframes to create unique animations
4. Combine multiple animations into sequences

### Animation + Preset Poses
1. Apply a preset pose to set the character's base position
2. Play an animation to see how it moves from that pose
3. Experiment with different pose + animation combinations

## Tips & Tricks

### Getting the Most from Animations

**Tip 1: Loop Understanding**
- All animations loop continuously until you click Stop
- Use this to see how animations flow over multiple cycles
- Look for smooth transitions between the end and beginning

**Tip 2: Difficulty Levels**
- **Easy** - Simple, straightforward animations (Idle, Wave)
- **Medium** - Complex animations with multiple phases (Jump, Dance)
- **Hard** - Advanced animations with fine details (coming soon)

**Tip 3: Animation Duration**
- Shorter animations (1s) are good for quick actions
- Longer animations (2-3s) are better for continuous motion
- Consider animation duration when planning sequences

**Tip 4: Combining Animations**
- Record multiple animations in the Timeline to create sequences
- Use the Pose Library to save key frames from animations
- Create custom animations by blending presets

**Tip 5: Model Compatibility**
- All animations work with standard humanoid rigs
- If an animation doesn't look right, check your model's bone structure
- Use sample models to test animations before using custom models

## Advanced Workflows

### Creating Animation Variations

1. **Load Animation**
   - Play a preset animation (e.g., Walk Cycle)

2. **Pause at Key Frame**
   - Let it play and observe the motion
   - Mentally note interesting poses

3. **Save Pose**
   - Click **💾 Save** to save the current pose
   - Name it descriptively (e.g., "Walk - Mid-Stride")

4. **Create Variations**
   - Repeat for different frames of the same animation
   - Build a library of animation keyframes

5. **Combine in Timeline**
   - Use Timeline to blend saved poses
   - Create smooth transitions between animation frames

### Building Animation Sequences

1. **Plan Your Sequence**
   - Decide what animations you need (e.g., Idle → Walk → Jump)
   - Note the duration of each animation

2. **Record in Timeline**
   - Open **🎬 Timeline**
   - Record each animation as a separate sequence
   - Adjust timing and transitions

3. **Export and Share**
   - Click **📤 Share** to export your animation sequence
   - Share with other users or import into other projects

### Performance Optimization

**For Smooth Playback:**
- Use simpler models with fewer bones for faster animation
- Close unnecessary browser tabs to free up resources
- Use the X-Ray mode to see bone movement without rendering complexity

**For Mobile/APK:**
- Test animations on the target device
- Shorter animations perform better on mobile
- Consider reducing animation complexity for mobile deployment

## Troubleshooting

### Animation Not Playing
- **Issue:** Animation doesn't start when you click Play
- **Solution:** Make sure a model is loaded first. Click **📁 Import** or **📦 Samples**

### Animation Looks Jerky
- **Issue:** Animation appears to stutter or skip frames
- **Solution:** Close other browser tabs, or use a simpler model

### Animation Doesn't Loop Smoothly
- **Issue:** Animation has a visible pause between cycles
- **Solution:** This is normal for some animations. Use Timeline to create seamless loops

### Wrong Bones Moving
- **Issue:** Animation applies to wrong body parts
- **Solution:** Check your model's bone naming. Use sample models to verify correct structure

### Animation Too Fast/Slow
- **Issue:** Animation plays at wrong speed
- **Solution:** Use Timeline to adjust animation speed or create custom variations

## Future Animation Presets

Planned animations for future updates:
- Running (fast locomotion)
- Climbing (vertical movement)
- Swimming (fluid motion)
- Combat moves (action sequences)
- Emotion animations (happy, sad, angry)
- Sport animations (basketball, soccer, etc.)
- Emote animations (dance variations, celebrations)

## Animation Technical Details

### Keyframe System
- Each animation consists of multiple keyframes
- Keyframes define bone positions, rotations, and scales
- Linear interpolation between keyframes creates smooth motion

### Bone Transforms
- Position (X, Y, Z coordinates)
- Rotation (X, Y, Z Euler angles in radians)
- Scale (X, Y, Z scale factors)

### Animation Properties
- **FPS:** Frames per second (typically 24 fps)
- **Duration:** Total length in seconds
- **Keyframes:** Number of keyframe data points
- **Category:** Animation type for organization
- **Difficulty:** Complexity level

## Exporting Animations

### Export as JSON
1. Click **📤 Share**
2. Select animation to export
3. Click **Export**
4. Save the JSON file
5. Share with others or import into other projects

### Import Animations
1. Click **📤 Share**
2. Click **Import**
3. Select JSON animation file
4. Animation will be added to your library

## Best Practices

✅ **Do:**
- Test animations with different models
- Save interesting poses from animations
- Combine animations with custom poses
- Use Timeline to create variations
- Export and share your favorite animations

❌ **Don't:**
- Apply too many animations rapidly (can cause lag)
- Forget to save poses you like
- Ignore bone structure compatibility
- Use complex animations on low-end devices without testing

## Support & Feedback

If you encounter issues with animations or have suggestions for new animations:
1. Check the Troubleshooting section above
2. Test with sample models first
3. Report bugs with animation details
4. Suggest new animation ideas

## Summary

Animation Presets make it easy to add professional motion to your 3D characters. Whether you're creating game assets, animations for visualization, or just having fun with 3D models, the preset animations provide a great starting point. Combine them with the Pose Library and Timeline for unlimited creative possibilities!
