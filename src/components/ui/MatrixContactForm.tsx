'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { prefersReducedMotion } from '@/lib/performance'

interface MatrixContactFormProps {
  onKeyboardModeChange?: (useKeyboard: boolean) => void
  email?: string
}

// Matrix rain effect in background
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const chars =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const fontSize = 10
    const columns = canvas.width / fontSize
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff00'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = `rgba(0, ${150 + Math.random() * 105}, 0, ${0.3 + Math.random() * 0.3})`
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)
    return () => clearInterval(interval)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-20 pointer-events-none" />
}

// Blinking cursor
function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-[2px] h-[1.2em] bg-green-400 ml-1"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  )
}

export default function MatrixContactForm({
  onKeyboardModeChange,
  email = 'erik@sajtstudio.se',
}: MatrixContactFormProps) {
  const isMobile = useMobileDetection()
  const shouldReduceMotion = prefersReducedMotion()
  const showMatrixRain = !isMobile && !shouldReduceMotion
  const [message, setMessage] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [useRealKeyboard, setUseRealKeyboard] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Listen for keyboard events from the 3D keyboard
  useEffect(() => {
    if (useRealKeyboard) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process virtual keyboard events (non-trusted synthetic events).
      // This prevents physical keyboard input from typing into the message unless enabled.
      if (e.isTrusted) return

      if (e.code === 'Backspace') {
        setMessage((prev) => prev.slice(0, -1))
      } else if (e.code === 'Enter') {
        // Don't add newline, maybe trigger send?
      } else if (e.code === 'Space') {
        setMessage((prev) => prev + ' ')
      } else if (
        e.key &&
        typeof e.key === 'string' &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        setMessage((prev) => prev + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [useRealKeyboard])

  // Toggle keyboard mode
  const toggleKeyboardMode = useCallback(() => {
    const newMode = !useRealKeyboard
    setUseRealKeyboard(newMode)
    onKeyboardModeChange?.(newMode)

    if (newMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [useRealKeyboard, onKeyboardModeChange])

  // Handle real keyboard input
  const handleRealKeyboardInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setMessage(newValue)

      // Dispatch keyboard events to animate the 3D keyboard
      if (newValue.length > message.length) {
        const newChar = newValue[newValue.length - 1]
        const code = newChar === ' ' ? 'Space' : `Key${newChar.toUpperCase()}`

        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: newChar,
            code,
            bubbles: true,
          })
        )

        setTimeout(() => {
          window.dispatchEvent(
            new KeyboardEvent('keyup', {
              key: newChar,
              code,
              bubbles: true,
            })
          )
        }, 100)
      }
    },
    [message]
  )

  // Send message via API
  const handleSend = useCallback(async () => {
    if (!message.trim()) return
    const trimmedEmail = senderEmail.trim()

    if (!trimmedEmail) {
      alert('Ange en giltig e-postadress.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      alert('Ange en giltig e-postadress.')
      return
    }

    setIsSending(true)

    try {
      // Send via API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedEmail.split('@')[0] || 'Okänd avsändare',
          email: trimmedEmail,
          message: message,
          source: 'matrix',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSending(false)
        setSent(true)

        // Reset after showing success
        setTimeout(() => {
          setSent(false)
          setMessage('')
          setSenderEmail('')
        }, 3000)
      } else {
        // Error handling
        setIsSending(false)
        alert(data.error || 'Något gick fel. Försök igen senare.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsSending(false)
      alert('Något gick fel. Försök igen senare.')
    }
  }, [message, senderEmail])

  // Clear message
  const handleClear = useCallback(() => {
    setMessage('')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative bg-black/80 border border-green-500/30 rounded-lg overflow-hidden backdrop-blur-sm"
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      {/* Matrix rain background */}
      {showMatrixRain && <MatrixRain />}

      {/* Header */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 font-mono text-sm">TERMINAL</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Message display area */}
      <div className="relative z-10 p-4 min-h-[150px] max-h-[200px] overflow-y-auto font-mono">
        <div className="text-green-400/70 text-xs mb-2">{`> Skriv ditt meddelande:`}</div>
        <div className="text-green-400 text-lg leading-relaxed break-words">
          {message || <span className="text-green-400/30">...</span>}
          <BlinkingCursor />
        </div>
      </div>

      {/* Email input (required) */}
      <div className="relative z-10 px-4 pb-2">
        <input
          ref={emailInputRef}
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          inputMode="email"
          placeholder="Din e-post"
          className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder:text-green-500/30 focus:outline-none focus:border-green-500/50"
          required
        />
      </div>

      {/* Hidden input for real keyboard mode */}
      {useRealKeyboard && (
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleRealKeyboardInput}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
        />
      )}

      {/* Controls */}
      <div className="relative z-10 px-4 py-3 border-t border-green-500/30 space-y-3">
        {/* Keyboard mode toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleKeyboardMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
              useRealKeyboard
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-transparent text-green-500/50 border border-green-500/20 hover:border-green-500/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            {useRealKeyboard ? 'TANGENTBORD AKTIVT' : 'ANVÄND EGET TANGENTBORD'}
          </button>

          {!isMobile && <span className="text-green-500/40 text-xs font-mono">E-post krävs</span>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            disabled={!message}
            className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 font-mono text-sm hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            RENSA
          </button>

          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || !senderEmail.trim() || isSending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
              sent
                ? 'bg-green-500 text-black'
                : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⟳
                </motion.span>
                SKICKAR...
              </span>
            ) : sent ? (
              'Strålande, vi återkommer inom kort!'
            ) : (
              'SKICKA →'
            )}
          </motion.button>
        </div>

        {/* Target email display */}
        <div className="text-center text-green-500/40 text-xs font-mono">→ {email}</div>
      </div>
    </motion.div>
  )
}
