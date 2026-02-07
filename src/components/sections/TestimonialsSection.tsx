'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import WordReveal from '@/components/animations/WordReveal'
import { designTokens } from '@/config/designTokens'
import { useContentSection } from '@/hooks/useContent'
import { useTheme } from '@/hooks/useTheme'

const defaultTestimonials = [
  {
    quote:
      'They built exactly what we envisioned — an AI-powered platform that gives our users a real competitive edge. Professional, fast, and technically brilliant.',
    author: 'Martin Arnold',
    company: 'prometheuspoker.com',
    role: 'CEO, Prometheus Poker',
    highlight: 'Framkant',
    image: '/images/PrometheusPoker.webp',
  },
  {
    quote:
      'Sajtstudio har lyft vår digitala närvaro rejält. Professionellt, snabbt och med en förståelse för vad vi faktiskt behöver.',
    author: 'Joakim Hallsten',
    company: 'raymondmedia.se',
    role: 'VD, Raymond Media AB',
    highlight: 'Lyft vår närvaro',
    image: '/images/RaymondMedia.webp',
  },
  {
    quote:
      'En modern sajt som speglar kvaliteten i vår verksamhet. Resultatet överträffade förväntningarna.',
    author: 'DG97',
    company: 'dg97.se',
    role: 'Kontorshotell, Stockholm',
    highlight: 'Överträffade förväntningarna',
    image: '/images/BilenochJag.webp',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { isLight } = useTheme()

  // Fetch content from CMS - enables live updates from /admin
  const { getValue } = useContentSection('testimonials')

  // Build testimonials from CMS with fallbacks
  const testimonials = useMemo(
    () => [
      {
        quote: getValue('T41', defaultTestimonials[0].quote),
        author: getValue('T44', defaultTestimonials[0].author),
        company: getValue('T47', defaultTestimonials[0].company),
        role: defaultTestimonials[0].role,
        highlight: defaultTestimonials[0].highlight,
        image: defaultTestimonials[0].image,
      },
      {
        quote: getValue('T42', defaultTestimonials[1].quote),
        author: getValue('T45', defaultTestimonials[1].author),
        company: getValue('T48', defaultTestimonials[1].company),
        role: defaultTestimonials[1].role,
        highlight: defaultTestimonials[1].highlight,
        image: defaultTestimonials[1].image,
      },
      {
        quote: getValue('T43', defaultTestimonials[2].quote),
        author: getValue('T46', defaultTestimonials[2].author),
        company: getValue('T49', defaultTestimonials[2].company),
        role: defaultTestimonials[2].role,
        highlight: defaultTestimonials[2].highlight,
        image: defaultTestimonials[2].image,
      },
    ],
    [getValue]
  )

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])

  return (
    <motion.section
      ref={sectionRef}
      className={`section-spacing-md relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-br from-amber-50 via-sky-50 to-rose-50 text-gray-900'
          : 'bg-black text-white'
      }`}
      style={{
        opacity,
        scale,
      }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 min-h-full">
        {/* Subtle gradient background - hidden in light mode */}
        {!isLight && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-tertiary/10"
            style={{ opacity: 0.15 }}
          />
        )}

        {/* Overlay for readability */}
        <div
          className={`absolute inset-0 ${
            isLight
              ? 'bg-gradient-to-br from-sky-100/50 via-transparent to-rose-100/50'
              : 'bg-black/85'
          }`}
        />

        {/* Light mode decorative elements */}
        {isLight && (
          <>
            <div className="absolute top-10 right-20 w-80 h-80 bg-gradient-to-bl from-blue-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-20 w-72 h-72 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
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
              text="Vad Våra Kunder Säger"
              className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isLight ? 'from-gray-800 to-blue-600' : 'from-white to-tertiary'
              }`}
            />
          </h2>
          <motion.p
            className={`text-2xl md:text-3xl max-w-3xl mx-auto font-medium ${isLight ? 'text-gray-600' : 'text-white/80'}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Läs vad våra kunder säger om att arbeta med oss
          </motion.p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                delay: index * 0.15,
                duration: Number(designTokens.animation.duration.slow.replace('s', '')),
                ease: designTokens.animation.framerEasing.smooth,
              }}
              className={`group relative backdrop-blur-md p-8 transition-all duration-500 ${
                isLight
                  ? 'bg-white/70 border border-gray-200 hover:bg-white/90 hover:border-blue-300 hover:shadow-lg'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50'
              }`}
            >
              {/* Client site screenshot */}
              {testimonial.image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.15 }}
                  className="relative w-full h-40 mb-5 rounded-lg overflow-hidden"
                >
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.author} - ${testimonial.company}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 ${
                      isLight
                        ? 'bg-gradient-to-t from-white/30 to-transparent'
                        : 'bg-gradient-to-t from-black/40 to-transparent'
                    }`}
                  />
                </motion.div>
              )}

              {/* Highlight badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className={`inline-block px-4 py-2 mb-5 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-accent to-tertiary text-white rounded-full ${
                  isLight ? 'shadow-md' : 'shadow-[0_0_20px_rgba(0,102,255,0.3)]'
                }`}
              >
                {testimonial.highlight}
              </motion.div>

              {/* Quote */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className={`text-lg md:text-xl leading-relaxed mb-6 italic ${isLight ? 'text-gray-700' : 'text-white/80'}`}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </motion.p>

              {/* Author */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.4 }}
                className={`border-t pt-6 ${isLight ? 'border-gray-200' : 'border-white/20'}`}
              >
                <div className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {testimonial.author}
                </div>
                <div className={`text-sm ${isLight ? 'text-gray-500' : 'text-white/60'}`}>
                  {testimonial.role}, {testimonial.company}
                </div>
              </motion.div>

              {/* Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-tertiary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
