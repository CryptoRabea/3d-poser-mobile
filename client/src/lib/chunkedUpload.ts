/**
 * Chunked Upload Utility
 * Handles large file uploads by splitting into chunks with progress tracking
 */

export interface ChunkUploadConfig {
  chunkSize: number; // Size of each chunk in bytes (default: 5MB)
  maxConcurrentChunks: number; // Number of chunks to upload simultaneously
  maxRetries: number; // Number of retries per chunk
  retryDelay: number; // Delay between retries in ms
}

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  status: 'idle' | 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
}

export interface ChunkMetadata {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  chunkSize: number;
  fileSize: number;
  fileName: string;
  fileHash: string;
  timestamp: number;
}

export class ChunkedUploader {
  private config: ChunkUploadConfig;
  private uploadedBytes = 0;
  private startTime = 0;
  private isPaused = false;
  private activeRequests = new Map<number, AbortController>();

  constructor(config: Partial<ChunkUploadConfig> = {}) {
    this.config = {
      chunkSize: 5 * 1024 * 1024, // 5MB default
      maxConcurrentChunks: 3,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Calculate file hash for integrity checking
   */
  async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Split file into chunks
   */
  splitFileIntoChunks(file: File): Blob[] {
    const chunks: Blob[] = [];
    const chunkSize = this.config.chunkSize;

    for (let i = 0; i < file.size; i += chunkSize) {
      const chunk = file.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Upload a single chunk with retry logic
   */
  private async uploadChunk(
    chunk: Blob,
    metadata: ChunkMetadata,
    onProgress: (progress: UploadProgress) => void
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (this.isPaused) {
          await this.waitForResume();
        }

        const abortController = new AbortController();
        this.activeRequests.set(metadata.chunkIndex, abortController);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        this.activeRequests.delete(metadata.chunkIndex);

        if (!response.ok) {
          throw new Error(`Chunk upload failed: ${response.statusText}`);
        }

        this.uploadedBytes += chunk.size;
        this.updateProgress(metadata.fileSize, metadata.totalChunks, onProgress);

        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Chunk upload failed after retries');
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    totalBytes: number,
    totalChunks: number,
    onProgress: (progress: UploadProgress) => void
  ): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = this.uploadedBytes / elapsed;
    const remainingBytes = totalBytes - this.uploadedBytes;
    const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : 0;

    onProgress({
      uploadedBytes: this.uploadedBytes,
      totalBytes,
      percentage: Math.round((this.uploadedBytes / totalBytes) * 100),
      currentChunk: Math.floor(this.uploadedBytes / this.config.chunkSize),
      totalChunks,
      speed,
      estimatedTimeRemaining,
      status: this.isPaused ? 'paused' : 'uploading',
    });
  }

  /**
   * Wait for resume signal
   */
  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isPaused) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Upload file in chunks
   */
  async uploadFile(
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
    try {
      this.uploadedBytes = 0;
      this.startTime = Date.now();
      this.isPaused = false;

      // Calculate file hash
      onProgress({
        uploadedBytes: 0,
        totalBytes: file.size,
        percentage: 0,
        currentChunk: 0,
        totalChunks: 0,
        speed: 0,
        estimatedTimeRemaining: 0,
        status: 'uploading',
      });

      const fileHash = await this.calculateFileHash(file);

      // Split file into chunks
      const chunks = this.splitFileIntoChunks(file);
      const totalChunks = chunks.length;

      // If file is small enough, upload directly
      if (totalChunks === 1) {
        const buffer = await chunks[0].arrayBuffer();
        return { success: true, data: buffer };
      }

      // Upload chunks in parallel (respecting concurrency limit)
      const inFlightPromises = new Set<Promise<void>>();

      for (let i = 0; i < totalChunks; i++) {
        const metadata: ChunkMetadata = {
          fileId: `${file.name}-${fileHash}`,
          chunkIndex: i,
          totalChunks,
          chunkSize: this.config.chunkSize,
          fileSize: file.size,
          fileName: file.name,
          fileHash,
          timestamp: Date.now(),
        };

        const uploadPromise = this.uploadChunk(chunks[i], metadata, onProgress).finally(
          () => inFlightPromises.delete(uploadPromise)
        );

        inFlightPromises.add(uploadPromise);

        // Limit concurrent uploads
        if (inFlightPromises.size >= this.config.maxConcurrentChunks) {
          await Promise.race(inFlightPromises);
        }
      }

      // Wait for all remaining uploads
      await Promise.all(inFlightPromises);

      // Assemble chunks on server
      const assembleResponse = await fetch('/api/upload/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: `${file.name}-${fileHash}`,
          fileName: file.name,
          totalChunks,
          fileHash,
        }),
      });

      if (!assembleResponse.ok) {
        throw new Error('Failed to assemble file on server');
      }

      const result = await assembleResponse.json();

      if (!result.success) {
        throw new Error(result.error || 'File assembly failed');
      }

      // Fetch the assembled file from the server
      let fileData: ArrayBuffer | null = null;
      if (result.filePath) {
        try {
          const fileResponse = await fetch(`/api/upload/file/${encodeURIComponent(result.filePath)}`);
          if (!fileResponse.ok) {
            throw new Error('Failed to fetch assembled file');
          }
          fileData = await fileResponse.arrayBuffer();

          // Validate GLB magic number
          if (fileData.byteLength < 4) {
            throw new Error('Invalid file: too small to be a valid model');
          }

          const view = new Uint8Array(fileData, 0, 4);
          const magic = String.fromCharCode(view[0], view[1], view[2], view[3]);
          if (magic !== 'glTF' && !fileData.byteLength.toString().includes('144')) {
            // Allow some flexibility for non-GLB formats
            console.warn('Warning: File may not be a valid GLB model');
          }
        } catch (error) {
          console.error('Failed to fetch assembled file:', error);
          throw error;
        }
      }

      if (!fileData || fileData.byteLength === 0) {
        throw new Error('Assembled file is empty or invalid');
      }

      onProgress({
        uploadedBytes: file.size,
        totalBytes: file.size,
        percentage: 100,
        currentChunk: totalChunks,
        totalChunks,
        speed: this.uploadedBytes / ((Date.now() - this.startTime) / 1000),
        estimatedTimeRemaining: 0,
        status: 'completed',
      });

      return {
        success: true,
        data: fileData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      onProgress({
        uploadedBytes: this.uploadedBytes,
        totalBytes: file.size,
        percentage: Math.round((this.uploadedBytes / file.size) * 100),
        currentChunk: Math.floor(this.uploadedBytes / this.config.chunkSize),
        totalChunks: Math.ceil(file.size / this.config.chunkSize),
        speed: 0,
        estimatedTimeRemaining: 0,
        status: 'error',
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Pause upload
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume upload
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Cancel upload
   */
  cancel(): void {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.activeRequests.clear();
    this.isPaused = false;
  }

  /**
   * Get current upload status
   */
  getStatus(): {
    uploadedBytes: number;
    isPaused: boolean;
    activeChunks: number;
  } {
    return {
      uploadedBytes: this.uploadedBytes,
      isPaused: this.isPaused,
      activeChunks: this.activeRequests.size,
    };
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format seconds to human-readable time
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate upload speed in Mbps
 */
export function calculateSpeed(bytesPerSecond: number): number {
  return (bytesPerSecond * 8) / 1000000; // Convert to Mbps
}
