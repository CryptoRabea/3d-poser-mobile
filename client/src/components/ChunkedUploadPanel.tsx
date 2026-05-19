import React, { useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Pause, Play, X } from 'lucide-react';
import {
  ChunkedUploader,
  formatBytes,
  formatTime,
  calculateSpeed,
  type UploadProgress,
} from '@/lib/chunkedUpload';

interface ChunkedUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (data: ArrayBuffer, fileName: string) => void;
  onError: (error: string) => void;
  minFileSizeForChunking?: number; // Default: 100MB
}

export function ChunkedUploadPanel({
  isOpen,
  onClose,
  onUploadComplete,
  onError,
  minFileSizeForChunking = 100 * 1024 * 1024,
}: ChunkedUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<ChunkedUploader | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['obj', 'fbx', 'glb', 'gltf'].includes(extension || '')) {
      onError(`Unsupported format: .${extension}. Supported: OBJ, FBX, GLB, GLTF`);
      return;
    }

    setSelectedFile(file);
    setProgress(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFileSelect(file);
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
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setIsPaused(false);

      // Create uploader for this file
      uploaderRef.current = new ChunkedUploader({
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        maxConcurrentChunks: 3,
        maxRetries: 3,
        retryDelay: 1000,
      });

      // Upload file
      const result = await uploaderRef.current.uploadFile(selectedFile, setProgress);

      if (result.success && result.data) {
        onUploadComplete(result.data, selectedFile.name);

        // Reset state
        setTimeout(() => {
          setSelectedFile(null);
          setProgress(null);
          setIsUploading(false);
          onClose();
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onError(errorMessage);
      setIsUploading(false);
    }
  };

  const handlePause = () => {
    if (uploaderRef.current) {
      if (isPaused) {
        uploaderRef.current.resume();
        setIsPaused(false);
      } else {
        uploaderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleCancel = () => {
    if (uploaderRef.current) {
      uploaderRef.current.cancel();
    }
    setSelectedFile(null);
    setProgress(null);
    setIsUploading(false);
    setIsPaused(false);
    onClose();
  };

  const shouldUseChunking = selectedFile && selectedFile.size > minFileSizeForChunking;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span>📤</span>
            {shouldUseChunking ? 'Chunked Upload (Large File)' : 'Upload 3D Model'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Banner */}
          {shouldUseChunking && (
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                ✓ Large file detected ({formatBytes(selectedFile?.size || 0)}) - Using chunked upload
                for better reliability
              </p>
            </div>
          )}

          {/* File Selection Area */}
          {!isUploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-red-500 hover:bg-red-900/10"
            >
              <div className="text-4xl mb-3">📁</div>
              <p className="text-gray-300 font-semibold mb-1">Drag and drop your model here</p>
              <p className="text-gray-500 text-sm">or click to browse</p>
              <p className="text-gray-600 text-xs mt-2">Max file size: 1GB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".obj,.fbx,.glb,.gltf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Filename:</span>
                <span className="text-sm font-semibold text-white">{selectedFile.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">File Size:</span>
                <span className="text-sm font-semibold text-red-400">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
              {shouldUseChunking && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Chunks:</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {Math.ceil(selectedFile.size / (5 * 1024 * 1024))} chunks @ 5MB each
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {progress && (
            <div className="space-y-3 bg-gray-800 rounded-lg p-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-red-400">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Uploaded</p>
                  <p className="text-white font-semibold">
                    {formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalBytes)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Speed</p>
                  <p className="text-white font-semibold">
                    {calculateSpeed(progress.speed).toFixed(1)} Mbps
                  </p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Chunk</p>
                  <p className="text-white font-semibold">
                    {progress.currentChunk} / {progress.totalChunks}
                  </p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">ETA</p>
                  <p className="text-white font-semibold">
                    {formatTime(progress.estimatedTimeRemaining)}
                  </p>
                </div>
              </div>

              {/* Status Message */}
              <div className="flex items-center gap-2">
                {progress.status === 'uploading' && (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400">Uploading...</span>
                  </>
                )}
                {progress.status === 'paused' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-sm text-yellow-400">Paused</span>
                  </>
                )}
                {progress.status === 'completed' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Upload complete!</span>
                  </>
                )}
                {progress.status === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{progress.error}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          {!isUploading && (
            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-2">
              <p>
                <span className="text-red-400 font-semibold">💡 Tips:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Files larger than 100MB automatically use chunked upload</li>
                <li>Upload can be paused and resumed without losing progress</li>
                <li>Multiple chunks upload simultaneously for faster speeds</li>
                <li>Automatic retry on connection failures</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {isUploading ? (
              <>
                <Button
                  onClick={handleCancel}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handlePause}
                  className={isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
                  disabled={progress?.status === 'completed'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {shouldUseChunking ? '⏫ Upload (Chunked)' : '✓ Upload Model'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
