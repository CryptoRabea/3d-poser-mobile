import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import {
  readFileAsArrayBuffer,
  formatFileSize,
  extractModelName,
  requiresConversion,
} from '@/lib/modelUpload';
import type { ModelUploadResult } from '@/lib/modelUpload';

interface CustomModelUploadProps {
  onModelLoaded: (data: ArrayBuffer | string, fileName: string, format: 'glb' | 'fbx' | 'obj') => void;
  onError?: (error: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Custom Model Upload Component
 * Allows users to upload .glb or .fbx models with drag-and-drop support
 */
export default function CustomModelUpload({
  onModelLoaded,
  onError,
  isOpen = true,
  onClose,
}: CustomModelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ModelUploadResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await readFileAsArrayBuffer(file);
      setUploadResult(result);

      if (result.success && result.data && result.format !== 'unknown') {
        // Check if format requires conversion
        if (requiresConversion(result.format)) {
          onError?.(`${result.format.toUpperCase()} format requires conversion. Please convert to GLB first.`);
        } else if (result.data) {
          onModelLoaded(result.data, result.fileName, result.format as 'glb' | 'fbx' | 'obj');
          // Reset after successful load
          setTimeout(() => {
            setUploadResult(null);
            onClose?.();
          }, 1500);
        } else {
          onError?.('Failed to load model: No data received');
        }
      } else {
        onError?.(result.error || 'Failed to load model');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMsg);
      setUploadResult({
        success: false,
        fileName: file.name,
        fileSize: file.size,
        format: 'unknown',
        error: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-red-500" />
            Upload Custom Model
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadResult ? (
            <>
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-white font-medium mb-1">
                  Drag and drop your model here
                </p>
                <p className="text-gray-400 text-sm mb-4">or click to browse</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.fbx,.gltf"
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={isLoading}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Select File'
                  )}
                </button>
              </div>

              {/* Format Info */}
              <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-300">
                <p className="font-medium mb-1">Supported Formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>.glb (recommended) - Binary glTF format</li>
                  <li>.fbx - Autodesk FBX format (requires conversion)</li>
                  <li>.gltf - Text-based glTF format</li>
                </ul>
                <p className="mt-2 text-xs">Maximum file size: 50 MB</p>
              </div>
            </>
          ) : (
            <>
              {/* Upload Result */}
              <div className="space-y-4">
                {uploadResult.success ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-green-900/30 border border-green-700 rounded">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-green-400 font-medium">Model loaded successfully!</p>
                        <p className="text-green-300 text-sm">
                          {extractModelName(uploadResult.fileName)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-700 rounded text-sm text-gray-300 space-y-1">
                      <p>
                        <span className="text-gray-400">Format:</span>{' '}
                        <span className="text-white font-medium">{uploadResult.format.toUpperCase()}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Size:</span>{' '}
                        <span className="text-white font-medium">
                          {formatFileSize(uploadResult.fileSize)}
                        </span>
                      </p>
                    </div>

                    <p className="text-center text-gray-400 text-sm">
                      Preparing model for editing...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-red-900/30 border border-red-700 rounded">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium">Upload failed</p>
                        <p className="text-red-300 text-sm">{uploadResult.error}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setUploadResult(null)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
                    >
                      Try Another File
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
