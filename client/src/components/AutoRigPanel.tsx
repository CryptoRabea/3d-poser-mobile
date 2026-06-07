import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Zap, Check } from 'lucide-react';

interface AutoRigPanelProps {
  onAutoRig: () => void;
  isLoading?: boolean;
  onClose?: () => void;
}

export default function AutoRigPanel({ onAutoRig, isLoading = false, onClose }: AutoRigPanelProps) {
  const [rigStatus, setRigStatus] = useState<'idle' | 'rigging' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleAutoRig = async () => {
    setRigStatus('rigging');
    setMessage('Detecting skeleton structure...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onAutoRig();
      setRigStatus('complete');
      setMessage('✅ Skeleton auto-rigged successfully!');
      setTimeout(() => {
        setRigStatus('idle');
        setMessage('');
        onClose?.();
      }, 2000);
    } catch (error) {
      setRigStatus('error');
      setMessage('❌ Failed to auto-rig model');
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-900 border-slate-700 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Auto-Rig Humanoid
        </h3>

        <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300">
          <p className="mb-2">This will automatically:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Detect humanoid skeleton structure</li>
            <li>Create bone hierarchy</li>
            <li>Set up skinning weights</li>
            <li>Enable animation support</li>
          </ul>
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
              rigStatus === 'error'
                ? 'bg-red-900/20 text-red-200'
                : rigStatus === 'complete'
                  ? 'bg-green-900/20 text-green-200'
                  : 'bg-blue-900/20 text-blue-200'
            }`}
          >
            {rigStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {rigStatus === 'complete' && <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{message}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleAutoRig}
            disabled={isLoading || rigStatus === 'rigging'}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {rigStatus === 'rigging' ? 'Rigging...' : 'Start Auto-Rig'}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          <p>💡 Tip: Works best with humanoid models. Ensure model is centered at origin.</p>
        </div>
      </div>
    </Card>
  );
}
