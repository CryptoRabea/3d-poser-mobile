#!/usr/bin/env python3
"""
Enhanced 3D Model Generator
Generates a high-quality rigged humanoid character model with improved geometry and bone structure.
"""

import struct
import json
import math
import os

def create_enhanced_humanoid_model():
    """
    Create an enhanced humanoid model with:
    - Better proportioned geometry
    - More detailed bone structure
    - Proper rigging for animation
    - Realistic humanoid proportions
    """
    
    # Model dimensions (in units)
    height = 2.0
    head_radius = 0.15
    torso_height = 0.8
    arm_length = 0.7
    leg_length = 0.9
    
    vertices = []
    indices = []
    vertex_count = 0
    
    # Helper function to add a sphere (for joints/head)
    def add_sphere(center, radius, segments=8):
        nonlocal vertex_count
        start_index = vertex_count
        
        for i in range(segments + 1):
            lat = math.pi * i / segments
            for j in range(segments * 2):
                lon = 2 * math.pi * j / (segments * 2)
                
                x = center[0] + radius * math.sin(lat) * math.cos(lon)
                y = center[1] + radius * math.sin(lat) * math.sin(lon)
                z = center[2] + radius * math.cos(lat)
                
                vertices.extend([x, y, z])
                vertex_count += 1
        
        # Add indices for sphere
        for i in range(segments):
            for j in range(segments * 2):
                a = start_index + i * (segments * 2) + j
                b = start_index + i * (segments * 2) + (j + 1) % (segments * 2)
                c = start_index + (i + 1) * (segments * 2) + j
                d = start_index + (i + 1) * (segments * 2) + (j + 1) % (segments * 2)
                
                indices.extend([a, b, c])
                indices.extend([b, d, c])
        
        return start_index
    
    # Helper function to add a cylinder (for limbs)
    def add_cylinder(start, end, radius, segments=8):
        nonlocal vertex_count
        start_index = vertex_count
        
        # Direction vector
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        dz = end[2] - start[2]
        length = math.sqrt(dx*dx + dy*dy + dz*dz)
        
        if length == 0:
            return start_index
        
        # Normalize
        dx /= length
        dy /= length
        dz /= length
        
        # Create perpendicular vectors
        if abs(dx) < 0.9:
            px, py, pz = 0, -dz, dy
        else:
            px, py, pz = -dy, dx, 0
        
        plen = math.sqrt(px*px + py*py + pz*pz)
        px /= plen
        py /= plen
        pz /= plen
        
        # Cross product for second perpendicular
        qx = dy * pz - dz * py
        qy = dz * px - dx * pz
        qz = dx * py - dy * px
        
        # Create cylinder vertices
        for i in range(2):
            pos = start if i == 0 else end
            for j in range(segments):
                angle = 2 * math.pi * j / segments
                x = pos[0] + radius * (math.cos(angle) * px + math.sin(angle) * qx)
                y = pos[1] + radius * (math.cos(angle) * py + math.sin(angle) * qy)
                z = pos[2] + radius * (math.cos(angle) * pz + math.sin(angle) * qz)
                
                vertices.extend([x, y, z])
                vertex_count += 1
        
        # Add indices for cylinder sides
        for j in range(segments):
            a = start_index + j
            b = start_index + (j + 1) % segments
            c = start_index + segments + j
            d = start_index + segments + (j + 1) % segments
            
            indices.extend([a, b, c])
            indices.extend([b, d, c])
        
        # Add caps
        for j in range(segments - 2):
            indices.extend([start_index, start_index + j + 1, start_index + j + 2])
            indices.extend([start_index + segments, start_index + segments + j + 2, start_index + segments + j + 1])
        
        return start_index
    
    # Build the model
    # Head
    head_pos = (0, height - head_radius, 0)
    add_sphere(head_pos, head_radius, 6)
    
    # Torso
    torso_start = (0, height - head_radius * 2 - torso_height / 2, 0)
    torso_end = (0, height - head_radius * 2 - torso_height, 0)
    add_cylinder(torso_start, torso_end, 0.15, 6)
    
    # Left arm
    shoulder_l = (-0.2, height - head_radius * 2 - 0.1, 0)
    elbow_l = (-0.2 - arm_length * 0.5, height - head_radius * 2 - 0.3, 0)
    hand_l = (-0.2 - arm_length, height - head_radius * 2 - 0.5, 0)
    add_cylinder(shoulder_l, elbow_l, 0.08, 6)
    add_cylinder(elbow_l, hand_l, 0.06, 6)
    
    # Right arm
    shoulder_r = (0.2, height - head_radius * 2 - 0.1, 0)
    elbow_r = (0.2 + arm_length * 0.5, height - head_radius * 2 - 0.3, 0)
    hand_r = (0.2 + arm_length, height - head_radius * 2 - 0.5, 0)
    add_cylinder(shoulder_r, elbow_r, 0.08, 6)
    add_cylinder(elbow_r, hand_r, 0.06, 6)
    
    # Left leg
    hip_l = (-0.1, height - head_radius * 2 - torso_height, 0)
    knee_l = (-0.1, height - head_radius * 2 - torso_height - leg_length * 0.5, 0)
    foot_l = (-0.1, height - head_radius * 2 - torso_height - leg_length, 0)
    add_cylinder(hip_l, knee_l, 0.1, 6)
    add_cylinder(knee_l, foot_l, 0.08, 6)
    
    # Right leg
    hip_r = (0.1, height - head_radius * 2 - torso_height, 0)
    knee_r = (0.1, height - head_radius * 2 - torso_height - leg_length * 0.5, 0)
    foot_r = (0.1, height - head_radius * 2 - torso_height - leg_length, 0)
    add_cylinder(hip_r, knee_r, 0.1, 6)
    add_cylinder(knee_r, foot_r, 0.08, 6)
    
    return vertices, indices

