import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, Download, AlertCircle, Loader } from 'lucide-react';

interface ModelFile {
  name: string;
  path: string;
  size: number;
  format: string;
  lastModified: Date;
}

interface FolderScannerPanelProps {
  onScanFolder: () => void;
  onLoadModel: (file: ModelFile) => void;
  isScanning?: boolean;
  models?: ModelFile[];
  onClose?: () => void;
}

export default function FolderScannerPanel({
  onScanFolder,
  onLoadModel,
  isScanning = false,
  models = [],
  onClose,
}: FolderScannerPanelProps) {
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const sortModels = (models: ModelFile[]): ModelFile[] => {
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
  };

  const filteredModels = sortModels(
    filterFormat === 'all' ? models : models.filter((m) => m.format === filterFormat)
  );

  const formats = Array.from(new Set(models.map((m) => m.format)));
  const totalSize = models.reduce((sum, m) => sum + m.size, 0);

  return (
    <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            Folder Scanner
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {models.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 mb-4">No models scanned yet</p>
            <Button
              onClick={onScanFolder}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScanning ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Scan Folder
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400 text-xs">Models Found</div>
                <div className="text-white font-semibold text-lg">{models.length}</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400 text-xs">Total Size</div>
                <div className="text-white font-semibold text-lg">{formatFileSize(totalSize)}</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400 text-xs">Formats</div>
                <div className="text-white font-semibold text-lg">{formats.length}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={onScanFolder}
                disabled={isScanning}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isScanning ? 'Scanning...' : 'Rescan Folder'}
              </Button>

              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-sm"
              >
                <option value="all">All Formats</option>
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-sm ml-auto"
              >
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>

            {/* Model List */}
            <div className="bg-slate-800 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-slate-700 px-3 py-2 text-xs text-slate-400 font-semibold grid grid-cols-12 gap-2">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Format</div>
                <div className="col-span-3">Size</div>
                <div className="col-span-2">Action</div>
              </div>

              {filteredModels.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No models match the selected filter
                </div>
              ) : (
                filteredModels.map((model, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 border-t border-slate-700 grid grid-cols-12 gap-2 items-center text-sm hover:bg-slate-700/50"
                  >
                    <div className="col-span-5 text-slate-300 truncate" title={model.name}>
                      {model.name}
                    </div>
                    <div className="col-span-2 text-slate-400">{model.format}</div>
                    <div className="col-span-3 text-slate-400">{formatFileSize(model.size)}</div>
                    <div className="col-span-2">
                      <Button
                        onClick={() => onLoadModel(model)}
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-600 text-xs"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-xs text-slate-400">
              <p>💡 Click Download to load a model into the 3D Poser.</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
