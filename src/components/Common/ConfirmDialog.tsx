import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              type === 'danger' ? 'bg-red-500/10 text-red-400' :
              type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all ${
              type === 'danger'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
