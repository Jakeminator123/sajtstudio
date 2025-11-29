'use client';

import Footer from '@/components/layout/Footer';
import HeaderNav from '@/components/layout/HeaderNav';
import ContactForm from '@/components/ui/ContactForm';
import { useMounted } from '@/hooks/useMounted';
import { useTheme } from '@/hooks/useTheme';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

function Clock() {
  const mounted = useMounted();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time only on client - wait for mount
    if (!mounted) return;

    // Set time using requestAnimationFrame to avoid setState in effect warning
    requestAnimationFrame(() => {
      setTime(new Date());
    });

    // Use requestAnimationFrame for smoother updates and less DOM work
    let rafId: number | null = null;
    let lastUpdate = Date.now();

    const updateTime = () => {
      const now = Date.now();
      // Only update DOM if a full second has passed
      if (now - lastUpdate >= 1000) {
        setTime(new Date());
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(updateTime);
    };

    rafId = requestAnimationFrame(updateTime);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [mounted]);

  // Always render same placeholder on server to prevent hydration mismatch
  // Only show actual time after mount and time is set
  if (!mounted || !time) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <div className="text-5xl md:text-6xl font-bold mb-4 font-mono">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-white">
            --:--
          </span>
          <span className="text-3xl md:text-4xl text-white/50">:--</span>
        </div>
        <p className="text-white/70 text-sm uppercase tracking-wider">
          <span className="text-white">Stockholm</span>, <span className="text-red-400">Sverige</span>
        </p>
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center"
      suppressHydrationWarning
    >
      <div className="text-5xl md:text-6xl font-bold mb-4 font-mono">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-white">
          {hours}:{minutes}
        </span>
        <span className="text-3xl md:text-4xl text-white/50">:{seconds}</span>
      </div>
      <p className="text-white/70 text-sm uppercase tracking-wider">
        <span className="text-white">Stockholm</span>, <span className="text-red-400">Sverige</span>
      </p>
    </motion.div>
  );
}

