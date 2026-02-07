'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { useContentSection } from '@/hooks/useContent'
import { useMounted } from '@/hooks/useMounted'
import { useTheme } from '@/hooks/useTheme'
import WordReveal from '@/components/animations/WordReveal'
import { designTokens } from '@/config/designTokens'

const defaultProcessSteps = [
  {
    number: '01',
    title: 'Upptäckt',
    description:
      'Vi börjar med att förstå ditt företag, dina mål och din målgrupp. Genom research och workshops identifierar vi möjligheter och utmaningar.',
  },
  {
    number: '02',
    title: 'Design',
    description:
      'Vi skapar wireframes och prototyper som visualiserar din framtida hemsida. Varje pixel är genomtänkt för att maximera användarupplevelsen.',
  },
  {
    number: '03',
    title: 'Utveckling',
    description:
      'Vi bygger din hemsida med modern teknologi som Next.js och React. Resultatet är snabbt, säkert och skalbart.',
  },
  {
    number: '04',
    title: 'Lansering',
    description:
      'Vi testar noggrant, optimerar för SEO och prestanda, och lanserar din nya hemsida. Men det slutar inte där - vi fortsätter att stötta dig.',
  },
]

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mounted = useMounted()
  const { isLight } = useTheme()

  // Fetch content from CMS - enables live updates from /admin
  const { getValue } = useContentSection('process')

  // Build process steps from CMS with fallbacks
  const processSteps = useMemo(
    () => [
      {
        number: '01',
        title: getValue('T33', defaultProcessSteps[0].title),
        description: getValue('T37', defaultProcessSteps[0].description),
      },
      {
        number: '02',
        title: getValue('T34', defaultProcessSteps[1].title),
        description: getValue('T38', defaultProcessSteps[1].description),
      },
      {
        number: '03',
        title: getValue('T35', defaultProcessSteps[2].title),
        description: getValue('T39', defaultProcessSteps[2].description),
      },
      {
        number: '04',
        title: getValue('T36', defaultProcessSteps[3].title),
        description: getValue('T40', defaultProcessSteps[3].description),
      },
    ],
    [getValue]
  )

  // Get background image from CMS
  const bgImage = getValue(
    'B2',
    '/images/portfolio/prometheus_hero.webp'
  )

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5])

  return (
    <motion.section
      ref={sectionRef}
      className={`section-spacing-md relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50 text-gray-900'
          : 'bg-black text-white'
      }`}
      style={
        mounted
          ? {
              opacity,
              scale,
              perspective: 1000,
              rotateY,
            }
          : {
              opacity: 1,
              scale: 1,
              perspective: 1000,
              rotateY: 0,
            }
      }
      suppressHydrationWarning
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0 min-h-full">
        {/* Main background image - hidden in light mode */}
        {!isLight && (
          <>
            <Image
              src={bgImage}
              alt=""
              fill
              className="object-cover"
              style={{ opacity: 0.15 }}
              sizes="100vw"
              loading="lazy"
            />

            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-tertiary/5"
              style={{ opacity: 0.1, mixBlendMode: 'screen' }}
            />
          </>
        )}

        {/* Overlay for readability */}
        <div
          className={`absolute inset-0 ${
            isLight
              ? 'bg-gradient-to-br from-blue-100/40 via-transparent to-amber-100/40'
              : 'bg-black/85'
          }`}
        />

        {/* Light mode decorative elements */}
        {isLight && (
          <>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-sky-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-rose-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          className="mb-16 md:mb-24 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: Number(designTokens.animation.duration.slow.replace('s', '')),
            ease: designTokens.animation.framerEasing.smooth,
          }}
        >
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none tracking-tight">
            <WordReveal
              text="Vår Process"
              className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isLight ? 'from-gray-800 to-blue-600' : 'from-white to-tertiary'
              }`}
            />
          </h2>
          <p className={`text-2xl md:text-3xl max-w-3xl mx-auto font-medium ${isLight ? 'text-gray-600' : 'text-white/80'}`}>
            <WordReveal
              text="Från idé till lansering - så jobbar vi"
              delay={0.3}
              staggerDelay={0.05}
              className={isLight ? 'text-gray-600' : 'text-white/80'}
            />
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                delay: index * 0.15,
                duration: Number(designTokens.animation.duration.slow.replace('s', '')),
                ease: designTokens.animation.framerEasing.smooth,
              }}
              className={`group relative backdrop-blur-md p-8 rounded-lg transition-all duration-500 ${
                isLight
                  ? 'bg-white/70 border border-gray-200 hover:bg-white/90 hover:border-blue-300 hover:shadow-lg'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50'
              }`}
            >
              {/* Number indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent via-tertiary to-accent-dark text-white font-mono text-3xl font-black mb-6 group-hover:scale-110 transition-all duration-300 rounded-lg ${
                  isLight ? 'shadow-lg shadow-accent/20' : 'shadow-[0_0_30px_rgba(0,102,255,0.5)]'
                }`}
              >
                {step.number}
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className={`text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${
                  isLight
                    ? 'from-gray-800 via-blue-600 to-accent group-hover:from-accent group-hover:via-blue-500 group-hover:to-tertiary'
                    : 'from-white via-accent to-tertiary group-hover:from-accent group-hover:via-tertiary group-hover:to-accent'
                }`}
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className={`text-lg md:text-xl leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/70'}`}
              >
                {step.description}
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent via-tertiary to-transparent origin-left w-4/5"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
