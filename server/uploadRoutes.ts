/**
 * Upload Routes
 * Express routes for handling chunked file uploads
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  saveChunk,
  verifyChunk,
  assembleChunks,
  getUploadStatus,
  cleanupUpload,
  getChunksDirSize,
  cleanupOldChunks,
} from './chunkHandler';

const router = Router();

// Configure multer for chunk uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per chunk
  },
});

/**
 * POST /api/upload/chunk
 * Upload a single chunk
 */
router.post('/chunk', upload.single('chunk'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No chunk data provided' });
    }

    const metadata = JSON.parse(req.body.metadata);

    if (!metadata.fileId || metadata.chunkIndex === undefined || !metadata.totalChunks) {
      return res.status(400).json({ error: 'Invalid metadata' });
    }

    // Save chunk
    const saveResult = await saveChunk(metadata.fileId, metadata.chunkIndex, req.file.buffer);

    if (!saveResult.success) {
      return res.status(500).json({ error: saveResult.error });
    }

    // Verify chunk
    const verifyResult = await verifyChunk(
      metadata.fileId,
      metadata.chunkIndex,
      req.file.size
    );

    if (!verifyResult.valid) {
      return res.status(500).json({ error: verifyResult.error });
    }

    // Get upload status
    const status = await getUploadStatus(metadata.fileId, metadata.totalChunks);

    res.json({
      success: true,
      chunkIndex: metadata.chunkIndex,
      uploadedChunks: status.uploadedChunks,
      totalChunks: status.totalChunks,
      percentage: status.percentage,
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload chunk',
    });
  }
});

/**
 * POST /api/upload/assemble
 * Assemble chunks into final file
 */
router.post('/assemble', async (req: Request, res: Response) => {
  try {
    const { fileId, fileName, totalChunks, fileHash } = req.body;

    if (!fileId || !fileName || !totalChunks || !fileHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Assemble chunks
    const result = await assembleChunks({
      fileId,
      fileName,
      totalChunks,
      fileHash,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'File assembled successfully',
      filePath: result.filePath,
    });
  } catch (error) {
    console.error('Assembly error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to assemble file',
    });
  }
});

/**
 * GET /api/upload/status/:fileId
 * Get upload status
 */
router.get('/status/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { totalChunks } = req.query;

    if (!fileId || !totalChunks) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const status = await getUploadStatus(fileId, parseInt(totalChunks as string));

    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get status',
    });
  }
});

/**
 * DELETE /api/upload/:fileId
 * Cancel/cleanup upload
 */
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { totalChunks } = req.query;

    if (!fileId || !totalChunks) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await cleanupUpload(fileId, parseInt(totalChunks as string));

    res.json({
      success: true,
      message: 'Upload cancelled and cleaned up',
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to cleanup upload',
    });
  }
});

/**
 * GET /api/upload/stats
 * Get upload statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const dirSize = await getChunksDirSize();
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB max

    res.json({
      success: true,
      dirSize,
      maxSize,
      usagePercentage: Math.round((dirSize / maxSize) * 100),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get stats',
    });
  }
});

/**
 * POST /api/upload/cleanup
 * Clean up old chunks
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { maxAgeHours = 24 } = req.body;
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    const cleanedSize = await cleanupOldChunks(maxAgeMs);

    res.json({
      success: true,
      cleanedSize,
      message: `Cleaned up ${(cleanedSize / 1024 / 1024).toFixed(2)}MB of old chunks`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to cleanup old chunks',
    });
  }
});

export default router;
