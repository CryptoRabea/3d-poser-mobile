# 3D Poser Mobile - Pose Save/Load System Guide

## Overview

The 3D Poser Mobile app now includes a comprehensive pose management system that allows you to save, load, organize, and share custom character poses. All poses are stored locally on your device for instant access and offline use.

## Features

✨ **Save Poses** - Capture character poses with bone transforms  
📚 **Pose Library** - Browse and organize all saved poses  
🔍 **Search & Filter** - Find poses by name, model, or tags  
💾 **Export/Import** - Share poses with others or backup your collection  
🏷️ **Tags** - Organize poses with custom tags  
📝 **Descriptions** - Add notes to remember pose details  
⚡ **Instant Access** - Load poses with one click  
🔄 **Sync** - Poses persist across sessions  

## Getting Started

### 1. Load a 3D Model

1. Tap **📁 Import** button
2. Select a .glb or .gltf file
3. Wait for the model to load
4. Position and pose your character

### 2. Save a Pose

1. Arrange your character in the desired pose
2. Tap **💾 Save** button
3. Enter pose name (required)
4. Add optional description
5. Add tags (comma-separated) for organization
6. Tap **💾 Save Pose**

**Example:**
- Name: "Standing Idle"
- Description: "Relaxed standing position with arms at sides"
- Tags: "idle, standing, relaxed"

### 3. Browse Saved Poses

1. Tap **📚 Library** button
2. View all saved poses
3. Use search to find specific poses
4. Filter by model or tag
5. Sort by name, date, or model

### 4. Load a Pose

1. Open **📚 Library**
2. Find the pose you want
3. Tap **✓ Load** button
4. The pose is applied to your current model

### 5. Export & Share

**Export All Poses:**
1. Tap **📤 Share** button
2. Click **⬇ Download All Poses**
3. A JSON file is downloaded with all poses

**Export Single Pose:**
1. Open **📚 Library**
2. Expand the pose details
3. Tap **⬇ Export** button
4. The pose is downloaded as JSON

**Share Poses:**
- Email the JSON file to others
- Upload to cloud storage
- Share via messaging apps
- Store as backup

### 6. Import Poses

**Import from File:**
1. Tap **📤 Share** button
2. Click **⬆ Choose File**
3. Select a poses JSON file
4. Poses are imported and added to your library

**Import from Others:**
1. Receive a poses JSON file
2. Open the app
3. Tap **📤 Share**
4. Click **⬆ Choose File**
5. Select the received file
6. Poses are imported

## Pose Data Structure

Each pose contains:

```json
{
  "id": "pose_1712192400000_abc123def",
  "name": "Standing Idle",
  "description": "Relaxed standing position",
  "modelName": "character_model",
  "bones": [
    {
      "name": "Armature|Hips",
      "position": { "x": 0, "y": 1, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "scale": { "x": 1, "y": 1, "z": 1 }
    }
  ],
  "tags": ["idle", "standing"],
  "createdAt": 1712192400000,
  "updatedAt": 1712192400000
}
```

## Storage & Limits

### Local Storage

- **Location:** Device local storage (IndexedDB)
- **Persistence:** Survives app restarts
- **Backup:** Export poses regularly
- **Limit:** ~50 MB per app (varies by device)

### Typical Storage Usage

| Item | Size |
|------|------|
| Simple pose (10 bones) | ~2 KB |
| Complex pose (100 bones) | ~20 KB |
| 100 poses | ~2 MB |
| 1000 poses | ~20 MB |

### Storage Management

**Check Storage Usage:**
- Open browser DevTools
- Go to Application → Local Storage
- Look for "3d-poser-poses" entry

**Clear Storage:**
- Settings → Clear App Data
- Or manually delete poses in Library

**Backup Poses:**
- Regularly export poses
- Store backups on cloud
- Keep copies on multiple devices

## Advanced Usage

### Organizing Poses by Model

1. Save poses with model name in description
2. Use tags to categorize by model
3. Filter by model in Library

**Example Tags:**
- Model: "hero_character", "npc_merchant"
- Action: "idle", "walk", "run", "attack"
- Emotion: "happy", "sad", "angry", "neutral"

### Creating Pose Collections

1. Create poses for different scenarios
2. Tag them consistently
3. Export related poses together
4. Share collections with team

**Example Collection:**
```
Combat Poses:
- attack_1 (tag: combat, attack)
- attack_2 (tag: combat, attack)
- defend (tag: combat, defend)
- hit_reaction (tag: combat, reaction)
```

### Sharing with Team

1. Create poses in your library
2. Export selected poses
3. Share JSON file with team
4. Team imports poses
5. Everyone has same pose library

### Version Control

**Manual Versioning:**
1. Save pose with version number
2. Example: "idle_v1", "idle_v2"
3. Keep old versions for reference
4. Delete outdated versions

**Backup Strategy:**
1. Export poses weekly
2. Store on cloud (Google Drive, Dropbox)
3. Keep local copies
4. Label with date: "poses_2026-04-04.json"

