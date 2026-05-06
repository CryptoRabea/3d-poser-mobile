/**
 * Model Upload Utilities
 * Handles file validation, format detection, and model loading
 */

export interface ModelUploadResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
  fileName: string;
  fileSize: number;
  format: 'glb' | 'fbx' | 'unknown';
}

export interface ModelValidationError {
  code: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' | 'READ_ERROR' | 'INVALID_STRUCTURE';
  message: string;
}

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Supported formats
const SUPPORTED_FORMATS = ['glb', 'fbx', 'gltf'];

/**
 * Detect file format from file extension or magic bytes
 */
export function detectFileFormat(
  fileName: string,
  data?: ArrayBuffer
): 'glb' | 'fbx' | 'unknown' {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // Check by extension first
  if (extension === 'glb') return 'glb';
  if (extension === 'fbx') return 'fbx';
  if (extension === 'gltf') return 'glb'; // GLTF is similar to GLB

  // Check by magic bytes if data is provided
  if (data && data.byteLength >= 4) {
    const view = new Uint8Array(data);

    // GLB magic: 'glTF' (0x67, 0x6C, 0x54, 0x46)
    if (
      view[0] === 0x67 &&
      view[1] === 0x6c &&
      view[2] === 0x54 &&
      view[3] === 0x46
    ) {
      return 'glb';
    }

    // FBX magic: 'Kaydara FBX Binary' at offset 0
    if (data.byteLength >= 23) {
      const fbxMagic = new Uint8Array(data, 0, 23);
      const fbxString = String.fromCharCode(...Array.from(fbxMagic));
      if (fbxString.includes('Kaydara FBX Binary')) {
        return 'fbx';
      }
    }
  }

  return 'unknown';
}

/**
 * Validate file before upload
 */
export function validateModelFile(
  file: File
): { valid: boolean; error?: ModelValidationError } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      },
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!SUPPORTED_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FORMAT',
        message: `Unsupported format: .${extension}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Read file as ArrayBuffer
 */
export async function readFileAsArrayBuffer(
  file: File
): Promise<ModelUploadResult> {
  const validation = validateModelFile(file);

  if (!validation.valid) {
    return {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      format: 'unknown',
      error: validation.error?.message,
    };
  }

  try {
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    const format = detectFileFormat(file.name, data);

    if (format === 'unknown') {
      return {
        success: false,
        fileName: file.name,
        fileSize: file.size,
        format: 'unknown',
        error: 'Could not detect file format. Please ensure the file is a valid .glb or .fbx model.',
      };
    }

    return {
      success: true,
      data,
      fileName: file.name,
      fileSize: file.size,
      format,
    };
  } catch (error) {
    return {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      format: 'unknown',
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate GLB file structure
 */
export function validateGLBStructure(data: ArrayBuffer): boolean {
  if (data.byteLength < 20) return false;

  const view = new Uint8Array(data);

  // Check magic bytes
  if (
    view[0] !== 0x67 ||
    view[1] !== 0x6c ||
    view[2] !== 0x54 ||
    view[3] !== 0x46
  ) {
    return false;
  }

  // Check version (should be 2)
  const version = new Uint32Array(data, 4, 1)[0];
  if (version !== 2) {
    return false;
  }

  // Check file length
  const fileLength = new Uint32Array(data, 8, 1)[0];
  if (fileLength !== data.byteLength) {
    return false;
  }

  return true;
}

/**
 * Extract model name from file
 */
export function extractModelName(fileName: string): string {
  return fileName.split('.').slice(0, -1).join('.');
}

/**
 * Check if format requires conversion
 */
export function requiresConversion(format: 'glb' | 'fbx' | 'unknown'): boolean {
  return format === 'fbx';
}
