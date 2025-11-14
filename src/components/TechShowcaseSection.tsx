"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function TechShowcaseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [showTechText, setShowTechText] = useState(false);
  const [showPacman, setShowPacman] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteFadeOut, setWhiteFadeOut] = useState(false);

  useEffect(() => {
    if (isInView) {
      // Start white fade out immediately when section comes into view
      setWhiteFadeOut(true);
      
      // Show text after 0.5s
      const textTimer = setTimeout(() => setShowTechText(true), 500);
      
      // Show Pacman after 2s
      const pacmanTimer = setTimeout(() => setShowPacman(true), 2000);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(pacmanTimer);
      };
    }
  }, [isInView]);

  useEffect(() => {
    // Countdown when Pacman shows and game hasn't started yet
    let countdownInterval: NodeJS.Timeout;
    if (showPacman && countdown > 0 && !gameStarted && !isPlaying) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showPacman, countdown, gameStarted, isPlaying]);

  const handlePlayGame = () => {
    setIsPlaying(true);
    setGameStarted(true);
    setCountdown(0); // Hide countdown
  };

  return (
    <motion.section 
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      initial={{ backgroundColor: "#ffffff" }}
      animate={{ backgroundColor: isInView ? "#ffffff" : "#ffffff" }}
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Start from white (coming from HeroAnimation white fade) */}
      {/* This white overlay fades out when section comes into view */}
      {/* Ensures smooth transition from HeroAnimation white fade */}
      <motion.div 
        className="absolute inset-0 bg-white z-[10]"
        initial={{ opacity: 1 }}
        animate={{ opacity: whiteFadeOut ? 0 : 1 }}
        transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
      />
      
      {/* Split screen background - fades in as white fades out */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Technical/boring side */}
          <div className="absolute inset-0 opacity-20">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-purple-200 via-pink-100 to-blue-200">
          {/* Design/creative side */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  background: `radial-gradient(circle, ${['#FF0080', '#00F0FF', '#FFD700', '#00FF88'][i % 4]} 0%, transparent 70%)`,
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  scale: [1, Math.random() + 0.5, 1],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content - only show when section is in view */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 pt-32 md:pt-40">
        <AnimatePresence mode="wait">
          {isInView && showTechText && !showPacman && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center max-w-4xl"
            >
              <motion.h2 
                className="text-4xl md:text-6xl font-black mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <span className="text-gray-500">Ok, enough with the </span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  flashy animations
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-2xl md:text-3xl text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                We can also build <span className="font-mono bg-gray-100 px-2 py-1 rounded">technical stuff</span>...
              </motion.p>
            </motion.div>
          )}

          {isInView && showPacman && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="relative"
            >
              {/* Timer or Play button - positioned above game, always visible */}
              <motion.div 
                className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 text-center z-20 w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {!gameStarted && countdown > 0 && (
                  <p className="text-xl md:text-2xl font-bold text-gray-600">
                    Demo time: {countdown}s
                  </p>
                )}
                {!isPlaying && (countdown === 0 || gameStarted) && (
                  <motion.button
                    onClick={handlePlayGame}
                    className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg text-base md:text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎮 {gameStarted ? "Spela igen" : "Spela Pac-Man"}
                  </motion.button>
                )}
              </motion.div>

              {/* Pacman container */}
              <div className="relative">
                {/* 8-bit style frame */}
                <div className="absolute inset-0 -m-4 border-8 border-black rounded-lg" 
                  style={{
                    imageRendering: 'pixelated',
                    boxShadow: `
                      4px 4px 0 0 #333,
                      8px 8px 0 0 #666,
                      12px 12px 0 0 #999
                    `
                  }}
                />
                
                {/* Pacman game iframe */}
                <motion.div
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    width: isPlaying ? 'min(90vw, 800px)' : 'min(90vw, 600px)',
                    height: isPlaying ? 'min(90vw, 800px)' : 'min(90vw, 600px)',
                  }}
                  animate={{
                    scale: isPlaying ? 1.2 : (countdown === 0 && !isPlaying ? [1, 0.95, 1] : 1),
                    rotate: countdown === 0 && !isPlaying ? [0, -5, 5, -5, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                >
                  <iframe
                    src="/bla-pacman.html"
                    title="Pacman Demo"
                    className="w-full h-full border-0"
                    style={{ pointerEvents: isPlaying ? 'auto' : (countdown > 0 ? 'auto' : 'none') }}
                  />
                  
                  {/* Game over overlay */}
                  <AnimatePresence>
                    {countdown === 0 && !isPlaying && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto"
                      >
                        <div className="text-center px-4">
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {gameStarted ? "PAUSAT" : "DEMO KLAR"}
                          </h3>
                          <p className="text-lg md:text-xl text-white/80 mb-6">
                            Vi kan bygga allt från spel till företagslösningar!
                          </p>
                          <motion.button
                            onClick={handlePlayGame}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg text-lg md:text-xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            🎮 Spela igen
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Tech vs Design labels - improved visibility and design */}
              <div className="absolute -left-40 md:-left-48 top-1/2 -translate-y-1/2 text-right space-y-2">
                <p className="text-lg md:text-xl font-black text-gray-700 tracking-wider mb-2">TECHNICAL</p>
                <p className="text-sm md:text-base text-gray-600 font-medium">• Data-driven</p>
                <p className="text-sm md:text-base text-gray-600 font-medium">• Functional</p>
                <p className="text-sm md:text-base text-gray-600 font-medium">• Interactive</p>
              </div>
              
              <div className="absolute -right-40 md:-right-48 top-1/2 -translate-y-1/2 space-y-2">
                <p className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider mb-2">CREATIVE</p>
                <p className="text-sm md:text-base text-purple-600 font-medium">• Beautiful</p>
                <p className="text-sm md:text-base text-purple-600 font-medium">• Animated</p>
                <p className="text-sm md:text-base text-purple-600 font-medium">• Engaging</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animation capabilities section - improved design */}
        <motion.div 
          className="mt-32 mb-16 px-6 md:px-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-20 leading-tight">
            <span className="text-gray-800">Så skapar vi </span>
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              animationer som betyder något
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Motion Design */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm border border-purple-200/50 shadow-xl p-8 md:p-10 rounded-3xl hover:shadow-2xl transition-all"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-6">🎭</div>
              <h4 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">Motion Design</h4>
              <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
                Vi använder Framer Motion för flytande, prestanda-optimerade animationer som reagerar på användarinteraktion.
              </p>
              <code className="text-xs md:text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-2 rounded-lg font-mono font-semibold block">useScroll, useTransform, useSpring</code>
            </motion.div>

            {/* 3D & WebGL */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm border border-blue-200/50 shadow-xl p-8 md:p-10 rounded-3xl hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-6">🌐</div>
              <h4 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">3D & WebGL</h4>
              <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
                Three.js och React Three Fiber för immersiva 3D-upplevelser direkt i webbläsaren.
              </p>
              <code className="text-xs md:text-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-3 py-2 rounded-lg font-mono font-semibold block">@react-three/fiber, drei</code>
            </motion.div>

            {/* Interactive Storytelling */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm border border-green-200/50 shadow-xl p-8 md:p-10 rounded-3xl hover:shadow-2xl transition-all"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-6">📖</div>
              <h4 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">Scrollytelling</h4>
              <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
                Scroll-drivna narrativ som guidar besökaren genom er story med visuell magi.
              </p>
              <code className="text-xs md:text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-lg font-mono font-semibold block">Intersection Observer, GSAP</code>
            </motion.div>
          </div>

          {/* Tech stack - improved design */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xl md:text-2xl text-gray-700 font-semibold mb-6">Vårt animations-arsenal:</p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {[
                "Framer Motion",
                "Three.js",
                "GSAP",
                "Lottie",
                "CSS Animations",
                "SVG Morphing",
                "WebGL Shaders",
                "Canvas API"
              ].map((tech, index) => (
                <motion.span
                  key={tech}
                  className="px-5 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-sm md:text-base font-semibold text-gray-800 shadow-md hover:shadow-lg transition-all"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6", borderColor: "#d1d5db" }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
