import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  loadModelFromFile,
  getSupportedFormats,
  isValidModelFormat,
  getFormatFromFilename,
} from '@/lib/modelFormatLoaders';

interface EnhancedModelUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onModelLoaded: (model: any, name: string) => void;
  onError: (error: Error) => void;
  isLoading?: boolean;
}

export function EnhancedModelUpload({
  isOpen,
  onClose,
  onModelLoaded,
  onError,
  isLoading = false,
}: EnhancedModelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    format: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!isValidModelFormat(file.name)) {
      onError(new Error(`Unsupported format. Supported: ${getSupportedFormats().join(', ')}`));
      return;
    }

    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      format: getFormatFromFilename(file.name)?.toUpperCase() || 'UNKNOWN',
    });
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setUploadProgress(10);

      // Load the model
      const model = await loadModelFromFile(selectedFile);
      setUploadProgress(80);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(100);

      // Call callback
      onModelLoaded(model.scene, model.name);

      // Reset state
      setTimeout(() => {
        setSelectedFile(null);
        setFileInfo(null);
        setUploadProgress(0);
        onClose();
      }, 500);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      onError(err);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    target.style.borderColor = '#ef4444';
    target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    target.style.borderColor = '#666';
    target.style.backgroundColor = 'transparent';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    target.style.borderColor = '#666';
    target.style.backgroundColor = 'transparent';

    const file = e.dataTransfer.files?.[0];
      if (file) {
        const event = {
          target: { files: e.dataTransfer.files } as any,
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>📤</span>
            Upload 3D Model
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Supported Formats Info */}
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
            <p className="text-sm text-blue-300 font-semibold mb-2">✓ Supported Formats:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-200">
              <div>
                <span className="font-semibold">OBJ</span> - Wavefront Object
              </div>
              <div>
                <span className="font-semibold">FBX</span> - Autodesk FBX
              </div>
              <div>
                <span className="font-semibold">GLB</span> - GL Transmission Format (Binary)
              </div>
              <div>
                <span className="font-semibold">GLTF</span> - GL Transmission Format
              </div>
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-red-500 hover:bg-red-900/10"
            style={{}}
          >
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-300 font-semibold mb-1">Drag and drop your model here</p>
            <p className="text-gray-500 text-sm">or click to browse</p>
            <p className="text-gray-600 text-xs mt-2">Max file size: 100 MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={getSupportedFormats().join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Info */}
          {fileInfo && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Filename:</span>
                <span className="text-sm font-semibold text-white">{fileInfo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Format:</span>
                <span className="text-sm font-semibold text-red-400">{fileInfo.format}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Size:</span>
                <span className="text-sm font-semibold text-white">{fileInfo.size}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Processing...</span>
                <span className="text-sm font-semibold text-red-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-2">
            <p>
              <span className="text-red-400 font-semibold">💡 Tips:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>OBJ files are automatically converted to GLB format</li>
              <li>FBX files with animations will preserve skeleton data</li>
              <li>Ensure your model has proper UV mapping for best results</li>
              <li>Large files may take longer to process</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? '⏳ Processing...' : '✓ Upload Model'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
