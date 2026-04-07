'use client';

import React, { useEffect, useRef, useState } from 'react';
import SavePoseModal from '@/components/SavePoseModal';
import PoseLibrary from '@/components/PoseLibrary';
import ImportExportPanel from '@/components/ImportExportPanel';
import { usePoseManager } from '@/hooks/usePoseManager';
import type { BoneTransform } from '@/lib/poseStorage';

/**
 * 3D Poser Mobile - APK-Compatible Animation & Rigging System
 * 
 * Design Philosophy: Touch-first mobile interface with Three.js 3D rendering
 * - Responsive canvas that adapts to screen size
 * - Touch-optimized controls for bone manipulation
 * - PWA-ready for APK packaging via Capacitor
 * - LocalStorage for rig/animation persistence
 * - Save/Load custom poses
 */

export default function Poser3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const orbitControlsRef = useRef<any>(null);
  const transformControlsRef = useRef<any>(null);

  const [currentModel, setCurrentModel] = useState<any>(null);
  const [selectedBone, setSelectedBone] = useState<any>(null);
  const [isXray, setIsXray] = useState(false);
  const [animations, setAnimations] = useState<Record<string, any>>({});
  const [currentMixer, setCurrentMixer] = useState<any>(null);
  const [isRigging, setIsRigging] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPoseLibrary, setShowPoseLibrary] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [modelName, setModelName] = useState('Untitled Model');

  // Pose management
  const poseManager = usePoseManager();

  // Initialize Three.js scene
  useEffect(() => {
    const initScene = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import Three.js modules
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        );
        camera.position.set(0, 1.5, 3);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        // Grid
        const grid = new THREE.GridHelper(10, 10, 0x000000, 0x555555);
        scene.add(grid);

        // Controls
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.target.set(0, 1, 0);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControlsRef.current = orbitControls;

        // Transform Controls
        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.setSize(2.0);
        // Don't add to scene - TransformControls manages its own objects
        transformControlsRef.current = transformControls;

        transformControls.addEventListener('dragging-changed', (event: any) => {
          orbitControls.enabled = !event.value;
        });

        // Handle window resize
        const handleResize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();

          if (currentMixer) {
            currentMixer.update(delta);
          }

          orbitControls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Store loaders for later use
        (window as any).THREE = THREE;
        (window as any).GLTFLoader = GLTFLoader;
        (window as any).DRACOLoader = DRACOLoader;

        return () => {
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          if (containerRef.current?.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
        };
      } catch (error) {
        console.error('Failed to initialize Three.js scene:', error);
      }
    };

    initScene();
  }, []);

  // Load 3D model
  const handleImportModel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sceneRef.current) return;

    setIsLoading(true);
    setModelName(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension

    try {
      const THREE = (window as any).THREE;
      const GLTFLoader = (window as any).GLTFLoader;
      const DRACOLoader = (window as any).DRACOLoader;

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);

      const url = URL.createObjectURL(file);
      loader.load(url, (gltf: any) => {
        if (currentModel) {
          sceneRef.current?.remove(currentModel);
        }

        const model = gltf.scene;
        sceneRef.current?.add(model);
        setCurrentModel(model);

        // Setup mixer for animations
        const mixer = new THREE.AnimationMixer(model);
        setCurrentMixer(mixer);

        // Load animations
        const animMap: Record<string, any> = {};
        gltf.animations.forEach((clip: any) => {
          animMap[clip.name] = clip;
        });
        setAnimations(animMap);

        URL.revokeObjectURL(url);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load model:', error);
      setIsLoading(false);
    }
  };

  // Start rigging process
  const handleStartRigging = () => {
    setIsRigging(true);
  };

  // Extract bone transforms from current model
  const extractBoneTransforms = (): BoneTransform[] => {
    if (!currentModel) return [];

    const bones: BoneTransform[] = [];
    const THREE = (window as any).THREE;

    currentModel.traverse((child: any) => {
      if (child.isBone || (child.type === 'Bone' || child.name.includes('Armature'))) {
        bones.push({
          name: child.name,
          position: { x: child.position.x, y: child.position.y, z: child.position.z },
          rotation: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
          scale: { x: child.scale.x, y: child.scale.y, z: child.scale.z },
        });
      }
    });

    return bones;
  };

  // Handle save pose
  const handleSavePose = async (
    name: string,
    description: string,
    bones: BoneTransform[],
    tags: string[]
  ) => {
    await poseManager.savePose(name, description, bones, modelName, tags);
  };

  // Handle load pose
  const handleLoadPose = async (pose: any) => {
    poseManager.setCurrentPose(pose);
    setShowPoseLibrary(false);
  };

  // Handle export all poses
  const handleExportAllPoses = () => {
    poseManager.exportAsFile();
  };

  // Handle import poses from file
  const handleImportPosesFromFile = async (file: File) => {
    return await poseManager.importFromFile(file);
  };

  // Reset view
  const handleReset = () => {
    if (cameraRef.current && orbitControlsRef.current) {
      cameraRef.current.position.set(0, 1.5, 3);
      orbitControlsRef.current.target.set(0, 1, 0);
      orbitControlsRef.current.reset();
    }
  };

  // Toggle X-ray mode
  const handleXray = () => {
    if (!currentModel) return;
    setIsXray(!isXray);
    const THREE = (window as any).THREE;
    currentModel.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.transparent = !isXray;
          child.material.opacity = !isXray ? 1 : 0.3;
        }
      }
    });
  };

  // Open save pose modal
  const openSavePoseModal = () => {
    if (!currentModel) {
      alert('Please load a model first');
      return;
    }
    setShowSaveModal(true);
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="absolute top-4 right-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Top Control Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
        <div className="flex flex-wrap gap-2 justify-center max-w-xs sm:max-w-md md:max-w-4xl">
          <label className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm cursor-pointer transition-colors">
            📁 Import
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleImportModel}
              disabled={isLoading}
              className="hidden"
            />
          </label>

          <button
            onClick={handleStartRigging}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            disabled={!currentModel}
          >
            🦴 Rig
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            ⟲ Reset
          </button>

          <button
            onClick={handleXray}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              isXray
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            disabled={!currentModel}
          >
            👁 X-Ray
          </button>

          <button
            onClick={openSavePoseModal}
            className="bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            disabled={!currentModel}
            title="Save current pose"
          >
            💾 Save
          </button>

          <button
            onClick={() => setShowPoseLibrary(true)}
            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Browse saved poses"
          >
            📚 Library
          </button>

          <button
            onClick={() => setShowImportExport(true)}
            className="bg-orange-700 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Import/Export poses"
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/60 backdrop-blur-sm text-white text-xs rounded p-3 border border-gray-700 max-w-xs">
        <p className="font-semibold mb-2">📖 Controls:</p>
        <p className="text-gray-300">• Drag to rotate</p>
        <p className="text-gray-300">• Pinch to zoom</p>
        <p className="text-gray-300">• Tap bones to select</p>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading model...</p>
          </div>
        </div>
      )}

      {/* Rigging Modal */}
      {isRigging && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">🦴 Create Bone Rig</h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                Welcome to the bone rigging system! This wizard will guide you through placing body landmarks to create an automatic bone rig for your character.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRigging(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsRigging(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentModel && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">👆 Tap "Import" to load a 3D model</p>
            <p className="text-gray-600 text-sm">Supports .glb and .gltf files</p>
          </div>
        </div>
      )}

      {/* Save Pose Modal */}
      <SavePoseModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePose}
        modelName={modelName}
        bones={extractBoneTransforms()}
        isLoading={poseManager.isLoading}
      />

      {/* Pose Library */}
      <PoseLibrary
        isOpen={showPoseLibrary}
        onClose={() => setShowPoseLibrary(false)}
        poses={poseManager.poses}
        onLoadPose={handleLoadPose}
        onDeletePose={async (id) => { await poseManager.deletePose(id); }}
        onExportPose={(id) => {
          const pose = poseManager.poses.find((p) => p.id === id);
          if (pose) {
            const json = JSON.stringify(pose, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${pose.name}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }}
        isLoading={poseManager.isLoading}
      />

      {/* Import/Export Panel */}
      <ImportExportPanel
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onExport={handleExportAllPoses}
        onImport={handleImportPosesFromFile}
        totalPoses={poseManager.poses.length}
        isLoading={poseManager.isLoading}
      />
    </div>
  );
}
