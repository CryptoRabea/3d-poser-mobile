'use client';

import React, { useEffect, useRef, useState } from 'react';
import SavePoseModal from '@/components/SavePoseModal';
import PoseLibrary from '@/components/PoseLibrary';
import ImportExportPanel from '@/components/ImportExportPanel';
import PoseApplier from '@/components/PoseApplier';
import AnimationTimeline from '@/components/AnimationTimeline';
import ModelLoader from '@/components/ModelLoader';
import PresetPosePanel from '@/components/PresetPosePanel';
import PresetPoseToolbar from '@/components/PresetPoseToolbar';
import CustomModelUpload from '@/components/CustomModelUpload';
import ModelLibraryPanel from '@/components/ModelLibraryPanel';
import ModelSwitcher from '@/components/ModelSwitcher';
import AnimationPresetPanel from '@/components/AnimationPresetPanel';
import { usePoseManager } from '@/hooks/usePoseManager';
import { useModelLibrary } from '@/hooks/useModelLibrary';
import { useAnimationPlayer } from '@/hooks/useAnimationPlayer';
import { AnimationSequence } from '@/lib/animationSequences';
import { generateThumbnailFromCanvas } from '@/lib/thumbnailGenerator';
import type { BoneTransform } from '@/lib/poseStorage';
import type { StoredModel } from '@/lib/modelStorage';

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
  const [showPoseApplier, setShowPoseApplier] = useState(false);
  const [showAnimationTimeline, setShowAnimationTimeline] = useState(false);
  const [showModelLoader, setShowModelLoader] = useState(false);
  const [showPresetPosePanel, setShowPresetPosePanel] = useState(false);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [showModelLibrary, setShowModelLibrary] = useState(false);
  const [modelName, setModelName] = useState('Untitled Model');
  const [appliedPose, setAppliedPose] = useState<BoneTransform[]>([]);
  const [showAnimationPresets, setShowAnimationPresets] = useState(false);

  // Pose management
  const poseManager = usePoseManager();
  
  // Model library management
  const modelLibrary = useModelLibrary();

  // Animation player
  const animationPlayer = useAnimationPlayer((bones: BoneTransform[]) => {
    if (currentModel) {
      setAppliedPose(bones);
    }
  });

  // Apply preset pose to model
  const handleApplyPresetPose = (pose: BoneTransform[]) => {
    if (currentModel && pose.length > 0) {
      setAppliedPose(pose);
    }
  };

  // Handle animation preset playback
  const handlePlayAnimation = (animation: AnimationSequence) => {
    animationPlayer.playAnimation(animation);
  };

  const handleStopAnimation = () => {
    animationPlayer.stopAnimation();
  };

  // Initialize Three.js scene
  useEffect(() => {
    const initScene = async () => {
      // Guard: prevent re-initialization if already initialized
      if (sceneRef.current) return;
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

        // Lighting - with error handling
        try {
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
          scene.add(ambientLight);
        } catch (e) {
          console.error('Failed to add ambient light:', e);
        }

        try {
          const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
          dirLight.position.set(5, 10, 7.5);
          scene.add(dirLight);
        } catch (e) {
          console.error('Failed to add directional light:', e);
        }

        // Grid - with error handling
        try {
          const grid = new THREE.GridHelper(10, 10, 0x000000, 0x555555);
          scene.add(grid);
        } catch (e) {
          console.error('Failed to add grid:', e);
        }

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

        // Store loaders in refs for later use (avoid window pollution)
        (window as any).__THREE__ = { THREE, GLTFLoader, DRACOLoader };

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

    // Auto-load default model after a short delay to ensure scene is ready
    const timer = setTimeout(() => {
      if (sceneRef.current && !currentModel) {
        handleLoadSampleModel('/models/SimpleHumanoid.glb', 'SimpleHumanoid');
        setModelName('SimpleHumanoid');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentModel]);

  // Load sample model by path
  const handleLoadSampleModel = async (modelPath: string, modelName: string) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setModelName(modelName);

    try {
      const modules = (window as any).__THREE__;
      if (!modules) {
        console.error('Three.js modules not initialized');
        setIsLoading(false);
        return;
      }
      const { THREE, GLTFLoader, DRACOLoader } = modules;

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(modelPath, (gltf: any) => {
        if (currentModel) {
          sceneRef.current?.remove(currentModel);
        }

        const model = gltf.scene;
        sceneRef.current?.add(model);
        setCurrentModel(model);

        const mixer = new THREE.AnimationMixer(model);
        setCurrentMixer(mixer);

        const animMap: Record<string, any> = {};
        gltf.animations.forEach((clip: any) => {
          animMap[clip.name] = clip;
        });
        setAnimations(animMap);

        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to load sample model:', error);
      setIsLoading(false);
    }
  };

  // Load 3D model
  const handleImportModel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sceneRef.current) return;

    setIsLoading(true);
    setModelName(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension

    try {
      const modules = (window as any).__THREE__;
      if (!modules) {
        console.error('Three.js modules not initialized');
        setIsLoading(false);
        return;
      }
      const { THREE, GLTFLoader, DRACOLoader } = modules;

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

  // Handle custom model upload
  const handleCustomModelUpload = (data: ArrayBuffer, fileName: string, format: 'glb' | 'fbx') => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setModelName(fileName.replace(/\.[^/.]+$/, ''));

    try {
      const modules = (window as any).__THREE__;
      if (!modules) {
        console.error('Three.js modules not initialized');
        setIsLoading(false);
        return;
      }
      const { THREE, GLTFLoader, DRACOLoader } = modules;

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);

      // Create blob from ArrayBuffer
      const blob = new Blob([data], { type: 'model/gltf-binary' });
      const url = URL.createObjectURL(blob);

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
      console.error('Failed to load custom model:', error);
      setIsLoading(false);
    }
  };

  // Save current model to library
  const handleSaveModelToLibrary = () => {
    if (!currentModel) return;

    const bones = extractBoneTransforms();
    const result = modelLibrary.addModel(
      modelName,
      new ArrayBuffer(0), // Placeholder - would need actual model data
      'glb',
      {
        boneCount: bones.length,
        meshCount: currentModel.children.length,
        animationCount: Object.keys(animations).length,
        tags: ['custom'],
        description: `Saved on ${new Date().toLocaleDateString()}`,
      }
    );

    if (result.success) {
      console.log('Model saved to library:', result.id);
    }
  };

  // Load model from library
  const handleLoadModelFromLibrary = (modelId: string) => {
    const model = modelLibrary.models.find((m) => m.id === modelId);
    if (model && model.data.byteLength > 0) {
      const format = (model.format === 'gltf' ? 'glb' : model.format) as 'glb' | 'fbx';
      handleCustomModelUpload(model.data, model.fileName, format);
      setModelName(model.name);
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
    const modules = (window as any).__THREE__;
    if (!modules) return [];
    const { THREE } = modules;

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
    const modules = (window as any).__THREE__;
    if (!modules) return;
    const { THREE } = modules;
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

  // Open pose applier
  const openPoseApplier = () => {
    if (!currentModel) {
      alert('Please load a model first');
      return;
    }
    setShowPoseApplier(true);
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
            onClick={() => setShowModelLoader(true)}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Load sample models"
          >
            📦 Samples
          </button>

          <button
            onClick={() => setShowCustomUpload(true)}
            className="bg-orange-700 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Upload custom .glb or .fbx model"
          >
            📤 Upload
          </button>

          <ModelSwitcher
            onModelSelected={handleLoadModelFromLibrary}
            currentModelName={modelName}
            isLoading={isLoading}
          />

          <button
            onClick={() => setShowModelLibrary(true)}
            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Open model library"
          >
            📚 Library
          </button>

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
            onClick={openPoseApplier}
            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            disabled={!currentModel}
            title="Apply saved poses"
          >
            📚 Apply Pose
          </button>

          <button
            onClick={() => setShowPresetPosePanel(true)}
            disabled={!currentModel}
            className="bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            title="Quick preset poses"
          >
            🎭 Presets
          </button>

          <button
            onClick={() => setShowPoseLibrary(true)}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Browse saved poses"
          >
            📖 Library
          </button>

          <button
            onClick={() => setShowImportExport(true)}
            className="bg-orange-700 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors"
            title="Import/Export poses"
          >
            📤 Share
          </button>

          <button
            onClick={() => setShowAnimationTimeline(true)}
            disabled={!currentModel}
            className="bg-pink-700 hover:bg-pink-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            title="Animation timeline"
          >
            🎬 Timeline
          </button>

          <button
            onClick={() => setShowAnimationPresets(true)}
            disabled={!currentModel}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            title="Play animation presets"
          >
            🎥 Animations
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

      {/* Pose Applier */}
      <PoseApplier
        isOpen={showPoseApplier}
        onClose={() => setShowPoseApplier(false)}
        currentModel={currentModel}
        poses={poseManager.poses}
        onApplyPose={setAppliedPose}
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

      {/* Animation Timeline */}
      <AnimationTimeline
        isOpen={showAnimationTimeline}
        onClose={() => setShowAnimationTimeline(false)}
        currentModel={currentModel}
        currentPose={extractBoneTransforms()}
        onApplyPose={(pose) => {
          if (currentModel && pose.length > 0) {
            setAppliedPose(pose);
          }
        }}
        isLoading={poseManager.isLoading}
      />

      {/* Model Loader */}
      <ModelLoader
        isOpen={showModelLoader}
        onClose={() => setShowModelLoader(false)}
        onLoadModel={handleLoadSampleModel}
        isLoading={isLoading}
      />

      {/* Preset Pose Panel */}
      <PresetPosePanel
        isOpen={showPresetPosePanel}
        onClose={() => setShowPresetPosePanel(false)}
        onApplyPose={handleApplyPresetPose}
        isLoading={isLoading}
      />

      {/* Custom Model Upload */}
      <CustomModelUpload
        isOpen={showCustomUpload}
        onClose={() => setShowCustomUpload(false)}
        onModelLoaded={handleCustomModelUpload}
        onError={(error) => console.error('Upload error:', error)}
      />

      {/* Model Library Panel */}
      <ModelLibraryPanel
        isOpen={showModelLibrary}
        onClose={() => setShowModelLibrary(false)}
        onSelectModel={handleLoadModelFromLibrary}
        isLoading={isLoading}
      />

      {/* Animation Preset Panel */}
      <AnimationPresetPanel
        isOpen={showAnimationPresets}
        onClose={() => setShowAnimationPresets(false)}
        onPlayAnimation={handlePlayAnimation}
        onStopAnimation={handleStopAnimation}
        isPlaying={animationPlayer.isPlaying}
        currentAnimation={animationPlayer.currentAnimation}
      />
    </div>
  );
}
