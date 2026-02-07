'use client'

import { useContentSection } from '@/hooks/useContent'
import { useTheme } from '@/hooks/useTheme'
import { siteConfig } from '@/config/siteConfig'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'

// Dynamic imports to avoid SSR issues
const Keyboard3DBackground = dynamic(() => import('@/components/effects/Keyboard3DBackground'), {
  ssr: false,
})

/**
 * BigCTA Component - Interactive Keyboard Contact Section
 *
 * Features:
 * - Interactive 3D keyboard background
 * - Clean professional contact form
 * - Send message via email
 * - Clickable phone to call
 */
export default function BigCTA() {
  const sectionRef = useRef(null)
  const { isLight } = useTheme()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Fetch content from CMS - enables live updates from /admin
  const { getValue } = useContentSection('bigcta')

  // Get content from CMS with fallbacks
  const phoneImage = getValue('B3', '/images/contact_phone.webp')
  const phoneHref = `tel:${siteConfig.contact.phone.replace(/[^\d+]/g, '')}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSent(true)
        setFormData({ name: '', email: '', message: '' })
      }
    } catch {
      // Silently handle errors
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-br from-sky-100 via-amber-50 to-rose-50 text-gray-900'
          : 'bg-black text-white'
      }`}
    >
      {/* Light mode decorative elements */}
      {isLight && (
        <>
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-sky-200/40 to-transparent pointer-events-none z-0" />
          <div className="absolute top-1/4 right-10 w-80 h-80 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-gradient-to-tr from-rose-200/25 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-100/30 to-transparent pointer-events-none z-0" />
        </>
      )}
      {/* Top content area - Title and description */}
      <div className="relative z-20 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8"
          />

          {/* Main heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span
              className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isLight
                  ? 'from-gray-800 via-gray-700 to-gray-600'
                  : 'from-white via-white to-gray-400'
              }`}
            >
              Låt oss
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent via-blue-400 to-tertiary bg-clip-text text-transparent">
              prata
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="w-8 h-[1px] bg-accent/50" />
            <p
              className={`text-lg sm:text-xl font-light tracking-wide uppercase ${
                isLight ? 'text-gray-600' : 'text-white/70'
              }`}
            >
              Vi vill höra från dig
            </p>
            <span className="w-8 h-[1px] bg-accent/50" />
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className={`text-base sm:text-lg max-w-2xl mx-auto ${
              isLight ? 'text-gray-500' : 'text-white/50'
            }`}
          >
            Berätta om ditt projekt så återkommer vi med en plan.
          </motion.p>
        </motion.div>
      </div>

      {/* Main interactive area - Keyboard and Form */}
      <div className="flex-1 relative">
        {/* 3D Keyboard Background */}
        <div className="absolute inset-0">
          <Keyboard3DBackground />
        </div>

        {/* Gradient overlays for better readability - adapts to theme */}
        <div
          className={`absolute inset-0 pointer-events-none z-10 ${
            isLight
              ? 'bg-gradient-to-t from-[#fef9e7]/90 via-[#fef9e7]/40 to-sky-100/60'
              : 'bg-gradient-to-t from-black/90 via-black/40 to-black/70'
          }`}
        />
        <div
          className={`absolute inset-0 pointer-events-none z-10 ${
            isLight
              ? 'bg-gradient-to-r from-[#fff5e6]/50 via-transparent to-[#fff5e6]/50'
              : 'bg-gradient-to-r from-black/50 via-transparent to-black/50'
          }`}
        />

        {/* Clickable Phone - positioned to the left (desktop only) */}
        <a
          href={phoneHref}
          className="absolute z-20 left-4 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 hidden md:block group"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Image
              src={phoneImage}
              alt="Smartphone som visar Sajtstudios kontaktformulär"
              width={240}
              height={300}
              className="drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(0,102,255,0.3)]"
              style={{ width: 'auto', height: 'auto' }}
              loading="lazy"
            />
            {/* Hover tooltip */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-accent/90 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm whitespace-nowrap">Ring oss</span>
            </div>
          </motion.div>
        </a>

        {/* Professional Contact Form */}
        <div className="absolute z-20 left-4 right-4 bottom-4 md:left-auto md:right-16 md:top-1/2 md:-translate-y-1/2 md:bottom-auto flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={`w-full md:w-[400px] rounded-2xl p-6 md:p-8 backdrop-blur-xl border shadow-2xl ${
              isLight
                ? 'bg-white/80 border-gray-200/80 shadow-gray-200/50'
                : 'bg-gray-900/80 border-white/10 shadow-black/50'
            }`}
          >
            {sent ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <h3
                  className={`text-xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}
                >
                  Tack för ditt meddelande!
                </h3>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Vi återkommer inom 24 timmar.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-accent hover:underline text-sm"
                >
                  Skicka ett till meddelande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3
                  className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}
                >
                  Skicka ett meddelande
                </h3>
                <div>
                  <input
                    type="text"
                    placeholder="Ditt namn"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                      isLight
                        ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Din e-post"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                      isLight
                        ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Berätta om ditt projekt..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none ${
                      isLight
                        ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Skickar...' : 'Skicka meddelande'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Mobile phone call button */}
          <motion.a
            href={phoneHref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 w-full py-4 bg-accent rounded-lg font-bold text-white shadow-lg md:hidden"
          >
            <Image
              src={phoneImage}
              alt="Kontaktikon"
              width={40}
              height={50}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
              loading="lazy"
            />
            <span className="text-lg">Ring oss direkt!</span>
          </motion.a>
        </div>
      </div>

      {/* Bottom contact info */}
      <div
        className={`relative z-20 py-8 px-4 ${
          isLight
            ? 'bg-gradient-to-t from-amber-100/80 to-transparent'
            : 'bg-gradient-to-t from-black to-transparent'
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {/* Email */}
          <motion.a
            href={`mailto:${siteConfig.contact.email}`}
            className={`group flex items-center gap-3 hover:text-accent transition-colors ${
              isLight ? 'text-gray-600' : 'text-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{siteConfig.contact.email}</span>
          </motion.a>

          {/* Divider */}
          <span className={`hidden sm:block w-px h-6 ${isLight ? 'bg-gray-300' : 'bg-white/20'}`} />

          {/* Phone */}
          <motion.a
            href={phoneHref}
            className={`group flex items-center gap-3 hover:text-accent transition-colors ${
              isLight ? 'text-gray-600' : 'text-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm">{siteConfig.contact.phone}</span>
          </motion.a>

          {/* Divider */}
          <span className={`hidden sm:block w-px h-6 ${isLight ? 'bg-gray-300' : 'bg-white/20'}`} />

          {/* Fun note */}
          <span className={`text-xs italic ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
            Svarar vanligtvis inom 24 timmar
          </span>
        </motion.div>
      </div>
    </section>
  )
}
