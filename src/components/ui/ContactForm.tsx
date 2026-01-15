'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useEffect, useRef, useState } from 'react'

interface FormState {
  name: string
  email: string
  message: string
  status: 'idle' | 'sending' | 'success' | 'error'
}

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    status: 'idle',
  })
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Clear any existing timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }

    // Basic validation with trim
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setFormState((prev) => ({ ...prev, status: 'error' }))
      // Reset error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: 'idle' }))
      }, 5000)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formState.email)) {
      setFormState((prev) => ({ ...prev, status: 'error' }))
      // Reset error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: 'idle' }))
      }, 5000)
      return
    }

    setFormState((prev) => ({ ...prev, status: 'sending' }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
          source: 'kontakt', // Identifies which form submitted the message
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel')
      }

      // Success - reset form and show success message
      setFormState({
        name: '',
        email: '',
        message: '',
        status: 'success',
      })

      // Reset success message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: 'idle' }))
      }, 5000)
    } catch {
      setFormState((prev) => ({
        ...prev,
        status: 'error',
      }))

      // Reset error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: 'idle' }))
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-3 text-white/80 uppercase tracking-wider"
        >
          Namn
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40"
          required
          disabled={formState.status === 'sending'}
          placeholder="Ditt namn"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-3 text-white/80 uppercase tracking-wider"
        >
          E-post
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40"
          required
          disabled={formState.status === 'sending'}
          placeholder="din@email.se"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium mb-3 text-white/80 uppercase tracking-wider"
        >
          Meddelande
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={formState.message}
          onChange={(e) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all resize-none text-white placeholder-white/40"
          required
          disabled={formState.status === 'sending'}
          placeholder="Berätta om ditt projekt..."
        />
      </div>

      <AnimatePresence mode="wait">
        {formState.status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-100 rounded-xl"
            role="alert"
            aria-live="polite"
          >
            <span className="text-blue-300">✨</span> Strålande, vi återkommer inom kort!
          </motion.div>
        )}

        {formState.status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <span className="text-red-400">⚠️</span> Något gick fel. Kontrollera att alla fält är
            ifyllda korrekt och försök igen.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={formState.status === 'sending'}
        className="w-full px-8 py-5 bg-white text-black font-bold text-lg rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        aria-busy={formState.status === 'sending'}
        aria-live="polite"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
        <span className="relative flex items-center justify-center gap-2">
          {formState.status === 'sending' ? (
            'Skickar...'
          ) : (
            <>
              Skicka meddelande
              <span className="text-blue-600">→</span>
            </>
          )}
        </span>
      </motion.button>
    </form>
  )
}
