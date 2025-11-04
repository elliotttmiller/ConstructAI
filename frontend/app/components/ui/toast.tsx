"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/app/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback(
    (message: string, type: ToastType = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, message, type, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
      default:
        return "text-blue-600";
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm animate-slide-in-right min-w-[320px] max-w-md",
        getStyles()
      )}
    >
      <div className={cn("shrink-0", getIconColor())}>{getIcon()}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed whitespace-pre-line">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
