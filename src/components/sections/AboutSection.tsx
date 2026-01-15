'use client'

// WordReveal available for future use
// import WordReveal from "@/components/animations/WordReveal";
import BrandReveal from '@/components/animations/BrandReveal'
import { useMounted } from '@/hooks/useMounted'
import { useContentSection } from '@/hooks/useContent'
import {
  MotionValue,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Animated counter component
function AnimatedNumber({
  value,
  suffix = '',
  duration = 2,
}: {
  value: string
  suffix?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '200px' })

  useEffect(() => {
    if (!isInView) return

    const numericValue = parseInt(value.replace(/\D/g, ''))
    if (isNaN(numericValue)) {
      // Use requestAnimationFrame to avoid setState in effect warning
      requestAnimationFrame(() => {
        setDisplayValue(value)
      })
      return
    }

    const startTime = Date.now()
    const startValue = 0
    const endValue = numericValue
    let rafId: number | null = null

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart)

      setDisplayValue(`${current}${suffix}`)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isInView, value, suffix, duration])

  return <span ref={ref}>{displayValue}</span>
}

// Particle component to avoid hooks in map
function FloatingParticle({
  particle,
  scrollYProgress,
  mounted,
}: {
  particle: { id: number; x: number; y: number; size: number; delay: number }
  scrollYProgress: MotionValue<number>
  mounted: boolean
}) {
  // Always call hooks - never conditionally
  const baseOpacity = useTransform(
    scrollYProgress,
    [0, 0.3 + particle.delay * 0.01, 0.7 + particle.delay * 0.01, 1],
    [0, 1, 1, 0]
  )
  const baseScale = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const baseY = useTransform(scrollYProgress, [0, 1], [0, -50 - particle.id * 2])

  // Create mounted MotionValue to use in transforms
  const mountedValue = useMotionValue(mounted ? 1 : 0)

  useEffect(() => {
    mountedValue.set(mounted ? 1 : 0)
  }, [mounted, mountedValue])

  // Multiply base values by mounted value
  const opacity = useTransform(
    [baseOpacity, mountedValue],
    (values: number[]) => values[0] * values[1]
  )
  const scale = useTransform([baseScale, mountedValue], (values: number[]) => values[0] * values[1])
  const y = useTransform([baseY, mountedValue], (values: number[]) => values[0] * values[1])

  return (
    <motion.div
      className="absolute rounded-full bg-accent/20"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        opacity,
        scale,
        y,
        pointerEvents: mounted ? 'auto' : 'none',
      }}
      animate={
        mounted
          ? {
              x: [0, Math.sin(particle.id) * 20, 0],
              y: [0, Math.cos(particle.id) * 20, 0],
            }
          : {}
      }
      transition={{
        duration: 3 + particle.id * 0.1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      suppressHydrationWarning
    />
  )
}