## Troubleshooting

### Pose Won't Save

**Problem:** "Pose name is required" error  
**Solution:** Enter a name for the pose

**Problem:** "No bones to save" error  
**Solution:** Load a model with bones first

### Pose Won't Load

**Problem:** Pose doesn't apply to model  
**Solution:** 
- Ensure model has same bone structure
- Poses are model-specific
- Try a different model

### Import Fails

**Problem:** "Invalid JSON format" error  
**Solution:**
- Verify file is valid JSON
- Check file wasn't corrupted
- Re-export from another device

**Problem:** "Pose missing required fields" error  
**Solution:**
- File may be corrupted
- Try importing from backup
- Manually edit JSON file

### Storage Full

**Problem:** Can't save more poses  
**Solution:**
- Export and delete old poses
- Clear app cache
- Uninstall and reinstall app

## Performance Tips

### For Faster Performance

1. **Limit poses per library:** Keep under 500 poses
2. **Use tags effectively:** Easier searching
3. **Export regularly:** Backup and reduce storage
4. **Delete unused poses:** Free up space

### For Better Organization

1. **Consistent naming:** "action_emotion_variation"
2. **Meaningful tags:** "combat", "idle", "walk"
3. **Detailed descriptions:** Remember pose context
4. **Group by model:** Separate collections per character

## API Reference

### usePoseManager Hook

```typescript
import { usePoseManager } from '@/hooks/usePoseManager';

const {
  poses,              // All saved poses
  currentPose,        // Currently selected pose
  isLoading,          // Loading state
  error,              // Error message
  
  savePose,           // Save new pose
  loadPose,           // Load pose by ID
  updatePose,         // Update existing pose
  deletePose,         // Delete pose
  
  searchPoses,        // Search by query
  getPosesByModel,    // Filter by model
  getPosesByTag,      // Filter by tag
  getAllTags,         // Get all tags
  
  exportPoses,        // Export as JSON string
  importPoses,        // Import from JSON string
  exportAsFile,       // Download as file
  importFromFile,     // Import from file
  
  getStorageStats,    // Get storage info
  clearAllPoses,      // Delete all poses
} = usePoseManager();
```

### Pose Storage Functions

```typescript
import * as poseStorage from '@/lib/poseStorage';

// Get all poses
const poses = poseStorage.getAllPoses();

// Save pose
const newPose = poseStorage.savePose({
  name: 'Idle',
  description: 'Standing pose',
  modelName: 'character',
  bones: [],
  tags: ['idle']
});

// Search
const results = poseStorage.searchPoses('idle');

// Export
const json = poseStorage.exportPoses();

// Import
const result = poseStorage.importPoses(jsonString);
```

## Best Practices

### Naming Conventions

✅ **Good:**
- "standing_idle_relaxed"
- "combat_attack_1"
- "emotion_happy_excited"

❌ **Avoid:**
- "pose1", "pose2"
- "test", "temp"
- "aaaaaa", "zzzzz"

### Tagging Strategy

✅ **Good:**
- Primary: action (idle, walk, run, attack)
- Secondary: emotion (happy, sad, angry)
- Tertiary: context (combat, social, exploration)

❌ **Avoid:**
- Too many tags (>5 per pose)
- Vague tags (misc, other, stuff)
- Inconsistent spelling (Idle vs idle)

### Organization

✅ **Good:**
- Group by character
- Separate by action type
- Use consistent naming
- Regular backups

❌ **Avoid:**
- Mixing models in one collection
- Inconsistent naming
- No backups
- Cluttered library

## Limits & Constraints

| Limit | Value |
|-------|-------|
| Max poses per device | ~1000 |
| Max bones per pose | Unlimited |
| Max pose name length | 255 characters |
| Max description length | 5000 characters |
| Max tags per pose | Unlimited |
| Max file size for import | 50 MB |
| Storage per app | ~50 MB |

## FAQ

**Q: Are poses synced across devices?**  
A: No, poses are stored locally. Export and import to transfer between devices.

**Q: Can I share poses with others?**  
A: Yes! Export as JSON and share the file. Others can import it.

**Q: What happens if I delete a pose?**  
A: It's permanently deleted. Export regularly to backup.

**Q: Can I edit a saved pose?**  
A: Load the pose, modify it, and save with a new name. Original remains unchanged.

**Q: How do I backup my poses?**  
A: Export all poses and store the JSON file on cloud storage.

**Q: Can I use poses from different models?**  
A: Only if models have compatible bone structures. Otherwise, poses won't apply correctly.

**Q: How much storage do poses use?**  
A: ~2 KB per simple pose, ~20 KB per complex pose.

**Q: Can I import poses created elsewhere?**  
A: Yes, if they're in the correct JSON format with required fields.

## Support

- **Issues:** Report via GitHub Issues
- **Questions:** Check FAQ or documentation
- **Feedback:** Submit feature requests
- **Bugs:** Include error message and steps to reproduce

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Brand:** C.R.G Studio (Crazy Rooster Games)
