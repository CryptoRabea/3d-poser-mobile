/**
 * Folder Scanner
 * Scans local folders for 3D model files and provides import functionality
 */

export interface ModelFile {
  name: string;
  path: string;
  size: number;
  format: string;
  lastModified: Date;
  file: File;
}

export interface FolderScanResult {
  folderPath: string;
  models: ModelFile[];
  totalSize: number;
  scanTime: number;
}

export class FolderScanner {
  private supportedFormats = ['.glb', '.gltf', '.fbx', '.obj', '.usdz'];

  /**
   * Request folder access from user
   */
  async requestFolderAccess(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      return dirHandle;
    } catch (error) {
      console.error('Folder access denied:', error);
      return null;
    }
  }

  /**
   * Scan folder for model files
   */
  async scanFolder(dirHandle: FileSystemDirectoryHandle): Promise<FolderScanResult> {
    const startTime = Date.now();
    const models: ModelFile[] = [];
    let totalSize = 0;

    try {
      await this.recursiveScan(dirHandle, models, '');
      totalSize = models.reduce((sum, model) => sum + model.size, 0);
    } catch (error) {
      console.error('Folder scan error:', error);
    }

    return {
      folderPath: dirHandle.name,
      models,
      totalSize,
      scanTime: Date.now() - startTime,
    };
  }

  /**
   * Recursively scan folder for model files
   */
  private async recursiveScan(
    dirHandle: FileSystemDirectoryHandle,
    models: ModelFile[],
    currentPath: string
  ): Promise<void> {
    try {
      for await (const entry of (dirHandle as any).values()) {
        const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();

          if (this.isSupportedFormat(file.name)) {
            models.push({
              name: file.name,
              path: entryPath,
              size: file.size,
              format: this.getFileFormat(file.name),
              lastModified: new Date(file.lastModified),
              file,
            });
          }
        } else if (entry.kind === 'directory') {
          const subDirHandle = entry as FileSystemDirectoryHandle;
          await this.recursiveScan(subDirHandle, models, entryPath);
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
  }

  /**
   * Check if file format is supported
   */
  private isSupportedFormat(fileName: string): boolean {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return this.supportedFormats.includes(ext);
  }

  /**
   * Get file format from filename
   */
  private getFileFormat(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return ext.substring(1).toUpperCase();
  }

  /**
   * Load model file
   */
  async loadModelFile(modelFile: ModelFile): Promise<ArrayBuffer> {
    try {
      const arrayBuffer = await modelFile.file.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Error loading model file:', error);
      throw error;
    }
  }

  /**
   * Filter models by format
   */
  filterByFormat(models: ModelFile[], format: string): ModelFile[] {
    return models.filter((model) => model.format.toLowerCase() === format.toLowerCase());
  }

  /**
   * Filter models by size range
   */
  filterBySize(models: ModelFile[], minSize: number, maxSize: number): ModelFile[] {
    return models.filter((model) => model.size >= minSize && model.size <= maxSize);
  }

  /**
   * Sort models by property
   */
  sortModels(
    models: ModelFile[],
    sortBy: 'name' | 'size' | 'date' = 'name'
  ): ModelFile[] {
    const sorted = [...models];

    switch (sortBy) {
      case 'size':
        sorted.sort((a, b) => b.size - a.size);
        break;
      case 'date':
        sorted.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get supported formats list
   */
  getSupportedFormats(): string[] {
    return this.supportedFormats;
  }

  /**
   * Add supported format
   */
  addSupportedFormat(format: string): void {
    const normalizedFormat = format.startsWith('.') ? format : `.${format}`;
    if (!this.supportedFormats.includes(normalizedFormat)) {
      this.supportedFormats.push(normalizedFormat);
    }
  }
}

/**
 * Fallback implementation for browsers without File System Access API
 */
export class FolderScannerFallback {
  /**
   * Create file input for multiple file selection
   */
  createFileInput(): Promise<File[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.glb,.gltf,.fbx,.obj,.usdz';

      input.onchange = (event: any) => {
        const files = Array.from(event.target.files) as File[];
        resolve(files);
      };

      input.click();
    });
  }

  /**
   * Convert files to ModelFile format
   */
  async convertToModelFiles(files: File[]): Promise<ModelFile[]> {
    return files.map((file) => ({
      name: file.name,
      path: file.name,
      size: file.size,
      format: this.getFileFormat(file.name),
      lastModified: new Date(file.lastModified),
      file,
    }));
  }

  /**
   * Get file format from filename
   */
  private getFileFormat(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return ext.substring(1).toUpperCase();
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
