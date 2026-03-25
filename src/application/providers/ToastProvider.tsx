"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const success = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type: 'success' }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const error = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type: 'error' }]);
    
    // Auto remove after 5 seconds for errors
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 bg-white dark:bg-slate-900 border shadow-lg rounded-lg p-3 min-w-[280px] animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              toast.type === 'success' ? 'border-emerald-200 dark:border-emerald-900/50 shadow-emerald-500/10' : 'border-red-200 dark:border-red-900/50 shadow-red-500/10'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            ) : (
              <X className="size-5 text-red-500 shrink-0" />
            )}
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
