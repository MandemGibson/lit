import React, { createContext, useContext, useState, useCallback } from 'react';
import { RxCheck, RxCross2, RxInfoCircled } from 'react-icons/rx';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between p-3.5 bg-gradient-to-b from-[#1c1c20] to-[#141417] border border-[#27272a] rounded-xl shadow-xl animate-slide-in-right"
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'success' && (
                <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <RxCheck className="h-4 w-4" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="p-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                  <RxCross2 className="h-4 w-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <RxInfoCircled className="h-4 w-4" />
                </div>
              )}
              <p className="text-xs font-semibold text-white tracking-wide">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-550 hover:text-zinc-350 ml-4 transition-colors focus:outline-none"
            >
              <RxCross2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
