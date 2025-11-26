"use client";

import { useMounted } from "@/hooks/useMounted";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import PacmanGame to avoid SSR issues
const PacmanGame = dynamic(() => import("@/components/games/PacmanGame"), {
  ssr: false,
  loading: () => <div className="text-white text-center">Loading Pacman...</div>
});

export default function TechShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pacmanRef = useRef<HTMLDivElement>(null);
  // Use larger margin to trigger earlier when scrolling into view
  const isInView = useInView(sectionRef, { once: true, margin: "0px" });
  const mounted = useMounted();
  const [showTechText, setShowTechText] = useState(false);
  const [showPacman, setShowPacman] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [whiteFadeOut, setWhiteFadeOut] = useState(false);
  const [hasScrolledToPacman, setHasScrolledToPacman] = useState(false);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [matrixText, setMatrixText] = useState("");
  const [matrixFinished, setMatrixFinished] = useState(false);
  const [postMatrixMessageVisible, setPostMatrixMessageVisible] = useState(false);
  const hasStartedAnimationRef = useRef(false);
  const matrixFullText = "ENOUGH WITH THE\nFLASHY STUFF";
  // Show overlay when Pacman should be visible and overlay hasn't been dismissed
  // Don't require isInView since animation can trigger even if user scrolled past
  const showOverlay = showPacman && !overlayDismissed;
  const showInlinePacman = showPacman && overlayDismissed;

  // Matrix text typing animation
  useEffect(() => {
    if (showTechText && !showPacman) {
      setMatrixText("");
      setMatrixFinished(false);
      setPostMatrixMessageVisible(false);
      let currentIndex = 0;
      let timeoutId: NodeJS.Timeout;

      const typeText = () => {
        if (currentIndex < matrixFullText.length) {
          setMatrixText(matrixFullText.slice(0, currentIndex + 1));
          currentIndex++;
          const lastChar = matrixFullText[currentIndex - 1];
          const delay = lastChar === ' ' ? 25 : 55;
          timeoutId = setTimeout(typeText, delay);
        } else {
          setMatrixFinished(true);
          setTimeout(() => setPostMatrixMessageVisible(true), 400);
        }
      };

      const typingTimer = setTimeout(() => {
        typeText();
      }, 150);

      return () => {
        clearTimeout(typingTimer);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else {
      setMatrixText("");
      setMatrixFinished(false);
      setPostMatrixMessageVisible(false);
    }
  }, [showTechText, showPacman, matrixFullText]);

  // Check if section is already in view when component mounts (e.g., after HeroAnimation auto-scrolls)
  // Also use IntersectionObserver as fallback to catch when section becomes visible
  useEffect(() => {
    if (!mounted || !sectionRef.current) return;

    let textTimer: NodeJS.Timeout | null = null;
    let pacmanTimer: NodeJS.Timeout | null = null;

    const startAnimation = () => {
      // Prevent multiple triggers using ref to avoid stale closure
      if (hasStartedAnimationRef.current) return;
      hasStartedAnimationRef.current = true;

      setWhiteFadeOut(true);

      textTimer = setTimeout(() => {
        setShowTechText(true);
      }, 200);

      pacmanTimer = setTimeout(() => {
        setShowPacman(true);
      }, 5500);
    };

    // Check immediately on mount with a small delay to ensure DOM is ready
    const checkTimer = setTimeout(() => {
      if (hasStartedAnimationRef.current) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        // Check if section is visible in viewport (at least partially visible)
        if (rect.top < windowHeight && rect.bottom > 0) {
          startAnimation();
        }
      }
    }, 100);

    // Also set up IntersectionObserver as fallback
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedAnimationRef.current) {
            startAnimation();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      clearTimeout(checkTimer);
      if (textTimer) clearTimeout(textTimer);
      if (pacmanTimer) clearTimeout(pacmanTimer);
      observer.disconnect();
    };
  }, [mounted]);

  // Also trigger when isInView changes (normal scroll behavior)
  useEffect(() => {
    if (!mounted || !isInView || hasStartedAnimationRef.current) {
      return;
    }

    if (isInView) {
      hasStartedAnimationRef.current = true;

      // Start white fade out immediately when section comes into view
      setWhiteFadeOut(true);

      // Start matrix text animation immediately - our overlay (z-index 1000) will cover HeroAnimation's overlay (z-index 100)
      const textTimer = setTimeout(() => {
        setShowTechText(true);
      }, 200); // Short delay to ensure smooth transition

      // Reveal Pacman after Matrix text has finished + message displayed
      // Matrix text takes ~2-3 seconds to type, plus 400ms for message = ~3-4 seconds total
      // Adding buffer for smooth transition
      const pacmanTimer = setTimeout(() => setShowPacman(true), 5500);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(pacmanTimer);
      };
    }
  }, [isInView, mounted]);

  // Reset overlay dismissal whenever Pacman sequence retriggers
  useEffect(() => {
    if (showPacman) {
      setOverlayDismissed(false);
      // Close any open HeroAnimation modals when Pacman is about to show
      // This prevents modals from appearing over Pacman game on mobile
      window.dispatchEvent(new CustomEvent('closeHeroModals'));
    }
  }, [showPacman]);

  // Close HeroAnimation modals when white fade starts (mobile safety)
  useEffect(() => {
    if (whiteFadeOut) {
      // Small delay to ensure modals are closed before white fade appears
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('closeHeroModals'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [whiteFadeOut]);

  // Auto-scroll to Pacman once game is revealed (only once)
  useEffect(() => {
    if (!mounted) return;

    if ((showOverlay || showInlinePacman) && !hasScrolledToPacman && pacmanRef.current) {
      requestAnimationFrame(() => {
        pacmanRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        setHasScrolledToPacman(true);
      });
    }
  }, [showOverlay, showInlinePacman, hasScrolledToPacman, mounted]);

  useEffect(() => {
    if (!mounted) return;

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
  }, [showPacman, countdown, gameStarted, isPlaying, mounted]);

  const handlePlayGame = () => {
    setIsPlaying(true);
    setGameStarted(true);
    setCountdown(0); // Hide countdown
    setHasPlayed(true);
  };

  const handleDismissOverlay = () => {
    setOverlayDismissed(true);
  };

  const renderPacmanExperience = (variant: "overlay" | "inline") => {

    const containerDimensions =
      variant === "overlay"
        ? { width: 'min(90vw, 1100px)', height: 'min(85vh, 850px)' }
        : { width: 'min(95vw, 1000px)', height: 'min(80vh, 800px)' };

    return (
      <motion.div
        key={`${variant}-pacman`}
        ref={pacmanRef}
        initial={variant === "overlay" ? { opacity: 0, scale: 0.85, y: 20 } : { opacity: 0, scale: 0.5, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        className={variant === "overlay" ? "relative w-full max-w-5xl" : "relative [scroll-margin-top:50vh]"}
      >
        <motion.h2
          className="text-3xl md:text-5xl lg:text-6xl font-black mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          style={{
            fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
            textShadow: `
              3px 3px 0px #000,
              -3px -3px 0px #000,
              3px -3px 0px #000,
              -3px 3px 0px #000,
              0px 3px 0px #000,
              3px 0px 0px #000,
              -3px 0px 0px #000,
              0px -3px 0px #000
            `,
            imageRendering: 'pixelated',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          <span className="text-gray-400">ENOUGH OF THE </span>
          <span className="text-purple-400">FLASHY STUFF</span>
        </motion.h2>

        <motion.div
          className="relative mx-auto"
          style={containerDimensions}
          animate={{
            rotate: countdown === 0 && !isPlaying ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <div
            className="absolute inset-0 -m-4 border-8 border-black rounded-lg pointer-events-none"
            style={{
              imageRendering: 'pixelated',
              boxShadow: `
                4px 4px 0 0 #333,
                8px 8px 0 0 #666,
                12px 12px 0 0 #999
              `
            }}
          />

          <div
            className="relative rounded-lg overflow-hidden w-full h-full flex items-center justify-center p-8"
            style={{
              backgroundImage: 'url("/images/backgrounds/8-bit.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Game content - canvas has its own semi-transparent background, so no extra overlay needed */}
            <PacmanGame />

            {/* Play button - centered in the game area */}
            {!isPlaying && (
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <motion.button
                  onClick={handlePlayGame}
                  className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:scale-105 transition-transform shadow-lg text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white"
                  style={{
                    fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
                    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                    imageRendering: 'pixelated',
                    letterSpacing: '2px',
                    borderRadius: '0',
                    boxShadow: '4px 4px 0px #000, -2px -2px 0px #000',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={countdown > 0 && !hasPlayed}
                >
                  🎮 {hasPlayed ? "SPELA IGEN" : "SPELA"}
                </motion.button>
              </motion.div>
            )}

            {/* Overlays for countdown and demo ready */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center pointer-events-none"
                  style={{
                    imageRendering: 'pixelated',
                  }}
                >
                  <div className="text-center px-4">
                    <h3
                      className="text-3xl md:text-4xl font-bold text-white mb-4"
                      style={{
                        fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow: `
                          2px 2px 0px #000,
                          -2px -2px 0px #000,
                          2px -2px 0px #000,
                          -2px 2px 0px #000,
                          0px 2px 0px #000,
                          2px 0px 0px #000,
                          -2px 0px 0px #000,
                          0px -2px 0px #000
                        `,
                        imageRendering: 'pixelated',
                        letterSpacing: '2px',
                      }}
                    >
                      Demo startar om {countdown}s
                    </h3>
                  </div>
                </motion.div>
              )}
              {countdown === 0 && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto"
                  style={{
                    background: 'rgba(0, 0, 0, 0.75)',
                    imageRendering: 'pixelated',
                    border: '4px solid #fff',
                    borderStyle: 'double',
                  }}
                >
                  <div className="text-center px-4">
                    <h3
                      className="text-3xl md:text-4xl font-bold text-white mb-4"
                      style={{
                        fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow: `
                          3px 3px 0px #000,
                          -3px -3px 0px #000,
                          3px -3px 0px #000,
                          -3px 3px 0px #000,
                          0px 3px 0px #000,
                          3px 0px 0px #000,
                          -3px 0px 0px #000,
                          0px -3px 0px #000
                        `,
                        imageRendering: 'pixelated',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {gameStarted ? "PAUSAT" : "DEMO KLAR"}
                    </h3>
                    <p
                      className="text-lg md:text-xl text-white/90 mb-6"
                      style={{
                        fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                        imageRendering: 'pixelated',
                        letterSpacing: '1px',
                      }}
                    >
                      Vi kan bygga allt från spel till företagslösningar!
                    </p>
                    <p
                      className="text-base md:text-lg text-white/80"
                      style={{
                        fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                        imageRendering: 'pixelated',
                        letterSpacing: '1px',
                      }}
                    >
                      Tryck på <strong>Spela{hasPlayed ? " igen" : ""}</strong> för att fortsätta.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TECHNICAL column - positioned relative to game container, hidden on mobile */}
          <div className="hidden md:block absolute left-0 -translate-x-full -translate-y-1/2 top-1/2 pr-16 md:pr-24 lg:pr-32 text-right space-y-3 z-30 whitespace-nowrap">
          <p
            className="text-lg md:text-xl font-black mb-3"
            style={{
              fontFamily: "var(--font-pixel)",
              color: "#0066CC",
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
            TEKNISKT
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
            • Datadriven
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
            • Funktionell
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
            • Interaktiv
          </p>
          </div>

          {/* CREATIVE column - positioned relative to game container, hidden on mobile */}
          <div className="hidden md:block absolute right-0 translate-x-full -translate-y-1/2 top-1/2 pl-20 md:pl-28 lg:pl-36 space-y-3 z-30 whitespace-nowrap">
          <p
            className="text-lg md:text-xl font-black mb-3"
            style={{
              fontFamily: "var(--font-pixel)",
              color: "#FF0000",
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
            KREATIVT
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
            • Vacker
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
            • Animerad
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
            • Engagerande
          </p>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!mounted) {
    return (
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundColor: "#0a0a0a",
        }}
      >
        {/* Simple loading placeholder for SSR */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-white text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      initial={{ backgroundColor: "#ffffff" }}
      animate={{ backgroundColor: "#0a0a0a" }}
      style={{
        // 8-bit Nintendo style dark background
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Start from white (coming from HeroAnimation white fade) */}
      {/* This white overlay stays white while Matrix text is visible */}
      {/* Only fades out after Matrix text and message are done */}
      {/* Much higher z-index (1000) to be above HeroAnimation's white overlay (z-index 100) and modals (z-index 60) */}
      {whiteFadeOut && (
        <motion.div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{ zIndex: 1000 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: showPacman ? 0 : 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        />
      )}


      {/* 8-bit Nintendo style background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Pixelated grid pattern for 8-bit feel */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '8px 8px',
            imageRendering: 'pixelated',
          }}
        />
        {/* Subtle 8-bit scanline effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Matrix text - EXACTLY centered in viewport */}
      <AnimatePresence>
        {isInView && showTechText && !showPacman && (
          <>
            {/* Matrix text container - exactly centered */}
            {/* Much higher z-index (1001) to ensure it's above our white overlay (z-index 1000) */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center pointer-events-none px-4"
              style={{ zIndex: 1001 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.h2
                className="text-3xl md:text-5xl lg:text-6xl font-bold whitespace-pre-line text-center"
                style={{
                  color: "#FFFFFF",
                  // Authentic NES 8-bit text shadow - thick black outline
                  textShadow: `
                    3px 3px 0px #000000,
                    -3px -3px 0px #000000,
                    3px -3px 0px #000000,
                    -3px 3px 0px #000000,
                    0px 3px 0px #000000,
                    3px 0px 0px #000000,
                    -3px 0px 0px #000000,
                    0px -3px 0px #000000,
                    2px 2px 0px #000000,
                    -2px -2px 0px #000000,
                    2px -2px 0px #000000,
                    -2px 2px 0px #000000
                  `,
                  fontFamily: "var(--font-pixel), 'Press Start 2P', 'Courier New', monospace",
                  letterSpacing: "6px",
                  lineHeight: "1.2",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  // Force pixelated rendering
                  imageRendering: "pixelated" as const,
                  // Disable font smoothing for pixelated look
                  WebkitFontSmoothing: "none",
                  MozOsxFontSmoothing: "none",
                  textRendering: "optimizeSpeed",
                  // Additional pixelated styling
                  fontFeatureSettings: "normal",
                  fontVariantLigatures: "none",
                  fontKerning: "none",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {matrixText}
                {matrixText.length < matrixFullText.length && (
                  <span
                    className="animate-pulse"
                    style={{
                      color: "#FFFFFF",
                      textShadow: "3px 3px 0px #000000, -3px -3px 0px #000000, 3px -3px 0px #000000, -3px 3px 0px #000000",
                      fontFamily: "var(--font-pixel), 'Press Start 2P', monospace"
                    }}
                  >
                    |
                  </span>
                )}
              </motion.h2>
            </motion.div>

            {/* Secondary message - positioned below center */}
            {/* Much higher z-index (1001) to ensure it's above our white overlay (z-index 1000) */}
            {matrixFinished && postMatrixMessageVisible && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center pointer-events-none px-4"
                style={{ zIndex: 1001 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.p
                  className="text-2xl md:text-4xl text-gray-800 font-semibold tracking-wide text-center"
                  style={{ marginTop: "200px" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Så skapar vi animationer som betyder något
                </motion.p>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Pacman Overlay Modal - shows on top of everything when white fade is done */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Close button */}
            <motion.button
              onClick={handleDismissOverlay}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white text-3xl md:text-4xl z-50 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              aria-label="Close Pacman demo"
            >
              ✕
            </motion.button>

            {/* Pacman game in overlay */}
            {renderPacmanExperience("overlay")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content - only show when section is in view */}
      {/* Reduced height for better visibility on large screens */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 pt-32 md:pt-40">
        <AnimatePresence mode="wait">

          {showInlinePacman && renderPacmanExperience("inline")}
        </AnimatePresence>

      </div>
    </motion.section>
  );
}
