import React, { useRef, useState } from 'react';

interface ImportExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<{ success: number; failed: number; errors: string[] }>;
  totalPoses: number;
  isLoading?: boolean;
}

export default function ImportExportPanel({
  isOpen,
  onClose,
  onExport,
  onImport,
  totalPoses,
  isLoading = false,
}: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setShowResult(false);

    try {
      const result = await onImport(file);
      setImportResult(result);
      setShowResult(true);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">📤 Import / Export Poses</h2>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="bg-gray-700/30 rounded p-4 border border-gray-600">
            <h3 className="font-semibold text-white mb-3">📥 Export Poses</h3>
            <p className="text-sm text-gray-300 mb-4">
              Download all {totalPoses} pose{totalPoses !== 1 ? 's' : ''} as a JSON file
            </p>
            <button
              onClick={onExport}
              disabled={isLoading || totalPoses === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors font-medium"
            >
              ⬇ Download All Poses
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-gray-700/30 rounded p-4 border border-gray-600">
            <h3 className="font-semibold text-white mb-3">📤 Import Poses</h3>
            <p className="text-sm text-gray-300 mb-4">
              Upload a JSON file to import poses
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isImporting || isLoading}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting || isLoading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Importing...
                </>
              ) : (
                <>⬆ Choose File</>
              )}
            </button>
          </div>

          {/* Import Result */}
          {showResult && importResult && (
            <div
              className={`rounded p-4 border ${
                importResult.success > 0
                  ? 'bg-green-900/30 border-green-600'
                  : 'bg-red-900/30 border-red-600'
              }`}
            >
              <h4 className="font-semibold text-white mb-2">Import Result</h4>
              <div className="text-sm space-y-1">
                {importResult.success > 0 && (
                  <p className="text-green-300">
                    ✓ {importResult.success} pose{importResult.success !== 1 ? 's' : ''} imported
                  </p>
                )}
                {importResult.failed > 0 && (
                  <p className="text-yellow-300">
                    ⚠ {importResult.failed} pose{importResult.failed !== 1 ? 's' : ''} failed
                  </p>
                )}
                {importResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {importResult.errors.slice(0, 3).map((error, idx) => (
                      <p key={idx} className="text-red-300 text-xs">
                        • {error}
                      </p>
                    ))}
                    {importResult.errors.length > 3 && (
                      <p className="text-red-300 text-xs">
                        • +{importResult.errors.length - 3} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-900/20 rounded p-3 border border-blue-600/30 text-xs text-blue-300">
            <p className="mb-1">💡 Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Export poses to backup or share</li>
              <li>Import poses from other devices</li>
              <li>Poses are stored locally on your device</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isImporting || isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
