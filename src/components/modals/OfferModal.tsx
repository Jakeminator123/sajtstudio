'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
}

const offerOptions = [
  {
    id: 'sajtmaskin',
    title: 'Skapa din egen sajt',
    description: 'Generera och bygg din hemsida själv med vår AI-drivna plattform Sajtmaskin.',
    href: 'https://sajtmaskin.vercel.app',
    external: true,
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'blue-500/30',
  },
  {
    id: 'radgivning',
    title: 'Rådgivning & Support',
    description:
      'Få hjälp att utveckla och optimera ditt befintliga projekt med professionell vägledning.',
    href: '/kontakt?subject=radgivning',
    external: false,
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-400',
    glowColor: 'emerald-500/30',
  },
  {
    id: 'projektutveckling',
    title: 'Projektutveckling',
    description: 'Kontakta oss för skräddarsydd webbutveckling och större projektsamarbeten.',
    href: '/kontakt?subject=projekt',
    external: false,
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-400',
    glowColor: 'violet-500/30',
  },
]

export default function OfferModal({ isOpen, onClose }: OfferModalProps) {
  const handleOptionClick = (href: string, external: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      onClose()
      // Navigate after modal starts closing
      setTimeout(() => {
        window.location.href = href
      }, 100)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="relative">
              {/* Floating Close Button - Positioned above modal */}
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 300 }}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center z-20"
                aria-label="Stäng"
              >
                {/* Glowing red background */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.5)',
                      '0 0 35px rgba(239, 68, 68, 0.7)',
                      '0 0 20px rgba(239, 68, 68, 0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* X icon */}
                <svg
                  className="w-6 h-6 text-white relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-tertiary to-accent" />

                {/* Content */}
                <div className="p-8 pt-6">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      Vårt erbjudande
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-400"
                    >
                      Välj det alternativ som passar dig bäst
                    </motion.p>
                  </div>

                  {/* Options Grid */}
                  <div className="grid gap-4">
                    {offerOptions.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.1 }}
                      >
                        <button
                          type="button"
                          onClick={() => handleOptionClick(option.href, option.external)}
                          className="group block w-full text-left"
                        >
                          <OptionCard option={option} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-600 text-xs text-center mt-6"
                  >
                    Klicka utanför eller på krysset för att stänga
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function OptionCard({ option }: { option: (typeof offerOptions)[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-5 rounded-2xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm
        transition-all duration-300 cursor-pointer overflow-hidden
        group-hover:border-gray-600/50 group-hover:bg-gray-800/50`}
    >
      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-r ${option.gradient} blur-3xl -z-10`}
        style={{ transform: 'scale(0.8)' }}
      />

      <div className="flex items-center gap-5">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${option.gradient}
            flex items-center justify-center text-white shadow-lg shadow-${option.glowColor}
            group-hover:scale-110 transition-transform duration-300`}
        >
          {option.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90">
            {option.title}
            {option.external && (
              <svg
                className="inline-block w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            )}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
            {option.description}
          </p>
        </div>

        {/* Arrow */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center
            group-hover:bg-white/10 group-hover:translate-x-1 transition-all duration-300"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}
