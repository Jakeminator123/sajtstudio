"use client";

import WordReveal from "@/components/animations/WordReveal";
import { useMounted } from "@/hooks/useMounted";
import { MotionValue, motion, useInView, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Animated counter component
function AnimatedNumber({ value, suffix = "", duration = 2 }: { value: string; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseInt(value.replace(/\D/g, ""));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;
    let rafId: number | null = null;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      setDisplayValue(`${current}${suffix}`);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isInView, value, suffix, duration]);

  return <span ref={ref}>{displayValue}</span>;
}

// Particle component to avoid hooks in map
function FloatingParticle({
  particle,
  scrollYProgress,
  mounted,
}: {
  particle: { id: number; x: number; y: number; size: number; delay: number };
  scrollYProgress: MotionValue<number>;
  mounted: boolean;
}) {
  // Always call hooks - never conditionally
  const baseOpacity = useTransform(
    scrollYProgress,
    [0, 0.3 + particle.delay * 0.01, 0.7 + particle.delay * 0.01, 1],
    [0, 1, 1, 0]
  );
  const baseScale = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const baseY = useTransform(scrollYProgress, [0, 1], [0, -50 - particle.id * 2]);

  // Create mounted MotionValue to use in transforms
  const mountedValue = useMotionValue(mounted ? 1 : 0);

  useEffect(() => {
    mountedValue.set(mounted ? 1 : 0);
  }, [mounted, mountedValue]);

  // Multiply base values by mounted value
  const opacity = useTransform([baseOpacity, mountedValue], (values: number[]) => values[0] * values[1]);
  const scale = useTransform([baseScale, mountedValue], (values: number[]) => values[0] * values[1]);
  const y = useTransform([baseY, mountedValue], (values: number[]) => values[0] * values[1]);

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
      animate={mounted ? {
        x: [0, Math.sin(particle.id) * 20, 0],
        y: [0, Math.cos(particle.id) * 20, 0],
      } : {}}
      transition={{
        duration: 3 + particle.id * 0.1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      suppressHydrationWarning
    />
  );
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
  className: string;
  scrollYProgress: MotionValue<number>;
  mounted: boolean;
  animateX: number[];
  animateY: number[];
  duration: number;
}) {
  // Always call hooks - never conditionally
  const baseOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.2]);
  const baseScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

  // Create mounted MotionValue to use in transforms
  const mountedValue = useMotionValue(mounted ? 1 : 0);

  useEffect(() => {
    mountedValue.set(mounted ? 1 : 0);
  }, [mounted, mountedValue]);

  // Combine base values with mounted value
  const opacity = useTransform([baseOpacity, mountedValue], (values: number[]) =>
    values[1] === 0 ? 0.2 : values[0]
  );
  const scale = useTransform([baseScale, mountedValue], (values: number[]) =>
    values[1] === 0 ? 1 : values[0]
  );

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        scale,
      }}
      animate={mounted ? {
        x: animateX,
        y: animateY,
      } : {}}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      suppressHydrationWarning
    />
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Morphing effects - text becomes smoke-like blob that disappears earlier
  // Smoke appears and disappears within first 60% of scroll
  const morphProgress = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [1, 1, 0.5, 0, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 0.8, 1], [1, 1, 0.5, 0.2, 0]);
  const textBlurValue = useTransform(scrollYProgress, [0.4, 0.7], [0, 30]);
  const textBlur = useTransform(textBlurValue, (val) => `blur(${val}px)`);

  // Additional transforms that must always be called, never conditional
  const accentGradientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.1, 0.03]);

  // Smoke-like blob - drifts around and fades away like smoke
  // More organic, wispy movement
  const blobXPercent = useTransform(
    morphProgress,
    [0, 0.3, 0.6, 0.8, 1],
    [50, 30, 70, 50, 50],
    { clamp: false }
  );
  // Rises up and dissipates like smoke
  const blobYPercent = useTransform(
    morphProgress,
    [0, 0.4, 0.7, 1],
    [60, 40, 20, 10],
    { clamp: false }
  );
  const blobX = useTransform(blobXPercent, (val) => `${val}%`);
  const blobY = useTransform(blobYPercent, (val) => `${val}%`);
  // Grows then shrinks and fades like smoke dissipating
  const blobScale = useTransform(
    morphProgress,
    [0, 0.3, 0.6, 0.8, 1],
    [0.3, 1.0, 1.3, 0.8, 0.2],
    { clamp: false }
  );
  // Fades away like smoke - appears quickly, disappears gradually
  const blobOpacity = useTransform(morphProgress, [0, 0.2, 0.5, 0.8, 1], [0, 0.7, 0.9, 0.4, 0]);

  // Blur increases as smoke dissipates (becomes more wispy)
  const blobBlur = useTransform(morphProgress, [0, 0.5, 1], [30, 50, 80]);
  const blobBlurString = useTransform(blobBlur, (val) => `blur(${val}px)`);

  // Smoke-like blob shape - more wispy and organic, less defined edges
  const blobPath = useTransform(morphProgress, (progress) => {
    // Create a wispy, smoke-like path that morphs and dissipates
    const t = progress;
    const w = 200;
    const h = 200;
    const complexity = 16; // More points for smoother, wispier edges
    const baseRadius = w / 3;

    // Smoke becomes more irregular and wispy as it dissipates
    const irregularity = 0.6 + t * 0.4; // More irregular as it fades
    const wispiness = t * 0.5; // Becomes wispier

    let path = `M ${w / 2 + Math.cos(0) * baseRadius * (1 + t * 0.5) * (1 + Math.sin(0 * 3) * wispiness)} ${h / 2 + Math.sin(0) * baseRadius * (1 + t * 0.5) * (1 + Math.cos(0 * 3) * wispiness)}`;

    for (let i = 1; i <= complexity; i++) {
      const angle = (i / complexity) * Math.PI * 2;
      // More variation for smoke-like wispiness
      const radiusVariation = Math.sin(angle * 6 + t * Math.PI * 4) * irregularity * 0.5;
      const wispyVariation = Math.sin(angle * 8 + t * Math.PI * 5) * wispiness * 0.3;
      const radius = baseRadius * (1 + t * 0.5 + radiusVariation + wispyVariation);
      const x = w / 2 + Math.cos(angle) * radius;
      const y = h / 2 + Math.sin(angle) * radius;
      path += ` L ${x} ${y}`;
    }
    path += ' Z';
    return path;
  });

  // Floor transition scale
  const floorScale = useTransform(morphProgress, [0.7, 1], [0, 1]);
  const floorOpacity = useTransform(morphProgress, [0.7, 1], [0, 1]);

  // Create mounted MotionValue to use in transforms
  const mountedValue = useMotionValue(mounted ? 1 : 0);

  useEffect(() => {
    mountedValue.set(mounted ? 1 : 0);
  }, [mounted, mountedValue]);

  // Combine blob opacity with mounted value
  const finalBlobOpacity = useTransform([blobOpacity, mountedValue], (values: number[]) => values[0] * values[1]);

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const statsY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 23) % 100,
    size: 2 + (i % 3),
    delay: i * 0.1,
  }));

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
            backgroundSize: "80px 80px",
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          {/* Main heading with enhanced styling - morphs to blob */}
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-12 leading-none"
            style={mounted ? {
              textShadow: "0 0 100px rgba(0, 102, 255, 0.5), 0 0 150px rgba(0, 102, 255, 0.3), 0 0 200px rgba(0, 102, 255, 0.1)",
              opacity: textOpacity,
              scale: textScale,
              filter: textBlur,
            } : {
              textShadow: "0 0 100px rgba(0, 102, 255, 0.5), 0 0 150px rgba(0, 102, 255, 0.3), 0 0 200px rgba(0, 102, 255, 0.1)",
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            suppressHydrationWarning
          >
            <WordReveal
              text="Vi är Sajtstudio"
              className="bg-gradient-to-r from-white via-accent to-tertiary bg-clip-text text-transparent"
            />
          </motion.h2>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Tagline - morphs to blob */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={mounted ? {
                opacity: textOpacity,
                scale: textScale,
                filter: textBlur,
              } : {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              suppressHydrationWarning
            >
              <WordReveal
                text="Den kreativa partnern bakom framtidens digitala upplevelser"
                delay={0.3}
                staggerDelay={0.04}
                className="text-white"
              />
            </motion.p>

            {/* Description - morphs to blob */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto"
              style={mounted ? {
                opacity: textOpacity,
                scale: textScale,
                filter: textBlur,
              } : {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              suppressHydrationWarning
            >
              Vi kombinerar världsklass design, forskning och teknologi för att skapa
              hemsidor som inte bara ser bra ut - utan som gör skillnad för ditt företag.
            </motion.p>

            {/* Enhanced stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 pt-12 sm:pt-16"
              style={mounted ? { y: statsY } : { y: 0 }}
              suppressHydrationWarning
            >
              {[
                { number: "25+", label: "Nöjda kunder", color: "accent" },
                { number: "50+", label: "Projekt levererade", color: "tertiary" },
                { number: "100%", label: "Passion", color: "accent" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 1.2 + index * 0.2,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative"
                >
                  {/* Glassmorphism card */}
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 overflow-hidden group-hover:bg-white/10 group-hover:border-accent/50 transition-all duration-500">
                    {/* Gradient border glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: stat.color === 'accent'
                            ? 'linear-gradient(to bottom right, rgba(0, 102, 255, 0.3), transparent, rgba(0, 102, 255, 0.2))'
                            : 'linear-gradient(to bottom right, rgba(255, 0, 51, 0.3), transparent, rgba(255, 0, 51, 0.2))'
                        }}
                      />
                      <div className="absolute inset-[1px] bg-black/50 backdrop-blur-xl rounded-2xl" />
                    </div>

                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 rounded-2xl"
                      style={{
                        backgroundColor: stat.color === 'accent'
                          ? 'rgba(0, 102, 255, 0.2)'
                          : 'rgba(255, 0, 51, 0.2)'
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-clip-text text-transparent"
                        style={mounted ? {
                          backgroundImage: stat.color === 'accent'
                            ? 'linear-gradient(to right, #0066FF, #FF0033)'
                            : 'linear-gradient(to right, #FF0033, #0066FF)',
                          textShadow: '0 0 60px rgba(0, 102, 255, 0.5)',
                          opacity: typeof textOpacity === 'number' ? textOpacity : (textOpacity?.get?.() ?? 1),
                          scale: typeof textScale === 'number' ? textScale : (textScale?.get?.() ?? 1),
                          filter: typeof textBlur === 'string' ? textBlur : (textBlur?.get?.() ?? 'blur(0px)'),
                        } : {
                          backgroundImage: stat.color === 'accent'
                            ? 'linear-gradient(to right, #0066FF, #FF0033)'
                            : 'linear-gradient(to right, #FF0033, #0066FF)',
                          textShadow: '0 0 60px rgba(0, 102, 255, 0.5)',
                          opacity: 0,
                          scale: 1,
                          filter: 'blur(0px)',
                        }}
                        suppressHydrationWarning
                      >
                        <AnimatedNumber value={stat.number} />
                      </motion.div>
                      <motion.div
                        className="text-sm md:text-base lg:text-lg text-gray-300 uppercase tracking-widest font-semibold"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.4 + index * 0.2 }}
                      >
                        {stat.label}
                      </motion.div>
                    </div>

                    {/* Decorative corner accent */}
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-50"
                      style={{
                        background: stat.color === 'accent'
                          ? 'linear-gradient(to bottom right, rgba(0, 102, 255, 0.3), transparent)'
                          : 'linear-gradient(to bottom right, rgba(255, 0, 51, 0.3), transparent)'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Morphing blob that travels around viewport and becomes floor/ceiling */}
      {mounted && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[100]"
          style={{
            opacity: finalBlobOpacity,
          }}
          suppressHydrationWarning
        >
          <motion.div
            className="absolute w-[600px] h-[600px]"
            style={{
              left: blobX,
              top: blobY,
              x: "-50%",
              y: "-50%",
              scale: blobScale,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              mass: 1,
            }}
            suppressHydrationWarning
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              preserveAspectRatio="xMidYMid meet"
              suppressHydrationWarning
            >
              <motion.path
                d={blobPath}
                fill="url(#blobGradient)"
                style={{
                  filter: blobBlurString,
                }}
                suppressHydrationWarning
              />
              <defs>
                <radialGradient id="blobGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255, 0, 51, 0.9)" />
                  <stop offset="40%" stopColor="rgba(255, 0, 51, 0.6)" />
                  <stop offset="70%" stopColor="rgba(255, 0, 51, 0.3)" />
                  <stop offset="100%" stopColor="rgba(255, 0, 51, 0)" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Floor/ceiling transition to next section */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[90] overflow-hidden"
        style={mounted ? {
          opacity: typeof floorOpacity === 'number' ? floorOpacity : (floorOpacity?.get?.() ?? 0),
        } : { opacity: 0 }}
        suppressHydrationWarning
      >
        <motion.div
          className="w-full h-full"
          style={mounted ? {
            backgroundImage: `linear-gradient(to top, 
              rgba(0, 102, 255, 0.6) 0%,
              rgba(255, 0, 51, 0.5) 30%,
              rgba(0, 102, 255, 0.3) 60%,
              transparent 100%
            )`,
            scaleY: typeof floorScale === 'number' ? floorScale : (floorScale?.get?.() ?? 0),
            transformOrigin: 'bottom',
            filter: 'blur(50px)',
          } : {
            backgroundImage: `linear-gradient(to top, 
              rgba(0, 102, 255, 0.6) 0%,
              rgba(255, 0, 51, 0.5) 30%,
              rgba(0, 102, 255, 0.3) 60%,
              transparent 100%
            )`,
            scaleY: 0,
            transformOrigin: 'bottom',
            filter: 'blur(50px)',
          }}
          suppressHydrationWarning
        />
      </motion.div>
    </section>
  );
}