// Glowing orb component to avoid hooks in conditional rendering
function GlowingOrb({
  className,
  scrollYProgress,
  mounted,
  animateX,
  animateY,
  duration,
}: {
  className: string
  scrollYProgress: MotionValue<number>
  mounted: boolean
  animateX: number[]
  animateY: number[]
  duration: number
}) {
  // Always call hooks - never conditionally
  const baseOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.2])
  const baseScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1])

  // Create mounted MotionValue to use in transforms
  const mountedValue = useMotionValue(mounted ? 1 : 0)

  useEffect(() => {
    mountedValue.set(mounted ? 1 : 0)
  }, [mounted, mountedValue])

  // Combine base values with mounted value
  const opacity = useTransform([baseOpacity, mountedValue], (values: number[]) =>
    values[1] === 0 ? 0.2 : values[0]
  )
  const scale = useTransform([baseScale, mountedValue], (values: number[]) =>
    values[1] === 0 ? 1 : values[0]
  )

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        scale,
      }}
      animate={
        mounted
          ? {
              x: animateX,
              y: animateY,
            }
          : {}
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      suppressHydrationWarning
    />
  )
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mounted = useMounted()
  const { getValue } = useContentSection('about')
  const aboutTitle = getValue('T5', 'Vi är Sajtstudio')
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Morphing effects - text becomes smoke-like blob that disappears earlier
  // Smoke appears and disappears within first 60% of scroll
  const morphProgress = useTransform(scrollYProgress, [0.3, 0.6], [0, 1])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [1, 1, 0.5, 0, 0])
  const textScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [1, 1, 0.5, 0.2, 0])
  // Reduced blur for sharper text - max 5px instead of 30px
  const textBlurValue = useTransform(scrollYProgress, [0.4, 0.7], [0, 5])
  const textBlur = useTransform(textBlurValue, (val) => `blur(${val}px)`)

  // Additional transforms that must always be called, never conditional
  const accentGradientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.1, 0.03])

  // Floor transition scale
  const floorScale = useTransform(morphProgress, [0.7, 1], [0, 1])
  const floorOpacity = useTransform(morphProgress, [0.7, 1], [0, 1])

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const statsY = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 23) % 100,
    size: 2 + (i % 3),
    delay: i * 0.1,
  }))

  return (
    <section
      ref={sectionRef}
      className="section-spacing-md bg-gradient-to-b from-black via-gray-950 to-black text-white relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Animated background layers */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"
          style={mounted ? { y: backgroundY } : { y: 0 }}
          suppressHydrationWarning
        />

        {/* Accent gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-tertiary/10"
          style={{ opacity: mounted ? accentGradientOpacity : 0.3 }}
          suppressHydrationWarning
        />

        {/* Animated grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 102, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 102, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            opacity: mounted ? gridOpacity : 0.03,
          }}
          suppressHydrationWarning
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <FloatingParticle
            key={particle.id}
            particle={particle}
            scrollYProgress={scrollYProgress}
            mounted={mounted}
          />
        ))}

        {/* Glowing orbs */}
        <GlowingOrb
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          scrollYProgress={scrollYProgress}
          mounted={mounted}
          animateX={[0, 50, 0]}
          animateY={[0, 30, 0]}
          duration={8}
        />
        <GlowingOrb
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl"
          scrollYProgress={scrollYProgress}
          mounted={mounted}
          animateX={[0, -50, 0]}
          animateY={[0, -30, 0]}
          duration={10}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          {/* Main heading with beautiful reveal animation - NOT scroll-dependent */}
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-12 leading-none"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <BrandReveal text={aboutTitle} />
          </motion.h2>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Tagline - sharper, cleaner - NO scroll-dependent animation for better mobile perf */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              Din kreativa partner bakom framtidens digitala upplevelser
            </motion.p>

            {/* Main description - simplified animation */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed max-w-4xl mx-auto font-medium"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              Vi hjälper företag att få riktigt vassa hemsidor – snabbare och smartare.
            </motion.p>

            {/* Extended description - simplified animation for mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-base md:text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto space-y-6"
            >
              <p>
                Genom att kombinera{' '}
                <span className="text-accent font-semibold">artificiell intelligens</span>,
                genomtänkt design och modern webbutveckling (React, Next, Vite) bygger vi
                skräddarsydda sajter som både känns rätt för ditt varumärke och fungerar för dina
                kunder på riktigt.
              </p>

              <p className="text-white font-medium mt-4">
                Vi erbjuder två sätt att få din hemsida:
              </p>

              <div className="space-y-3 text-gray-300 mt-3">
                <p>
                  <span className="text-accent font-semibold">AI-generering:</span> Vår plattform
                  SajtMaskin låter dig skapa professionella webbplatser på minuter. Beskriv vad du
                  vill bygga, välj från hundratals templates och komponenter, och få en färdig sajt
                  med produktionsklar kod som du kan ladda ner direkt. Perfekt för snabb lansering
                  eller när du vill ha kontroll över processen själv.
                </p>
                <p>
                  <span className="text-tertiary font-semibold">Skräddarsydd utveckling:</span> Vi
                  bygger kompletta, unika hemsidor från grunden med AI-assisterad design och
                  utveckling. Varje projekt är anpassat efter ditt företag, dina mål och din
                  målgrupp. Vi tar hand om allt från analys och design till utveckling och
                  lansering.
                </p>
              </div>

              <p className="text-white font-medium mt-6">
                Vi utgår alltid från ditt företag och dina kunder:
              </p>

              <ul className="space-y-2 text-gray-300 mt-2">
                <li className="flex items-center gap-3">
                  <span className="text-accent">•</span>
                  vilken känsla ni vill förmedla
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-tertiary">•</span>
                  vilka ni vill nå
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-accent">•</span>
                  hur sidan faktiskt ska bidra till affären
                </li>
              </ul>

              <p className="text-white/80 italic mt-4">
                Resten löser vi med AI, struktur, design och teknik.
              </p>
            </motion.div>

            {/* Honest stats header */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-lg text-gray-400 text-center pt-8"
            >
              Lite ärlig statistik från en nystartad studio:
            </motion.p>

            {/* Enhanced stats grid - honest version */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
              style={mounted ? { y: statsY } : { y: 0 }}
              suppressHydrationWarning
            >
              {[
                {
                  number: '18',
                  label: 'nöjda kunder',
                  sublabel: 'Som vi fortfarande vågar titta i ögonen.',
                  color: 'accent',
                },
                {
                  number: '6',
                  label: 'fullfjädrade projekt',
                  sublabel: 'Från första skiss till färdig, skarp sajt.',
                  color: 'tertiary',
                },
                {
                  number: '93%',
                  label: 'passion, 7% kaffe',
                  sublabel: 'Vi tar våra projekt (och vårt kaffe) på stort allvar.',
                  color: 'accent',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 1.2 + index * 0.2,
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                  className="group relative"
                >
                  {/* Modern glassmorphism card - sharper, more defined */}
                  <div className="relative bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 overflow-hidden group-hover:bg-white/12 group-hover:border-accent/70 group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-500">
                    {/* Gradient border glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background:
                            stat.color === 'accent'
                              ? 'linear-gradient(to bottom right, rgba(0, 102, 255, 0.3), transparent, rgba(0, 102, 255, 0.2))'
                              : 'linear-gradient(to bottom right, rgba(255, 0, 51, 0.3), transparent, rgba(255, 0, 51, 0.2))',
                        }}
                      />
                      <div className="absolute inset-[1px] bg-black/50 backdrop-blur-xl rounded-2xl" />
                    </div>

                    {/* Subtle glow effect - reduced for sharper look */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500 rounded-2xl"
                      style={{
                        backgroundColor:
                          stat.color === 'accent'
                            ? 'rgba(0, 102, 255, 0.15)'
                            : 'rgba(255, 0, 51, 0.15)',
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-clip-text text-transparent"
                        style={
                          mounted
                            ? {
                                backgroundImage:
                                  stat.color === 'accent'
                                    ? 'linear-gradient(to right, #0066FF, #FF0033)'
                                    : 'linear-gradient(to right, #FF0033, #0066FF)',
                                // Reduced glow for sharper text
                                textShadow:
                                  '0 0 20px rgba(0, 102, 255, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.5)',
                                opacity:
                                  typeof textOpacity === 'number'
                                    ? textOpacity
                                    : (textOpacity?.get?.() ?? 1),
                                scale:
                                  typeof textScale === 'number'
                                    ? textScale
                                    : (textScale?.get?.() ?? 1),
                                filter:
                                  typeof textBlur === 'string'
                                    ? textBlur
                                    : (textBlur?.get?.() ?? 'blur(0px)'),
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                                textRendering: 'optimizeLegibility',
                              }
                            : {
                                backgroundImage:
                                  stat.color === 'accent'
                                    ? 'linear-gradient(to right, #0066FF, #FF0033)'
                                    : 'linear-gradient(to right, #FF0033, #0066FF)',
                                textShadow:
                                  '0 0 20px rgba(0, 102, 255, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.5)',
                                opacity: 1,
                                scale: 1,
                                filter: 'blur(0px)',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                                textRendering: 'optimizeLegibility',
                              }
                        }
                        suppressHydrationWarning
                      >
                        <AnimatedNumber value={stat.number} />
                      </motion.div>
                      <motion.div
                        className="text-sm md:text-base lg:text-lg text-gray-300 uppercase tracking-widest font-semibold mb-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.4 + index * 0.2 }}
                      >
                        {stat.label}
                      </motion.div>
                      {/* Sublabel - the honest description */}
                      <motion.p
                        className="text-xs md:text-sm text-gray-500 italic normal-case tracking-normal font-normal"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5 + index * 0.2 }}
                      >
                        {stat.sublabel}
                      </motion.p>
                    </div>

                    {/* Decorative corner accent */}
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50"
                      style={{
                        background:
                          stat.color === 'accent'
                            ? 'linear-gradient(to bottom right, rgba(0, 102, 255, 0.3), transparent)'
                            : 'linear-gradient(to bottom right, rgba(255, 0, 51, 0.3), transparent)',
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Final CTA */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="text-lg md:text-xl text-center text-accent font-medium pt-8"
            >
              Vill du se hur din nästa sajt kan se ut med AI + design i ryggen?
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Ambient glow effect - lightweight CSS-based replacement for heavy SVG blob */}
      {mounted && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[5] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Top-right accent glow */}
          <motion.div
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full 
                       bg-gradient-radial from-blue-500/20 via-blue-600/10 to-transparent blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Bottom-left rose glow - subtle, not aggressive red */}
          <motion.div
            className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full 
                       bg-gradient-radial from-rose-500/15 via-rose-600/5 to-transparent blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Center purple accent */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-[400px] h-[400px] rounded-full 
                       bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Floor/ceiling transition to next section */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[90] overflow-hidden"
        style={
          mounted
            ? {
                opacity:
                  typeof floorOpacity === 'number' ? floorOpacity : (floorOpacity?.get?.() ?? 0),
              }
            : { opacity: 0 }
        }
        suppressHydrationWarning
      >
        <motion.div
          className="w-full h-full"
          style={
            mounted
              ? {
                  backgroundImage: `linear-gradient(to top,
              rgba(0, 102, 255, 0.6) 0%,
              rgba(255, 0, 51, 0.5) 30%,
              rgba(0, 102, 255, 0.3) 60%,
              transparent 100%
            )`,
                  scaleY: typeof floorScale === 'number' ? floorScale : (floorScale?.get?.() ?? 0),
                  transformOrigin: 'bottom',
                  filter: 'blur(50px)',
                }
              : {
                  backgroundImage: `linear-gradient(to top,
              rgba(0, 102, 255, 0.6) 0%,
              rgba(255, 0, 51, 0.5) 30%,
              rgba(0, 102, 255, 0.3) 60%,
              transparent 100%
            )`,
                  scaleY: 0,
                  transformOrigin: 'bottom',
                  filter: 'blur(50px)',
                }
          }
          suppressHydrationWarning
        />
      </motion.div>
    </section>
  )
}
