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
      <motion.div 
        className="absolute inset-0 bg-white z-[10]"
        initial={{ opacity: 1 }}
        animate={{ opacity: whiteFadeOut ? 0 : 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      {/* Split screen background - fades in as white fades out */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Technical/boring side */}
          <div className="absolute inset-0 opacity-10">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-purple-100 via-pink-50 to-blue-100">
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
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
              {/* Timer or Play button */}
              <motion.div 
                className="absolute -top-20 left-1/2 -translate-x-1/2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {!gameStarted && countdown > 0 && (
                  <p className="text-2xl font-bold text-gray-600">
                    Demo time: {countdown}s
                  </p>
                )}
                {!isPlaying && (countdown === 0 || gameStarted) && (
                  <motion.button
                    onClick={handlePlayGame}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎮 Play Pac-Man
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
                        className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none"
                      >
                        <div className="text-center">
                          <h3 className="text-4xl font-bold text-white mb-4">
                            {gameStarted ? "PAUSED" : "DEMO FINISHED"}
                          </h3>
                          <p className="text-xl text-white/80 mb-6">
                            Vi kan bygga allt från spel till företagslösningar!
                          </p>
                          <p className="text-sm text-white/60">
                            Klicka på "Play Pac-Man" ovanför för att spela
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Tech vs Design labels */}
              <div className="absolute -left-32 top-1/2 -translate-y-1/2 text-right">
                <p className="text-sm font-mono text-gray-500">TECHNICAL</p>
                <p className="text-xs text-gray-400">• Data-driven</p>
                <p className="text-xs text-gray-400">• Functional</p>
                <p className="text-xs text-gray-400">• Interactive</p>
              </div>
              
              <div className="absolute -right-32 top-1/2 -translate-y-1/2">
                <p className="text-sm font-bold text-purple-600">CREATIVE</p>
                <p className="text-xs text-purple-400">• Beautiful</p>
                <p className="text-xs text-purple-400">• Animated</p>
                <p className="text-xs text-purple-400">• Engaging</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animation capabilities section */}
        <motion.div 
          className="mt-32 mb-16 px-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl md:text-4xl font-black text-center mb-16">
            <span className="text-gray-600">Så skapar vi </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              animationer som betyder något
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Motion Design */}
            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-4">🎭</div>
              <h4 className="text-xl font-bold mb-3">Motion Design</h4>
              <p className="text-gray-600 mb-4">
                Vi använder Framer Motion för flytande, prestanda-optimerade animationer som reagerar på användarinteraktion.
              </p>
              <code className="text-sm bg-white/80 px-2 py-1 rounded">useScroll, useTransform, useSpring</code>
            </motion.div>

            {/* 3D & WebGL */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl mb-4">🌐</div>
              <h4 className="text-xl font-bold mb-3">3D & WebGL</h4>
              <p className="text-gray-600 mb-4">
                Three.js och React Three Fiber för immersiva 3D-upplevelser direkt i webbläsaren.
              </p>
              <code className="text-sm bg-white/80 px-2 py-1 rounded">@react-three/fiber, drei</code>
            </motion.div>

            {/* Interactive Storytelling */}
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl mb-4">📖</div>
              <h4 className="text-xl font-bold mb-3">Scrollytelling</h4>
              <p className="text-gray-600 mb-4">
                Scroll-drivna narrativ som guidar besökaren genom er story med visuell magi.
              </p>
              <code className="text-sm bg-white/80 px-2 py-1 rounded">Intersection Observer, GSAP</code>
            </motion.div>
          </div>

          {/* Tech stack */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-lg text-gray-600 mb-4">Vårt animations-arsenal:</p>
            <div className="flex flex-wrap justify-center gap-3">
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
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.05, backgroundColor: "#e0e7ff" }}
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
