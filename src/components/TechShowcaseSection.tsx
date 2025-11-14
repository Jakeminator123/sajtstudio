"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function TechShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pacmanRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [showTechText, setShowTechText] = useState(false);
  const [showPacman, setShowPacman] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteFadeOut, setWhiteFadeOut] = useState(false);
  const [hasScrolledToPacman, setHasScrolledToPacman] = useState(false);

  useEffect(() => {
    if (isInView) {
      // Start white fade out immediately when section comes into view
      setWhiteFadeOut(true);
      
      // Show text after 0.5s
      const textTimer = setTimeout(() => setShowTechText(true), 500);
      
      // Show Pacman after 2s
      const pacmanTimer = setTimeout(() => setShowPacman(true), 2000);
      
      // Auto-scroll to Pacman game when white fade is almost done
      // This creates the optical illusion of fading into the centered game
      // Scroll happens when white fade is ~80% complete (1.2 seconds into 1.5s fade)
      const scrollTimer = setTimeout(() => {
        if (pacmanRef.current && !hasScrolledToPacman) {
          // Use requestAnimationFrame for smoother scroll
          requestAnimationFrame(() => {
            pacmanRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
            setHasScrolledToPacman(true);
          });
        }
      }, 1200); // Start scrolling when white fade is ~80% complete (1.2s into 1.5s fade)
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(pacmanTimer);
        clearTimeout(scrollTimer);
      };
    }
  }, [isInView, hasScrolledToPacman]);

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

  // Prevent page scroll when playing Pacman game (arrow keys)
  useEffect(() => {
    // Always restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      // Re-enable scroll when game stops
      document.body.style.overflow = '';
      return;
    }

    // Disable body scroll completely when game is active
    document.body.style.overflow = 'hidden';

    const preventScroll = (e: KeyboardEvent) => {
      // Arrow keys and Space - prevent page scroll when game is active
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent all wheel scroll when game is active
    const preventWheelScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent touch scroll on mobile when game is active
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent scroll on game container
    const preventGameScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener('keydown', preventScroll, { passive: false, capture: true });
    window.addEventListener('wheel', preventWheelScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventTouchMove, { passive: false, capture: true });
    window.addEventListener('scroll', preventGameScroll, { passive: false, capture: true });
    
    // Also prevent scroll on the game container itself
    const pacmanElement = pacmanRef.current;
    if (pacmanElement) {
      pacmanElement.addEventListener('wheel', preventWheelScroll, { passive: false });
      pacmanElement.addEventListener('touchmove', preventTouchMove, { passive: false });
    }

    return () => {
      // Always restore scroll when effect cleans up
      document.body.style.overflow = '';
      window.removeEventListener('keydown', preventScroll, { capture: true });
      window.removeEventListener('wheel', preventWheelScroll, { capture: true });
      window.removeEventListener('touchmove', preventTouchMove, { capture: true });
      window.removeEventListener('scroll', preventGameScroll, { capture: true });
      if (pacmanElement) {
        pacmanElement.removeEventListener('wheel', preventWheelScroll);
        pacmanElement.removeEventListener('touchmove', preventTouchMove);
      }
    };
  }, [isPlaying]);

  const handlePlayGame = () => {
    setIsPlaying(true);
    setGameStarted(true);
    setCountdown(0); // Hide countdown
    
    // Focus the iframe so keyboard events work properly
    setTimeout(() => {
      const iframe = pacmanRef.current?.querySelector('iframe');
      if (iframe) {
        iframe.focus();
        // Also try clicking to ensure focus
        iframe.contentWindow?.focus();
      }
    }, 100);
  };

  return (
    <motion.section 
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-white"
    >
      {/* Start from white (coming from HeroAnimation white fade) */}
      {/* This white overlay fades out when section comes into view */}
      {/* Ensures smooth transition from HeroAnimation white fade */}
      {/* Auto-scrolls to Pacman game when fade is halfway through for optical illusion */}
      <motion.div 
        className="fixed inset-0 bg-white z-[10] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: whiteFadeOut ? 0 : 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      />
      
      {/* Matrix-style text - shows during white fade (2-3 seconds) */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[11] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: whiteFadeOut && !showPacman ? 1 : 0 
        }}
        transition={{ 
          duration: 0.3,
          delay: whiteFadeOut ? 0.2 : 0, // Fade in after white starts fading
        }}
      >
        <motion.p
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center px-4"
          style={{
            color: "#00ff41", // Matrix green
            textShadow: `
              0 0 10px #00ff41,
              0 0 20px #00ff41,
              0 0 30px #00ff41,
              0 0 40px #00ff41,
              3px 3px 0px #000,
              -3px -3px 0px #000,
              3px -3px 0px #000,
              -3px 3px 0px #000
            `,
            fontFamily: "'Courier New', Courier, monospace", // Classic terminal font
            letterSpacing: "4px",
            lineHeight: "1.4",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
          animate={{
            opacity: [0, 1, 1, 0], // Fade in, stay visible, fade out
          }}
          transition={{
            duration: 2.5, // Total 2.5 seconds
            times: [0, 0.2, 0.8, 1], // Fade in quickly, stay visible, fade out
            ease: "easeInOut"
          }}
        >
          Enough of the design.<br />
          Can you build competitive data dashboards..?
        </motion.p>
      </motion.div>
      
      {/* 8-bit Super Mario style background - fades in as white fades out */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
          imageRendering: 'pixelated',
          pointerEvents: 'none', // Don't interfere with game interactions
        }}
      >
        {/* Sky - Classic Super Mario blue */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #5C94FC 0%, #5C94FC 60%, #87CEEB 100%)',
            imageRendering: 'pixelated',
          }}
        />
        
        {/* Animated clouds - Super Mario style */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute"
            style={{
              width: '120px',
              height: '60px',
              background: '#FFFFFF',
              borderRadius: '60px',
              imageRendering: 'pixelated',
              filter: 'contrast(1.2)',
              left: `${-150 + (i * 200)}px`,
              top: `${20 + (i % 3) * 80}px`,
            }}
            animate={{
              x: [0, typeof window !== 'undefined' ? window.innerWidth + 300 : 2220],
            }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          >
            {/* Cloud shape - pixelated circles */}
            <div 
              className="absolute w-16 h-16 bg-white rounded-full -left-4 top-2"
              style={{ imageRendering: 'pixelated' }}
            />
            <div 
              className="absolute w-20 h-20 bg-white rounded-full left-4 top-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <div 
              className="absolute w-16 h-16 bg-white rounded-full left-12 top-2"
              style={{ imageRendering: 'pixelated' }}
            />
          </motion.div>
        ))}
        
        {/* Ground - Super Mario green grass */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '200px',
            background: 'linear-gradient(to bottom, #5C7C3F 0%, #5C7C3F 60%, #8B6F47 60%, #8B6F47 100%)',
            imageRendering: 'pixelated',
          }}
        />
        
        {/* Grass tufts */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`grass-${i}`}
            className="absolute bottom-[200px]"
            style={{
              left: `${(i * 80) % 100}%`,
              width: '20px',
              height: '15px',
              background: '#4A6B2F',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              imageRendering: 'pixelated',
            }}
          />
        ))}
        
        {/* Classic Super Mario blocks - Question blocks and bricks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`block-${i}`}
            className="absolute"
            style={{
              left: `${100 + (i * 150)}px`,
              bottom: `${250 + (i % 3) * 60}px`,
              width: '40px',
              height: '40px',
              background: i % 2 === 0 ? '#FFD700' : '#C04000', // Question block or brick
              border: '3px solid #000',
              imageRendering: 'pixelated',
              boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.3)',
            }}
            animate={i % 2 === 0 ? {
              y: [0, -5, 0],
            } : {}}
            transition={i % 2 === 0 ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            } : {}}
          >
            {i % 2 === 0 && (
              <div 
                className="absolute inset-0 flex items-center justify-center text-xl font-bold"
                style={{ color: '#000', textShadow: '1px 1px 0 #fff' }}
              >
                ?
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Pipes - Classic Super Mario green pipes */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`pipe-${i}`}
            className="absolute"
            style={{
              left: `${200 + (i * 300)}px`,
              bottom: '200px',
              width: '60px',
              height: `${80 + (i % 2) * 40}px`,
              background: '#00A000',
              border: '3px solid #000',
              borderTop: 'none',
              imageRendering: 'pixelated',
            }}
          >
            {/* Pipe top */}
            <div 
              className="absolute -top-8 left-0 w-full h-8"
              style={{
                background: '#00C000',
                border: '3px solid #000',
                borderRadius: '8px 8px 0 0',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        ))}
        
        {/* Split screen divider - pixelated line */}
        <div 
          className="absolute inset-y-0 left-1/2 w-1 bg-black opacity-30"
          style={{
            transform: 'translateX(-50%)',
            imageRendering: 'pixelated',
          }}
        />
        
        {/* Left side - Technical (darker, more grid-like) */}
        <div 
          className="absolute inset-y-0 left-0 w-1/2 opacity-40"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 8px, rgba(0,0,0,0.1) 9px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 8px, rgba(0,0,0,0.1) 9px)
            `,
            backgroundSize: '8px 8px',
            imageRendering: 'pixelated',
          }}
        />
      </motion.div>

      {/* Content - only show when section is in view */}
      {/* Extra height ensures Pacman can be centered in viewport during auto-scroll */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[200vh] p-8 pt-32 md:pt-40">
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
              ref={pacmanRef}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="relative"
              style={{ scrollMarginTop: '50vh' }} // Center in viewport when scrolled to
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

              {/* Tech vs Design labels - Nintendo 8-bit Super Mario style */}
              <div className="absolute -left-40 md:-left-48 top-1/2 -translate-y-1/2 text-right space-y-3 z-30">
                <p 
                  className="text-lg md:text-xl font-black mb-3"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#0066CC", // Super Mario blue
                    textShadow: `
                      2px 2px 0px #000,
                      -1px -1px 0px #000,
                      1px -1px 0px #000,
                      -1px 1px 0px #000,
                      0px 2px 0px #000,
                      2px 0px 0px #000,
                      -2px 0px 0px #000,
                      0px -2px 0px #000
                    `,
                    imageRendering: "pixelated",
                    letterSpacing: "2px",
                    lineHeight: "1.2"
                  }}
                >
                  TECHNICAL
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Data-driven
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Functional
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Interactive
                </p>
              </div>
              
              <div className="absolute -right-40 md:-right-48 top-1/2 -translate-y-1/2 space-y-3 z-30">
                <p 
                  className="text-lg md:text-xl font-black mb-3"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#FF0000", // Super Mario red
                    textShadow: `
                      2px 2px 0px #000,
                      -1px -1px 0px #000,
                      1px -1px 0px #000,
                      -1px 1px 0px #000,
                      0px 2px 0px #000,
                      2px 0px 0px #000,
                      -2px 0px 0px #000,
                      0px -2px 0px #000
                    `,
                    imageRendering: "pixelated",
                    letterSpacing: "2px",
                    lineHeight: "1.2"
                  }}
                >
                  CREATIVE
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Beautiful
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Animated
                </p>
                <p 
                  className="text-sm md:text-base font-bold"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    color: "#000000",
                    textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff",
                    imageRendering: "pixelated",
                    letterSpacing: "1px"
                  }}
                >
                  • Engaging
                </p>
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
          <h3 
            className="text-3xl md:text-4xl lg:text-5xl font-black text-center mb-20 leading-tight"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              imageRendering: 'pixelated',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            <span 
              style={{
                color: '#000',
                textShadow: '3px 3px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff, 0px 3px 0px #fff, 3px 0px 0px #fff, -3px 0px 0px #fff, 0px -3px 0px #fff',
              }}
            >
              Så skapar vi{' '}
            </span>
            <span 
              style={{
                color: '#FF0000', // Super Mario red
                textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 3px 0px #000, 3px 0px 0px #000, -3px 0px 0px #000, 0px -3px 0px #000',
              }}
            >
              animationer som betyder något
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Motion Design - 8-bit Super Mario style */}
            <motion.div 
              className="relative p-6 md:p-8"
              style={{
                background: '#FFD700', // Super Mario gold/yellow
                border: '4px solid #000',
                imageRendering: 'pixelated',
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  8px 8px 0 rgba(0,0,0,0.5)
                `,
              }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ 
                y: -8,
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  12px 12px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
              {/* Pixelated emoji */}
              <div 
                className="text-5xl mb-4"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: 'contrast(1.2)',
                }}
              >
                🎭
              </div>
              <h4 
                className="text-xl md:text-2xl font-black mb-3"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#000',
                  textShadow: '2px 2px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff',
                  imageRendering: 'pixelated',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Motion Design
              </h4>
              <p 
                className="mb-4 text-sm md:text-base leading-relaxed"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#000',
                  imageRendering: 'pixelated',
                  lineHeight: '1.6',
                }}
              >
                Vi använder Framer Motion för flytande, prestanda-optimerade animationer som reagerar på användarinteraktion.
              </p>
              <code 
                className="text-xs md:text-sm px-3 py-2 block font-bold"
                style={{
                  background: '#000',
                  color: '#FFD700',
                  border: '2px solid #000',
                  fontFamily: "'Courier New', Courier, monospace",
                  imageRendering: 'pixelated',
                  boxShadow: 'inset -2px -2px 0 rgba(255,255,255,0.2), inset 2px 2px 0 rgba(0,0,0,0.5)',
                }}
              >
                useScroll, useTransform, useSpring
              </code>
            </motion.div>

            {/* 3D & WebGL - 8-bit Super Mario style */}
            <motion.div 
              className="relative p-6 md:p-8"
              style={{
                background: '#0066CC', // Super Mario blue
                border: '4px solid #000',
                imageRendering: 'pixelated',
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  8px 8px 0 rgba(0,0,0,0.5)
                `,
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ 
                y: -8,
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  12px 12px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
              {/* Pixelated emoji */}
              <div 
                className="text-5xl mb-4"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: 'contrast(1.2)',
                }}
              >
                🌐
              </div>
              <h4 
                className="text-xl md:text-2xl font-black mb-3"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#FFF',
                  textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                  imageRendering: 'pixelated',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                3D & WebGL
              </h4>
              <p 
                className="mb-4 text-sm md:text-base leading-relaxed"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#FFF',
                  imageRendering: 'pixelated',
                  lineHeight: '1.6',
                }}
              >
                Three.js och React Three Fiber för immersiva 3D-upplevelser direkt i webbläsaren.
              </p>
              <code 
                className="text-xs md:text-sm px-3 py-2 block font-bold"
                style={{
                  background: '#000',
                  color: '#00F0FF',
                  border: '2px solid #000',
                  fontFamily: "'Courier New', Courier, monospace",
                  imageRendering: 'pixelated',
                  boxShadow: 'inset -2px -2px 0 rgba(255,255,255,0.2), inset 2px 2px 0 rgba(0,0,0,0.5)',
                }}
              >
                @react-three/fiber, drei
              </code>
            </motion.div>

            {/* Scrollytelling - 8-bit Super Mario style */}
            <motion.div 
              className="relative p-6 md:p-8"
              style={{
                background: '#00A000', // Super Mario green
                border: '4px solid #000',
                imageRendering: 'pixelated',
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  8px 8px 0 rgba(0,0,0,0.5)
                `,
              }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ 
                y: -8,
                boxShadow: `
                  inset -4px -4px 0 rgba(0,0,0,0.3),
                  inset 4px 4px 0 rgba(255,255,255,0.3),
                  12px 12px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
              {/* Pixelated emoji */}
              <div 
                className="text-5xl mb-4"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: 'contrast(1.2)',
                }}
              >
                📖
              </div>
              <h4 
                className="text-xl md:text-2xl font-black mb-3"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#FFF',
                  textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                  imageRendering: 'pixelated',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Scrollytelling
              </h4>
              <p 
                className="mb-4 text-sm md:text-base leading-relaxed"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: '#FFF',
                  imageRendering: 'pixelated',
                  lineHeight: '1.6',
                }}
              >
                Scroll-drivna narrativ som guidar besökaren genom er story med visuell magi.
              </p>
              <code 
                className="text-xs md:text-sm px-3 py-2 block font-bold"
                style={{
                  background: '#000',
                  color: '#00FF88',
                  border: '2px solid #000',
                  fontFamily: "'Courier New', Courier, monospace",
                  imageRendering: 'pixelated',
                  boxShadow: 'inset -2px -2px 0 rgba(255,255,255,0.2), inset 2px 2px 0 rgba(0,0,0,0.5)',
                }}
              >
                Intersection Observer, GSAP
              </code>
            </motion.div>
          </div>

          {/* Tech stack - 8-bit Super Mario style */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p 
              className="text-lg md:text-xl mb-6 font-bold"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                color: '#000',
                textShadow: '2px 2px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff',
                imageRendering: 'pixelated',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Vårt animations-arsenal:
            </p>
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
                  className="px-4 py-2 text-sm md:text-base font-bold"
                  style={{
                    background: index % 2 === 0 ? '#FFD700' : '#0066CC', // Alternating gold and blue
                    color: index % 2 === 0 ? '#000' : '#FFF',
                    border: '3px solid #000',
                    fontFamily: "'Courier New', Courier, monospace",
                    imageRendering: 'pixelated',
                    textShadow: index % 2 === 0 
                      ? '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff'
                      : '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                    boxShadow: `
                      inset -2px -2px 0 rgba(0,0,0,0.3),
                      inset 2px 2px 0 rgba(255,255,255,0.3),
                      4px 4px 0 rgba(0,0,0,0.5)
                    `,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -4,
                    boxShadow: `
                      inset -2px -2px 0 rgba(0,0,0,0.3),
                      inset 2px 2px 0 rgba(255,255,255,0.3),
                      6px 6px 0 rgba(0,0,0,0.5)
                    `,
                  }}
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
