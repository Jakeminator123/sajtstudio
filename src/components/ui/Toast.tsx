'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  const colors = {
    success: 'bg-green-500/20 border-green-400/30 text-green-200',
    error: 'bg-red-500/20 border-red-400/30 text-red-200',
    info: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
    warning: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl backdrop-blur-xl border shadow-2xl max-w-md ${colors[type]}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-current/60 hover:text-current transition-colors"
          aria-label="Stäng"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: ToastType; duration?: number }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto" style={{ zIndex: 1000 - index }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
