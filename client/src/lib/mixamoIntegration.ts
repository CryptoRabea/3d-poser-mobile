/**
 * Mixamo Integration Utilities
 * 
 * Provides utilities for discovering, downloading, and managing Mixamo models and animations.
 * Mixamo is Adobe's online platform for rigged 3D characters and motion capture animations.
 * 
 * Note: This implementation provides guidance on how to integrate with Mixamo.
 * For actual downloads, users will need to:
 * 1. Visit https://www.mixamo.com
 * 2. Sign in with Adobe ID
 * 3. Download models/animations in .glb format
 * 4. Import into 3D Poser using the Upload feature
 */

export interface MixamoModel {
  id: string;
  name: string;
  description: string;
  category: 'character' | 'creature' | 'humanoid' | 'fantasy' | 'sci-fi' | 'animals';
  rigged: boolean;
  animated: boolean;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface MixamoAnimation {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  fps: number;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface MixamoCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Popular Mixamo character categories
 */
export const MIXAMO_CATEGORIES: MixamoCategory[] = [
  {
    id: 'humanoid',
    name: 'Humanoid Characters',
    description: 'Human characters with realistic proportions',
    icon: '👤'
  },
  {
    id: 'fantasy',
    name: 'Fantasy Characters',
    description: 'Elves, dwarves, and fantasy creatures',
    icon: '🧙'
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi Characters',
    description: 'Futuristic and robotic characters',
    icon: '🤖'
  },
  {
    id: 'animals',
    name: 'Animals',
    description: 'Rigged animal models',
    icon: '🦁'
  }
];

/**
 * Popular Mixamo animation categories
 */
export const MIXAMO_ANIMATION_CATEGORIES: MixamoCategory[] = [
  {
    id: 'locomotion',
    name: 'Locomotion',
    description: 'Walking, running, and movement animations',
    icon: '🚶'
  },
  {
    id: 'idle',
    name: 'Idle',
    description: 'Standing and waiting animations',
    icon: '😌'
  },
  {
    id: 'action',
    name: 'Actions',
    description: 'Combat, jumping, and action animations',
    icon: '⚡'
  },
  {
    id: 'gesture',
    name: 'Gestures',
    description: 'Hand gestures and expressions',
    icon: '👋'
  },
  {
    id: 'emotion',
    name: 'Emotions',
    description: 'Emotional expressions and reactions',
    icon: '😊'
  }
];

/**
 * Popular Mixamo models (example data)
 * In a real implementation, these would be fetched from Mixamo API
 */
export const POPULAR_MIXAMO_MODELS: MixamoModel[] = [
  {
    id: 'mixamo-1',
    name: 'Mixamo Default Male',
    description: 'Standard male humanoid character with professional rigging',
    category: 'humanoid',
    rigged: true,
    animated: true,
    previewUrl: 'https://via.placeholder.com/200?text=Mixamo+Male'
  },
  {
    id: 'mixamo-2',
    name: 'Mixamo Default Female',
    description: 'Standard female humanoid character with professional rigging',
    category: 'humanoid',
    rigged: true,
    animated: true,
    previewUrl: 'https://via.placeholder.com/200?text=Mixamo+Female'
  },
  {
    id: 'mixamo-3',
    name: 'Mixamo Knight',
    description: 'Medieval knight character with armor',
    category: 'fantasy',
    rigged: true,
    animated: true,
    previewUrl: 'https://via.placeholder.com/200?text=Mixamo+Knight'
  },
  {
    id: 'mixamo-4',
    name: 'Mixamo Robot',
    description: 'Sci-fi robot character with mechanical rigging',
    category: 'sci-fi',
    rigged: true,
    animated: true,
    previewUrl: 'https://via.placeholder.com/200?text=Mixamo+Robot'
  },
  {
    id: 'mixamo-5',
    name: 'Mixamo Wolf',
    description: 'Rigged wolf animal model',
    category: 'animals',
    rigged: true,
    animated: true,
    previewUrl: 'https://via.placeholder.com/200?text=Mixamo+Wolf'
  }
];

/**
 * Popular Mixamo animations (example data)
 */
export const POPULAR_MIXAMO_ANIMATIONS: MixamoAnimation[] = [
  {
    id: 'anim-1',
    name: 'Walking',
    description: 'Natural walking animation',
    category: 'locomotion',
    duration: 2.0,
    fps: 30
  },
  {
    id: 'anim-2',
    name: 'Running',
    description: 'Fast running animation',
    category: 'locomotion',
    duration: 1.5,
    fps: 30
  },
  {
    id: 'anim-3',
    name: 'Idle',
    description: 'Standing idle animation',
    category: 'idle',
    duration: 3.0,
    fps: 30
  },
  {
    id: 'anim-4',
    name: 'Jump',
    description: 'Jumping animation',
    category: 'action',
    duration: 1.0,
    fps: 30
  },
  {
    id: 'anim-5',
    name: 'Wave',
    description: 'Waving gesture',
    category: 'gesture',
    duration: 1.5,
    fps: 30
  },
  {
    id: 'anim-6',
    name: 'Dance',
    description: 'Dancing animation',
    category: 'emotion',
    duration: 2.5,
    fps: 30
  }
];

/**
 * Get Mixamo models by category
 */
export function getMixamoModelsByCategory(category: string): MixamoModel[] {
  return POPULAR_MIXAMO_MODELS.filter(model => model.category === category);
}

/**
 * Get Mixamo animations by category
 */
export function getMixamoAnimationsByCategory(category: string): MixamoAnimation[] {
  return POPULAR_MIXAMO_ANIMATIONS.filter(anim => anim.category === category);
}

/**
 * Search Mixamo models by name
 */
export function searchMixamoModels(query: string): MixamoModel[] {
  const lowerQuery = query.toLowerCase();
  return POPULAR_MIXAMO_MODELS.filter(model =>
    model.name.toLowerCase().includes(lowerQuery) ||
    model.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search Mixamo animations by name
 */
export function searchMixamoAnimations(query: string): MixamoAnimation[] {
  const lowerQuery = query.toLowerCase();
  return POPULAR_MIXAMO_ANIMATIONS.filter(anim =>
    anim.name.toLowerCase().includes(lowerQuery) ||
    anim.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Generate Mixamo download instructions
 */
export function getMixamoDownloadInstructions(): string {
  return `
# How to Download from Mixamo

1. **Visit Mixamo Website**
   - Go to https://www.mixamo.com
   - Sign in with your Adobe ID (or create a free account)

2. **Browse Characters**
   - Click "Characters" to browse available models
   - Filter by category or search for specific models
   - Click on a character to view details

3. **Download Character**
   - Click "Download" button
   - Select format: **glTF Binary (.glb)** for best compatibility
   - Choose "With Skin" for textured models
   - Download the file

4. **Import into 3D Poser**
   - Open 3D Poser Mobile app
   - Click "📤 Upload" button
   - Select the downloaded .glb file
   - Character will load with full rigging

5. **Browse Animations**
   - On Mixamo, click "Animations"
   - Search for animations you want
   - Download in .glb format

6. **Apply Animations**
   - Upload animation files to 3D Poser
   - Use Timeline to apply animations to your character

## Tips

- Free account includes access to thousands of models and animations
- All Mixamo models come with professional rigging
- Animations are compatible with standard humanoid rigs
- Download in .glb format for best compatibility with 3D Poser
- You can mix and match models with animations from different sources
  `;
}

/**
 * Get Mixamo API documentation
 */
export function getMixamoAPIDocumentation(): string {
  return `
# Mixamo API Documentation

## Overview
Mixamo provides a REST API for programmatic access to their character and animation library.

## Authentication
- Requires Adobe OAuth 2.0 authentication
- Obtain API credentials from Adobe Developer Console

## Endpoints

### Characters
- GET /api/v1/characters - List all characters
- GET /api/v1/characters/{id} - Get character details
- GET /api/v1/characters/{id}/download - Download character

### Animations
- GET /api/v1/animations - List all animations
- GET /api/v1/animations/{id} - Get animation details
- GET /api/v1/animations/{id}/download - Download animation

## Response Format
All responses are in JSON format with the following structure:
\`\`\`json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "previewUrl": "string",
  "downloadUrl": "string"
}
\`\`\`

## Rate Limiting
- 100 requests per minute per API key
- Implement exponential backoff for retries

## Error Handling
- 401: Unauthorized - Check API credentials
- 404: Not found - Resource doesn't exist
- 429: Too many requests - Rate limit exceeded
- 500: Server error - Try again later

## Integration Example
See MixamoDownloader component for example implementation.
  `;
}

/**
 * Format Mixamo model for display
 */
export function formatMixamoModel(model: MixamoModel): string {
  return `${model.name}\n${model.description}\nCategory: ${model.category}`;
}

/**
 * Format Mixamo animation for display
 */
export function formatMixamoAnimation(anim: MixamoAnimation): string {
  return `${anim.name}\n${anim.description}\nDuration: ${anim.duration}s @ ${anim.fps} FPS`;
}
