'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'default' | 'success' | 'error' | 'warning'
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: () => void
}) {
  const typeStyles = {
    default: 'bg-card border',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2 fade-in duration-200',
        typeStyles[toast.type || 'default']
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-medium text-sm">{toast.title}</p>
          )}
          {toast.description && (
            <p className={cn('text-sm', toast.title && 'mt-1 opacity-90')}>
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Helper function for quick toasts
export function toast(options: Omit<Toast, 'id'>) {
  // This is a fallback for when not in provider context
  // Real implementation should use useToast hook
  console.log('Toast:', options)
}
