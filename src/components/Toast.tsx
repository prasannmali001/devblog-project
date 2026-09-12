import React from 'react';
import { Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <aside
      aria-label="Notification"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-lg">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs sm:text-sm font-medium pr-1 text-slate-700">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
