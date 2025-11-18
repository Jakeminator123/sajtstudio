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
    }
  }, [showPacman]);

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
    const buttonPositionClass =
      variant === "overlay"
        ? "absolute -top-24 left-1/2 -translate-x-1/2 text-center z-20 w-full"
        : "absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 text-center z-20 w-full";

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
        >
          <span className="text-gray-500">Enough of the </span>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            flashy stuff
          </span>
        </motion.h2>

        <motion.div
          className={buttonPositionClass}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!isPlaying && (
            <motion.button
              onClick={handlePlayGame}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={countdown > 0 && !hasPlayed}
            >
              🎮 {hasPlayed ? "Spela igen" : "Spela"}
            </motion.button>
          )}
        </motion.div>

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
            className="relative rounded-lg overflow-hidden w-full h-full bg-[#071427] flex items-center justify-center p-8"
          >
            <PacmanGame />

            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"
                >
                  <div className="text-center px-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
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
                  className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto"
                >
                  <div className="text-center px-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {gameStarted ? "PAUSAT" : "DEMO KLAR"}
                    </h3>
                    <p className="text-lg md:text-xl text-white/80 mb-6">
                      Vi kan bygga allt från spel till företagslösningar!
                    </p>
                    <p className="text-base md:text-lg text-white/70">
                      Tryck på <strong>Spela{hasPlayed ? " igen" : ""}</strong> för att fortsätta.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="absolute -left-56 md:-left-72 top-1/2 -translate-y-1/2 text-right space-y-3 z-30">
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

        <div className="absolute -right-56 md:-right-72 top-1/2 -translate-y-1/2 space-y-3 z-30">
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
    );
  };

  if (!mounted) {
    return (
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          // Removed background image in SSR version too
          backgroundColor: "#0a0a0a",
        }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/4 to-white/12" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-gray-100/40 to-gray-200/30" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-purple-200/40 via-pink-100/30 to-blue-200/30" />
        </div>
        {/* Match main component structure exactly - must match mounted version */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[200vh] p-8 pt-32 md:pt-40">
          <div className="mt-32 mb-16 px-6 md:px-8 max-w-6xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-20 leading-tight">
              <span className="text-gray-800">Så skapar vi </span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                animationer som betyder något
              </span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="text-3xl mb-4">🎮</div>
                <h4 className="text-lg font-bold mb-2 text-gray-800">Interaktivt</h4>
                <p className="text-sm text-gray-600">Engagerar användare</p>
              </div>
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="text-3xl mb-4">⚡</div>
                <h4 className="text-lg font-bold mb-2 text-gray-800">Snabbt</h4>
                <p className="text-sm text-gray-600">Optimerad prestanda</p>
              </div>
              <div className="p-6 bg-white/50 rounded-xl">
                <div className="text-3xl mb-4">✨</div>
                <h4 className="text-lg font-bold mb-2 text-gray-800">Elegant</h4>
                <p className="text-sm text-gray-600">Snygg design</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      initial={{ backgroundColor: "#ffffff" }}
      animate={{ backgroundColor: "#ffffff" }}
      style={{
        // Removed background image - just solid color
        backgroundColor: "#0a0a0a", // Dark background for better contrast
      }}
    >
      {/* Start from white (coming from HeroAnimation white fade) */}
      {/* This white overlay stays white while Matrix text is visible */}
      {/* Only fades out after Matrix text and message are done */}
      {/* Much higher z-index (1000) to be above HeroAnimation's white overlay (z-index 100) */}
      {whiteFadeOut && (
        <motion.div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{ zIndex: 1000 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: showPacman ? 0 : 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        />
      )}


      {/* Static overlays for readability */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/4 to-white/12" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-gray-100/40 to-gray-200/30" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-purple-200/40 via-pink-100/30 to-blue-200/30" />
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
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
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

        {/* Tech vs Design labels - only show when inline Pacman is visible */}
        {showInlinePacman && (
          <>
            <div className="absolute -left-56 md:-left-72 top-1/2 -translate-y-1/2 text-right space-y-3 z-30">
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

              <div className="absolute -right-56 md:-right-72 top-1/2 -translate-y-1/2 space-y-3 z-30">
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
          </>
        )}

        {/* Animation capabilities section - improved design */}
        <motion.div
          className="mt-32 mb-16 px-6 md:px-8 max-w-6xl mx-auto text-center"
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