export default function ContactPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const { isLight } = useTheme();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <>
      <HeaderNav />
      <main className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-br from-[#fef9e7] via-[#fff5e6] to-[#f0f7ff]"
          : "bg-black"
      }`}>
        <section ref={sectionRef} className="relative min-h-screen py-24 md:py-32 overflow-hidden">
          {/* Stunning gradient background with parallax */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              y: backgroundY,
              scale: backgroundScale,
            }}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
                isLight ? "bg-[#fef9e7]" : "bg-black"
              }`}
              style={{
                backgroundImage: 'url(/images/backgrounds/contact-gradient.webp)',
                filter: isLight
                  ? 'grayscale(30%) brightness(1.1) contrast(0.9) sepia(20%)'
                  : 'grayscale(100%) brightness(0.5) contrast(1.3)',
              }}
            />
            {/* Overlay gradients for depth - adapts to theme */}
            <div className={`absolute inset-0 ${
              isLight
                ? "bg-gradient-to-b from-[#fef9e7]/40 via-transparent to-[#fff5e6]/50"
                : "bg-gradient-to-b from-black/20 via-transparent to-black/30"
            }`} />
            <div className={`absolute inset-0 ${
              isLight
                ? "bg-gradient-to-r from-amber-100/20 via-transparent to-sky-100/20"
                : "bg-gradient-to-r from-white/10 via-transparent to-white/10"
            }`} />
          </motion.div>

          {/* Floating orbs animation */}
          <div className="absolute inset-0 z-[1]">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full"
                style={{
                  background: isLight
                    ? `radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)`
                    : `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 12}%`,
                }}
                animate={{
                  x: [0, 30, -20, 0],
                  y: [0, -40, 20, 0],
                  scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                  duration: 15 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Hero header with glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-16"
            >
              <motion.div
                className="inline-block mb-8"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black drop-shadow-2xl">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
                    isLight
                      ? "from-gray-800 via-blue-500 to-gray-800"
                      : "from-white via-blue-400 to-white"
                  }`}>
                    Kontakt
                  </span>
                </h1>
              </motion.div>

              <motion.p
                className={`text-xl md:text-2xl max-w-3xl mx-auto font-light ${
                  isLight ? "text-gray-700" : "text-white"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Låt oss skapa något <span className="text-blue-500 font-semibold">extraordinärt</span> tillsammans
              </motion.p>

              {/* Decorative line animation */}
              <motion.div
                className={`mt-8 mx-auto w-32 h-1 bg-gradient-to-r ${
                  isLight
                    ? "from-transparent via-gray-800 to-transparent"
                    : "from-transparent via-white to-transparent"
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
              {/* Left side - Contact info with glassmorphism */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className={`backdrop-blur-xl border rounded-3xl p-8 md:p-10 shadow-2xl ${
                  isLight
                    ? "bg-white/60 border-amber-200/50 shadow-amber-100/30"
                    : "bg-white/10 border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.h2
                  className="text-3xl font-bold mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className={isLight ? "text-gray-800" : "text-white"}>Låt oss </span>
                  <span className="text-blue-500">connecta</span>
                </motion.h2>

                <div className="space-y-6">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="group"
                  >
                    <p className={`text-sm mb-2 uppercase tracking-wider ${
                      isLight ? "text-gray-500" : "text-white/70"
                    }`}>E-post</p>
                    <a
                      href="mailto:hello@sajtstudio.se"
                      className={`text-xl md:text-2xl group-hover:text-blue-500 transition-all duration-300 flex items-center gap-2 ${
                        isLight ? "text-gray-800" : "text-white"
                      }`}
                    >
                      hello@sajtstudio.se
                      <motion.span
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        →
                      </motion.span>
                    </a>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="group"
                  >
                    <p className={`text-sm mb-2 uppercase tracking-wider ${
                      isLight ? "text-gray-500" : "text-white/70"
                    }`}>Telefon</p>
                    <a
                      href="tel:+46701234567"
                      className={`text-xl md:text-2xl group-hover:text-blue-500 transition-all duration-300 flex items-center gap-2 ${
                        isLight ? "text-gray-800" : "text-white"
                      }`}
                    >
                      +46 70 123 45 67
                      <motion.span
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        →
                      </motion.span>
                    </a>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="group"
                  >
                    <p className={`text-sm mb-2 uppercase tracking-wider ${
                      isLight ? "text-gray-500" : "text-white/70"
                    }`}>Kontor</p>
                    <p className={`text-xl md:text-2xl ${isLight ? "text-gray-800" : "text-white"}`}>
                      <span className={isLight ? "text-gray-800" : "text-white"}>Stockholm</span>, <span className="text-red-500">Sverige</span>
                    </p>
                  </motion.div>
                </div>

                <div className={`mt-12 pt-8 border-t ${
                  isLight ? "border-gray-300/50" : "border-white/20"
                }`}>
                  <motion.div
                    className={`backdrop-blur-sm rounded-2xl p-6 ${
                      isLight ? "bg-amber-50/50" : "bg-white/5"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Clock />
                  </motion.div>
                </div>

                {/* Social links */}
                <div className="mt-8 flex gap-4">
                  {[
                    { name: 'LinkedIn', color: 'blue' },
                    { name: 'Instagram', color: 'red' },
                    { name: 'GitHub', color: 'neutral' }
                  ].map((social, i) => (
                    <motion.button
                      key={social.name}
                      className={`px-4 py-2 backdrop-blur-sm border rounded-full transition-all ${
                        social.color === 'blue'
                          ? 'bg-blue-500/20 border-blue-400/30 text-blue-600 hover:bg-blue-500/30 hover:text-blue-500'
                          : social.color === 'red'
                          ? 'bg-red-500/20 border-red-400/30 text-red-600 hover:bg-red-500/30 hover:text-red-500'
                          : isLight
                          ? 'bg-gray-500/10 border-gray-400/30 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900'
                          : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      {social.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Right side - Contact form with glassmorphism */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`backdrop-blur-xl border rounded-3xl p-8 md:p-10 shadow-2xl ${
                  isLight
                    ? "bg-white/60 border-amber-200/50 shadow-amber-100/30"
                    : "bg-white/10 border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.h2
                  className="text-3xl font-bold mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className={isLight ? "text-gray-800" : "text-white"}>Skicka </span>
                  <span className="text-blue-500">meddelande</span>
                </motion.h2>

                <ContactForm />
              </motion.div>
            </div>

            {/* Decorative elements - svart-vit-röd-blå tema */}
            <motion.div
              className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

