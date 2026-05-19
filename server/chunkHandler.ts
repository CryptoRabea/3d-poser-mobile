/**
 * Chunk Upload Handler
 * Server-side logic for handling chunked file uploads and assembly
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ChunkMetadata {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  chunkSize: number;
  fileSize: number;
  fileName: string;
  fileHash: string;
  timestamp: number;
}

interface AssemblyRequest {
  fileId: string;
  fileName: string;
  totalChunks: number;
  fileHash: string;
}

// Temporary directory for chunk storage
const CHUNKS_DIR = path.join(process.cwd(), '.chunks');

// Ensure chunks directory exists
if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

/**
 * Get chunk file path
 */
function getChunkPath(fileId: string, chunkIndex: number): string {
  return path.join(CHUNKS_DIR, `${fileId}.chunk${chunkIndex}`);
}

/**
 * Get assembly lock file path
 */
function getLockPath(fileId: string): string {
  return path.join(CHUNKS_DIR, `${fileId}.lock`);
}

/**
 * Get final file path
 */
function getFinalPath(fileId: string): string {
  return path.join(CHUNKS_DIR, `${fileId}.final`);
}

/**
 * Save chunk to disk
 */
export async function saveChunk(
  fileId: string,
  chunkIndex: number,
  chunkData: Buffer
): Promise<{ success: boolean; error?: string }> {
  try {
    const chunkPath = getChunkPath(fileId, chunkIndex);

    // Write chunk to temporary file first
    const tempPath = `${chunkPath}.tmp`;
    await fs.promises.writeFile(tempPath, chunkData);

    // Rename to final chunk name (atomic operation)
    await fs.promises.rename(tempPath, chunkPath);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save chunk',
    };
  }
}

/**
 * Verify chunk integrity
 */
export async function verifyChunk(
  fileId: string,
  chunkIndex: number,
  expectedSize: number
): Promise<{ valid: boolean; error?: string }> {
  try {
    const chunkPath = getChunkPath(fileId, chunkIndex);

    if (!fs.existsSync(chunkPath)) {
      return { valid: false, error: 'Chunk file not found' };
    }

    const stats = await fs.promises.stat(chunkPath);

    if (stats.size !== expectedSize && chunkIndex > 0) {
      // Last chunk might be smaller
      return { valid: false, error: 'Chunk size mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify chunk',
    };
  }
}

/**
 * Assemble chunks into final file
 */
export async function assembleChunks(
  request: AssemblyRequest
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const { fileId, fileName, totalChunks, fileHash } = request;

  try {
    // Acquire lock to prevent concurrent assembly
    const lockPath = getLockPath(fileId);
    if (fs.existsSync(lockPath)) {
      return { success: false, error: 'Assembly already in progress' };
    }

    // Create lock file
    await fs.promises.writeFile(lockPath, Date.now().toString());

    try {
      // Check all chunks exist
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = getChunkPath(fileId, i);
        if (!fs.existsSync(chunkPath)) {
          throw new Error(`Missing chunk ${i}`);
        }
      }

      // Create output file
      const finalPath = getFinalPath(fileId);
      const writeStream = fs.createWriteStream(finalPath);

      // Assemble chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = getChunkPath(fileId, i);
        const chunkData = await fs.promises.readFile(chunkPath);

        await new Promise<void>((resolve, reject) => {
          writeStream.write(chunkData, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }

      // Close write stream
      await new Promise<void>((resolve, reject) => {
        writeStream.end((error: any) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Verify assembled file
      const fileData = await fs.promises.readFile(finalPath);
      const calculatedHash = crypto.createHash('sha256').update(fileData).digest('hex');

      if (calculatedHash !== fileHash) {
        throw new Error('File hash mismatch - integrity check failed');
      }

      // Clean up chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = getChunkPath(fileId, i);
        try {
          await fs.promises.unlink(chunkPath);
        } catch {
          // Ignore cleanup errors
        }
      }

      return { success: true, filePath: finalPath };
    } finally {
      // Remove lock file
      try {
        await fs.promises.unlink(lockPath);
      } catch {
        // Ignore lock cleanup errors
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assemble chunks',
    };
  }
}

/**
 * Get upload status
 */
export async function getUploadStatus(
  fileId: string,
  totalChunks: number
): Promise<{ uploadedChunks: number; totalChunks: number; percentage: number }> {
  let uploadedChunks = 0;

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = getChunkPath(fileId, i);
    if (fs.existsSync(chunkPath)) {
      uploadedChunks++;
    }
  }

  return {
    uploadedChunks,
    totalChunks,
    percentage: Math.round((uploadedChunks / totalChunks) * 100),
  };
}

/**
 * Clean up incomplete upload
 */
export async function cleanupUpload(fileId: string, totalChunks: number): Promise<void> {
  try {
    // Remove all chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = getChunkPath(fileId, i);
      if (fs.existsSync(chunkPath)) {
        await fs.promises.unlink(chunkPath);
      }
    }

    // Remove lock file
    const lockPath = getLockPath(fileId);
    if (fs.existsSync(lockPath)) {
      await fs.promises.unlink(lockPath);
    }

    // Remove final file if exists
    const finalPath = getFinalPath(fileId);
    if (fs.existsSync(finalPath)) {
      await fs.promises.unlink(finalPath);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Get chunk directory size
 */
export async function getChunksDirSize(): Promise<number> {
  try {
    const files = await fs.promises.readdir(CHUNKS_DIR);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(CHUNKS_DIR, file);
      const stats = await fs.promises.stat(filePath);
      totalSize += stats.size;
    }

    return totalSize;
  } catch (error) {
    return 0;
  }
}

/**
 * Clean up old chunks (older than 24 hours)
 */
export async function cleanupOldChunks(maxAgeMs = 24 * 60 * 60 * 1000): Promise<number> {
  try {
    const files = await fs.promises.readdir(CHUNKS_DIR);
    let cleanedSize = 0;
    const now = Date.now();

    for (const file of files) {
      // Skip lock files
      if (file.endsWith('.lock')) continue;

      const filePath = path.join(CHUNKS_DIR, file);
      const stats = await fs.promises.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAgeMs) {
        const size = stats.size;
        await fs.promises.unlink(filePath);
        cleanedSize += size;
      }
    }

    return cleanedSize;
  } catch (error) {
    console.error('Cleanup old chunks error:', error);
    return 0;
  }
}
