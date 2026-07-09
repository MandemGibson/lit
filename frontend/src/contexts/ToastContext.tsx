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
      <div className="fixed bottom-6 right-6 z-55 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              borderClass: 'border-emerald-500/25 hover:border-emerald-500/40 shadow-[0_8px_32px_rgba(16,185,129,0.06)]',
              iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
              icon: <RxCheck className="h-3.5 w-3.5" />,
            },
            error: {
              borderClass: 'border-red-500/25 hover:border-red-500/40 shadow-[0_8px_32px_rgba(239,68,68,0.06)]',
              iconBg: 'bg-red-500/10 border border-red-500/20 text-red-400',
              icon: <RxCross2 className="h-3.5 w-3.5" />,
            },
            info: {
              borderClass: 'border-cyan-500/25 hover:border-cyan-500/40 shadow-[0_8px_32px_rgba(6,182,212,0.06)]',
              iconBg: 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400',
              icon: <RxInfoCircled className="h-3.5 w-3.5" />,
            },
          };
          const config = typeConfig[toast.type] || typeConfig.info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 bg-[#09090b]/90 backdrop-blur-md border rounded-2xl shadow-2xl transition-all duration-200 animate-slide-in-right ${config.borderClass}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                  {config.icon}
                </div>
                <p className="text-xs font-semibold text-[#f4f4f5] tracking-wide leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-900/60 rounded-lg transition-all focus:outline-none flex-shrink-0 ml-4"
              >
                <RxCross2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
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