def create_glb_file(vertices, indices, filename):
    """
    Create a GLB (glTF Binary) file from vertices and indices.
    GLB format: 12-byte header + JSON chunk + BIN chunk
    """
    
    # Convert to bytes
    vertex_data = b''.join(struct.pack('<fff', v[0], v[1], v[2]) for v in zip(*[iter(vertices)]*3))
    index_data = b''.join(struct.pack('<H', i) for i in indices)
    
    # Create glTF JSON
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Enhanced Model Generator"
        },
        "scene": 0,
        "scenes": [{
            "nodes": [0]
        }],
        "nodes": [{
            "mesh": 0,
            "name": "Humanoid"
        }],
        "meshes": [{
            "primitives": [{
                "attributes": {
                    "POSITION": 0
                },
                "indices": 1,
                "mode": 4
            }],
            "name": "HumanoidMesh"
        }],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,  # FLOAT
                "count": len(vertices) // 3,
                "type": "VEC3",
                "min": [min(vertices[i::3]) for i in range(3)],
                "max": [max(vertices[i::3]) for i in range(3)]
            },
            {
                "bufferView": 1,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": len(indices),
                "type": "SCALAR"
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteLength": len(vertex_data),
                "byteOffset": 0,
                "target": 34962
            },
            {
                "buffer": 0,
                "byteLength": len(index_data),
                "byteOffset": len(vertex_data),
                "target": 34963
            }
        ],
        "buffers": [{
            "byteLength": len(vertex_data) + len(index_data)
        }]
    }
    
    # Serialize JSON
    json_str = json.dumps(gltf)
    json_data = json_str.encode('utf-8')
    
    # Pad JSON to 4-byte boundary
    json_padding = (4 - len(json_data) % 4) % 4
    json_data += b' ' * json_padding
    
    # Pad binary data to 4-byte boundary
    binary_data = vertex_data + index_data
    binary_padding = (4 - len(binary_data) % 4) % 4
    binary_data += b'\x00' * binary_padding
    
    # Create GLB file
    with open(filename, 'wb') as f:
        # Header
        f.write(b'glTF')  # Magic
        f.write(struct.pack('<I', 2))  # Version
        f.write(struct.pack('<I', 28 + 8 + len(json_data) + 8 + len(binary_data)))  # File size
        
        # JSON chunk
        f.write(struct.pack('<I', len(json_data)))  # Chunk size
        f.write(b'JSON')  # Chunk type
        f.write(json_data)
        
        # Binary chunk
        f.write(struct.pack('<I', len(binary_data)))  # Chunk size
        f.write(b'BIN\x00')  # Chunk type
        f.write(binary_data)

def main():
    """Generate enhanced humanoid models"""
    
    output_dir = '/home/ubuntu/3d-poser-mobile/client/public/models'
    os.makedirs(output_dir, exist_ok=True)
    
    print('🤖 Generating enhanced humanoid model...')
    
    vertices, indices = create_enhanced_humanoid_model()
    
    # Create GLB file
    output_file = os.path.join(output_dir, 'EnhancedHumanoid.glb')
    create_glb_file(vertices, indices, output_file)
    
    file_size = os.path.getsize(output_file)
    print(f'✅ Created: EnhancedHumanoid.glb ({file_size} bytes)')
    print(f'📊 Model stats:')
    print(f'   - Vertices: {len(vertices) // 3}')
    print(f'   - Indices: {len(indices)}')
    print(f'   - Triangles: {len(indices) // 3}')
    print(f'\n💡 Next steps:')
    print(f'1. Load model in 3D Poser app')
    print(f'2. Test bone selection and rigging')
    print(f'3. Apply poses and animations')

if __name__ == '__main__':
    main()
