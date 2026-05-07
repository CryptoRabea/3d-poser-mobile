# Batch Model Management Guide - C.R.G 3D Poser

## Overview

The C.R.G 3D Poser app now includes a comprehensive **Batch Model Management System** that allows you to save, organize, and quickly switch between multiple 3D models. This feature is perfect for working with different character variants, testing multiple rigs, or managing a library of models.

## Key Features

### 📚 Model Library
- **Store up to 20 models** in persistent local storage
- **Search and filter** by name, tags, or description
- **Organize with tags** for easy categorization
- **Metadata tracking** (bones, meshes, animations, file size)
- **500 MB total storage** across all models

### 🔄 Quick Switching
- **ModelSwitcher dropdown** in control bar for fast access
- **Recent models** displayed at the top
- **One-click loading** of any saved model
- **Current model indicator** shows which model is active

### 📖 Full Library Management
- **Grid view** with model thumbnails
- **Edit model details** (name, description, tags)
- **Delete models** to free up storage
- **View storage statistics** (total models, storage used)
- **Search functionality** across all models

### 💾 Persistent Storage
- **LocalStorage-based** - models persist across sessions
- **Automatic metadata** - bone count, mesh count, animation count
- **Custom tags** for organization
- **Descriptions** for notes and documentation

## How to Use

### Accessing the Model Library

**Method 1: Quick Switcher (Fastest)**
1. Look for the **Model Switcher** dropdown in the control bar
2. Click to see recent models (up to 5)
3. Click any model to load it instantly
4. Click "View All Models" to open full library

**Method 2: Full Library Panel**
1. Click the **📚 Library** button in the control bar
2. Browse all your saved models in grid view
3. Use search bar to find specific models
4. Click **Load** button on any model card

### Saving a Model

Currently, models are saved when you:
1. **Upload a custom model** using the 📤 Upload button
2. Models are automatically saved with metadata

To manually save the current model state:
1. Click **📚 Library** button
2. Models are automatically tracked with timestamps

### Loading a Model

**Quick Load (Recommended)**
1. Click the **Model Switcher** dropdown in control bar
2. Select a model from the list
3. Model loads instantly

**From Library**
1. Click **📚 Library** button
2. Search or filter for your model
3. Click the **Load** button
4. Model appears in the 3D scene

### Organizing Models

**Add Tags**
1. Open **📚 Library**
2. Click the **Edit** button (pencil icon) on a model
3. Add tags (comma-separated): `humanoid, character, rigged`
4. Click **Save**
5. Use tags to filter models

**Rename Model**
1. Open **📚 Library**
2. Click **Edit** on the model
3. Change the name
4. Add description if needed
5. Click **Save**

**Filter by Tags**
1. Open **📚 Library**
2. Click any tag button at the top
3. Only models with that tag appear
4. Click tag again to remove filter

### Storage Management

**Check Storage Usage**
- Open **📚 Library**
- View storage stats in the header:
  - Total models stored
  - Storage used / 500 MB limit
  - Results count (filtered)

**Free Up Storage**
1. Open **📚 Library**
2. Find models you no longer need
3. Click the **Delete** button (trash icon)
4. Confirm deletion
5. Storage is immediately freed

**Storage Limits**
- **Maximum models**: 20
- **Total storage**: 500 MB
- **Max file size**: 50 MB per model
- **Recommended**: Keep models under 10 MB for optimal performance

## Workflow Examples

### Example 1: Testing Multiple Character Variants

1. **Upload first variant**: Click 📤 Upload, select `character_v1.glb`
2. **Tag it**: Edit → Add tag "variant" → Save
3. **Upload second variant**: Click 📤 Upload, select `character_v2.glb`
4. **Tag it**: Edit → Add tag "variant" → Save
5. **Quick switch**: Use Model Switcher dropdown to compare
6. **Filter by tag**: Click "variant" tag to see only variants

### Example 2: Managing Rigged vs Unrigged Models

1. **Upload unrigged model**: Tag as `unrigged`
2. **Upload rigged model**: Tag as `rigged`
3. **Filter**: Click "rigged" tag to see only rigged models
4. **Switch**: Use Model Switcher to quickly test both
5. **Compare**: Side-by-side testing with quick switching

### Example 3: Organizing by Project

1. **Upload models for Project A**: Tag as `project-a`
2. **Upload models for Project B**: Tag as `project-b`
3. **Filter by project**: Click project tag to see only relevant models
4. **Add descriptions**: Document each model's purpose
5. **Quick access**: Use Model Switcher for fast switching within a project

## Features Explained

### Model Switcher Dropdown
- **Location**: Control bar (next to 📤 Upload button)
- **Shows**: 5 most recent models
- **Click model**: Loads it instantly
- **View All**: Opens full library for more options

### Library Panel
- **Search**: Find models by name, tags, or description
- **Filter**: Click tags to show only tagged models
- **Grid View**: Visual browsing with thumbnails
- **Edit**: Change name, description, tags
- **Delete**: Remove models to free storage
- **Stats**: See storage usage and model count

