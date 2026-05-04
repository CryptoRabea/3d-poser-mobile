#!/usr/bin/env python3

"""
Generate simple humanoid 3D models in .glb format for testing
Usage: python3 scripts/generate_models.py
"""

import json
import struct
import os
from pathlib import Path

# Create output directory
output_dir = Path(__file__).parent.parent / 'client' / 'public' / 'models'
output_dir.mkdir(parents=True, exist_ok=True)

print(f"📁 Output directory: {output_dir}")


def create_simple_humanoid_glb(filename, scale=1.0):
    """Create a simple humanoid model and export as .glb"""
    
    # Define vertices for a simple humanoid
    vertices = [
        # Head (cube)
        [-0.15*scale, 1.8*scale, -0.15*scale],
        [0.15*scale, 1.8*scale, -0.15*scale],
        [0.15*scale, 2.1*scale, -0.15*scale],
        [-0.15*scale, 2.1*scale, -0.15*scale],
        [-0.15*scale, 1.8*scale, 0.15*scale],
        [0.15*scale, 1.8*scale, 0.15*scale],
        [0.15*scale, 2.1*scale, 0.15*scale],
        [-0.15*scale, 2.1*scale, 0.15*scale],
        
        # Torso (cube)
        [-0.2*scale, 0.9*scale, -0.1*scale],
        [0.2*scale, 0.9*scale, -0.1*scale],
        [0.2*scale, 1.8*scale, -0.1*scale],
        [-0.2*scale, 1.8*scale, -0.1*scale],
        [-0.2*scale, 0.9*scale, 0.1*scale],
        [0.2*scale, 0.9*scale, 0.1*scale],
        [0.2*scale, 1.8*scale, 0.1*scale],
        [-0.2*scale, 1.8*scale, 0.1*scale],
        
        # Left arm
        [-0.5*scale, 1.5*scale, -0.05*scale],
        [-0.3*scale, 1.5*scale, -0.05*scale],
        [-0.3*scale, 0.9*scale, -0.05*scale],
        [-0.5*scale, 0.9*scale, -0.05*scale],
        [-0.5*scale, 1.5*scale, 0.05*scale],
        [-0.3*scale, 1.5*scale, 0.05*scale],
        [-0.3*scale, 0.9*scale, 0.05*scale],
        [-0.5*scale, 0.9*scale, 0.05*scale],
        
        # Right arm
        [0.3*scale, 1.5*scale, -0.05*scale],
        [0.5*scale, 1.5*scale, -0.05*scale],
        [0.5*scale, 0.9*scale, -0.05*scale],
        [0.3*scale, 0.9*scale, -0.05*scale],
        [0.3*scale, 1.5*scale, 0.05*scale],
        [0.5*scale, 1.5*scale, 0.05*scale],
        [0.5*scale, 0.9*scale, 0.05*scale],
        [0.3*scale, 0.9*scale, 0.05*scale],
        
        # Left leg
        [-0.15*scale, 0, -0.1*scale],
        [0.05*scale, 0, -0.1*scale],
        [0.05*scale, 0.9*scale, -0.1*scale],
        [-0.15*scale, 0.9*scale, -0.1*scale],
        [-0.15*scale, 0, 0.1*scale],
        [0.05*scale, 0, 0.1*scale],
        [0.05*scale, 0.9*scale, 0.1*scale],
        [-0.15*scale, 0.9*scale, 0.1*scale],
        
        # Right leg
        [-0.05*scale, 0, -0.1*scale],
        [0.15*scale, 0, -0.1*scale],
        [0.15*scale, 0.9*scale, -0.1*scale],
        [-0.05*scale, 0.9*scale, -0.1*scale],
        [-0.05*scale, 0, 0.1*scale],
        [0.15*scale, 0, 0.1*scale],
        [0.15*scale, 0.9*scale, 0.1*scale],
        [-0.05*scale, 0.9*scale, 0.1*scale],
    ]
    
    # Define faces (triangles)
    faces = []
    
    # Helper function to add cube faces
    def add_cube_faces(start_idx):
        faces.extend([
            # Front
            [start_idx, start_idx+1, start_idx+2],
            [start_idx, start_idx+2, start_idx+3],
            # Back
            [start_idx+4, start_idx+6, start_idx+5],
            [start_idx+4, start_idx+7, start_idx+6],
            # Top
            [start_idx+2, start_idx+6, start_idx+7],
            [start_idx+2, start_idx+7, start_idx+3],
            # Bottom
            [start_idx, start_idx+5, start_idx+4],
            [start_idx, start_idx+1, start_idx+5],
            # Left
            [start_idx+4, start_idx+7, start_idx+3],
            [start_idx+4, start_idx+3, start_idx+0],
            # Right
            [start_idx+1, start_idx+6, start_idx+5],
            [start_idx+1, start_idx+2, start_idx+6],
        ])
    
    # Add faces for each body part
    add_cube_faces(0)   # Head
    add_cube_faces(8)   # Torso
    add_cube_faces(16)  # Left arm
    add_cube_faces(24)  # Right arm
    add_cube_faces(32)  # Left leg
    add_cube_faces(40)  # Right leg
    
    # Flatten vertices and faces
    vertices_flat = []
    for v in vertices:
        vertices_flat.extend(v)
    
    faces_flat = []
    for f in faces:
        faces_flat.extend(f)
    
    # Create minimal glTF structure
    gltf = {
        "asset": {"version": "2.0"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [
            {
                "mesh": 0,
                "name": "Humanoid"
            }
        ],
        "meshes": [
            {
                "primitives": [
                    {
                        "attributes": {"POSITION": 0},
                        "indices": 1,
                        "material": 0
                    }
                ]
            }
        ],
        "materials": [
            {
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.5, 0.5, 0.5, 1.0],
                    "metallicFactor": 0.3,
                    "roughnessFactor": 0.7
                }
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,  # FLOAT
                "count": len(vertices),
                "type": "VEC3",
                "min": [-0.5*scale, 0, -0.15*scale],
                "max": [0.5*scale, 2.1*scale, 0.15*scale]
            },
            {
                "bufferView": 1,
                "componentType": 5125,  # UNSIGNED_INT
                "count": len(faces_flat),
                "type": "SCALAR"
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteStride": 12,
                "target": 34962
            },
            {
                "buffer": 0,
                "byteOffset": len(vertices_flat) * 4,
                "byteLength": len(faces_flat) * 4,
                "target": 34963
            }
        ],
        "buffers": [
            {
                "byteLength": len(vertices_flat) * 4 + len(faces_flat) * 4
            }
        ]
    }
    
    # Create binary buffer
    buffer_data = bytearray()
    
    # Add vertices as floats
    for v in vertices_flat:
        buffer_data.extend(struct.pack('<f', v))
    
    # Add faces as unsigned ints
    for f in faces_flat:
        buffer_data.extend(struct.pack('<I', f))
    
    # Encode JSON
    json_str = json.dumps(gltf)
    json_bytes = json_str.encode('utf-8')
    
    # Pad JSON to 4-byte boundary
    json_padding = (4 - len(json_bytes) % 4) % 4
    json_bytes += b' ' * json_padding
    
    # Create GLB file
    glb_data = bytearray()
    
    # Header
    glb_data.extend(b'glTF')  # Magic
    glb_data.extend(struct.pack('<I', 2))  # Version
    glb_data.extend(struct.pack('<I', 28 + len(json_bytes) + len(buffer_data)))  # File size
    
    # JSON chunk
    glb_data.extend(struct.pack('<I', len(json_bytes)))  # Chunk size
    glb_data.extend(b'JSON')  # Chunk type
    glb_data.extend(json_bytes)
    
    # Binary chunk
    glb_data.extend(struct.pack('<I', len(buffer_data)))  # Chunk size
    glb_data.extend(b'BIN\x00')  # Chunk type
    glb_data.extend(buffer_data)
    
    # Write file
    filepath = output_dir / filename
    with open(filepath, 'wb') as f:
        f.write(glb_data)
    
    print(f"✅ Created: {filename} ({len(glb_data)} bytes)")
    return filepath


def main():
    print("🤖 Generating humanoid models...\n")
    
    try:
        # Create models
        models = [
            ('SimpleHumanoid.glb', 1.0),
            ('TallHumanoid.glb', 1.2),
            ('CompactHumanoid.glb', 0.8),
        ]
        
        for filename, scale in models:
            create_simple_humanoid_glb(filename, scale)
        
        print(f"\n✨ Model generation complete!")
        print(f"📂 Models saved to: {output_dir}")
        print("\n💡 Next steps:")
        print("1. Import models into 3D Poser app")
        print("2. Test bone selection and rigging")
        print("3. Create and save poses")
        print("4. Record animations with timeline")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


if __name__ == '__main__':
    main()
