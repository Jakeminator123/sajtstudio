'use client'

import { motion } from 'framer-motion'
import type { Service } from '@/data/services'

interface ServiceCardProps {
  service: Service
  index: number
  onClick: () => void
}

export default function ServiceCard({ service, index, onClick }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Läs mer om ${service.title}`}
      className="group relative cursor-pointer perspective-1000"
    >
      <motion.div
        whileHover={{
          y: -12,
          rotateX: 5,
          rotateY: -5,
          scale: 1.03,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 overflow-hidden transform-style-3d group-hover:bg-white/15 group-hover:border-accent/50 transition-all duration-500"
      >
        {/* Gradient border effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent-light/20 to-accent/30" />
          <div className="absolute inset-[1px] bg-white/10 backdrop-blur-xl" />
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          initial={false}
          animate={{
            boxShadow: '0 0 40px rgba(0, 102, 255, 0.3), 0 0 80px rgba(0, 102, 255, 0.1)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Number badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-accent text-white font-mono text-xl font-bold mb-6 group-hover:bg-accent-hover transition-colors duration-300"
          >
            {service.number}
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
            className="text-3xl md:text-4xl font-black mb-4 text-white group-hover:text-accent transition-colors duration-300"
            style={{
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {service.title}
          </motion.h3>

          {/* Short description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.4 }}
            className="text-gray-200 text-lg mb-6 leading-relaxed group-hover:text-white transition-colors duration-300"
          >
            {service.shortDesc}
          </motion.p>

          {/* Learn more indicator */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.5 }}
            className="flex items-center gap-2 text-accent font-bold group-hover:gap-4 transition-all duration-300"
          >
            <span>Läs mer</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-lg shadow-accent/50" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-lg shadow-accent/50" />
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-accent to-transparent shadow-lg shadow-accent/50" />
          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-accent to-transparent shadow-lg shadow-accent/50" />
        </div>
      </motion.div>
    </motion.div>
  )
}
