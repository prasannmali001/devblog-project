import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  const isSuccess =
    message.toLowerCase().includes('success') ||
    message.toLowerCase().includes('published') ||
    message.toLowerCase().includes('signed in');

  return (
    <aside
      aria-label="Notification"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 animate-slide-up"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-xl">
        <div
          className={`p-1.5 rounded-lg flex-shrink-0 ${
            isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
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