### Model Cards
- **Thumbnail**: Visual preview (placeholder if not available)
- **Name**: Model name (editable)
- **Format**: File format (GLB, FBX, GLTF)
- **Size**: File size in MB or KB
- **Metadata**: Bone count, mesh count, animation count
- **Tags**: Colored tag pills for organization
- **Description**: Short notes about the model
- **Load Button**: Click to load model
- **Edit Button**: Modify model details
- **Delete Button**: Remove model

## Tips & Tricks

### Organization Best Practices
1. **Use consistent naming**: `character_v1`, `character_v2`, etc.
2. **Add descriptive tags**: `humanoid`, `rigged`, `animated`, `test`
3. **Include descriptions**: "Main character rig", "Enemy variant", etc.
4. **Keep file sizes small**: Optimize models before uploading
5. **Regular cleanup**: Delete old test models to free storage

### Performance Tips
1. **Keep models under 10 MB**: Faster loading and switching
2. **Limit to 15 models**: Better performance and easier browsing
3. **Use tags**: Faster filtering than searching
4. **Clear old thumbnails**: Helps with storage management
5. **Export important models**: Backup to external storage

### Workflow Optimization
1. **Use Model Switcher** for quick access (faster than Library panel)
2. **Tag frequently used models** for easy filtering
3. **Rename models clearly** for quick identification
4. **Keep descriptions updated** for future reference
5. **Delete unused models** to maintain performance

## Troubleshooting

### Model Won't Load
**Problem**: Clicked load but model didn't appear
**Solution**:
- Check if model file is valid GLB/GLTF format
- Try uploading the model again
- Check browser console for errors
- Ensure model is not corrupted

### Storage Full
**Problem**: Can't upload more models
**Solution**:
- Open Library and delete unused models
- Optimize model file sizes (reduce textures)
- Export important models to backup
- Keep only essential models in library

### Can't Find Model
**Problem**: Model disappeared from library
**Solution**:
- Check if filters are active (click tags to clear)
- Search by partial name
- Check storage stats to see total models
- Refresh the page to reload library

### Slow Switching
**Problem**: Takes long time to load models
**Solution**:
- Reduce model file sizes
- Close other browser tabs
- Clear browser cache
- Delete old models to free storage

## Advanced Features

### Metadata Tracking
Each model automatically tracks:
- **Bone Count**: Number of bones in skeleton
- **Mesh Count**: Number of mesh objects
- **Animation Count**: Number of embedded animations
- **File Size**: Model file size in bytes
- **Created Date**: When model was first saved
- **Updated Date**: Last modification time

### Storage Statistics
View in Library header:
- **Total Models**: Number of saved models
- **Storage Used**: Current storage usage
- **Results**: Number of filtered results
- **Oldest Model**: Timestamp of oldest model
- **Newest Model**: Timestamp of newest model

### Tag System
- **Create tags**: Type comma-separated tags when editing
- **Filter by tags**: Click tag buttons to filter
- **Multiple tags**: Models can have multiple tags
- **Tag suggestions**: Common tags appear in dropdown
- **Tag management**: Edit tags anytime

## Limitations & Future Enhancements

### Current Limitations
- Models stored in browser localStorage (limited to 500 MB)
- No cloud sync across devices
- Thumbnails are cached locally
- No batch operations (delete multiple at once)
- No model export to file

### Planned Enhancements
- Cloud storage integration
- Automatic thumbnail generation
- Batch operations (multi-select, bulk delete)
- Model preview before loading
- Export/import model library
- Sharing models with others
- Model version history
- Automatic backups

## Storage Information

### Storage Breakdown
- **Model data**: Actual 3D model files (GLB/GLTF)
- **Metadata**: Name, tags, description, timestamps
- **Thumbnails**: Cached preview images
- **Total limit**: 500 MB across all models

### Optimizing Storage
1. **Reduce model complexity**: Fewer polygons = smaller file
2. **Compress textures**: Lower resolution textures
3. **Remove unused materials**: Clean up unused assets
4. **Combine meshes**: Merge multiple meshes into one
5. **Use GLB format**: More compressed than GLTF

## Next Steps

1. **Upload your first model**: Click 📤 Upload
2. **Organize with tags**: Edit model and add tags
3. **Test quick switching**: Use Model Switcher dropdown
4. **Open full library**: Click 📚 Library button
5. **Explore features**: Try search, filter, edit, delete

## Support & Resources

### Need Help?
- Check troubleshooting section above
- Review CUSTOM_MODEL_UPLOAD_GUIDE.md for upload help
- Check main README.md for general app documentation
- Review POSE_SYSTEM_GUIDE.md for pose workflows

### Related Features
- **Model Upload**: CUSTOM_MODEL_UPLOAD_GUIDE.md
- **Pose Management**: POSE_SYSTEM_GUIDE.md
- **Animation Timeline**: Use with loaded models
- **Preset Poses**: Apply to any loaded model

## Credits

Batch Model Management System developed by **C.R.G Studio** for professional character animation workflows.

---

**Happy Model Management! 🎬**

C.R.G Studio - Professional 3D Animation Tools
