"use client";

import { useMounted } from "@/hooks/useMounted";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import PacmanGame to avoid SSR issues
const PacmanGame = dynamic(() => import("@/components/games/PacmanGame"), {
  ssr: false,
  loading: () => (
    <div className="text-white text-center">Loading Pacman...</div>
  ),
});

export default function TechShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pacmanRef = useRef<HTMLDivElement>(null);
  const matrixVideoRef = useRef<HTMLVideoElement>(null);
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
  const [postMatrixMessageVisible, setPostMatrixMessageVisible] =
    useState(false);
  const hasStartedAnimationRef = useRef(false);
  const [animationStarted, setAnimationStarted] = useState(false); // Track if animation sequence has started (for mobile stability)
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
          // Faster typing animation
          const delay = lastChar === " " ? 15 : 35; // Reduced from 25/55
          timeoutId = setTimeout(typeText, delay);
        } else {
          setMatrixFinished(true);
          // Faster reveal of secondary message
          setTimeout(() => setPostMatrixMessageVisible(true), 250); // Reduced from 400ms
        }
      };

      // Start typing immediately
      const typingTimer = setTimeout(() => {
        typeText();
      }, 80); // Reduced from 150ms

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

  // Control Matrix video playback
  useEffect(() => {
    const video = matrixVideoRef.current;
    if (!video) return;

    if (whiteFadeOut && !showPacman) {
      // Play video when entering Matrix transition
      video.play().catch(() => {
        // Autoplay blocked - video will be visible but silent
      });
    } else if (showPacman) {
      // Pause and reset video when transitioning to Pacman
      video.pause();
      video.currentTime = 0;
    }
  }, [whiteFadeOut, showPacman]);

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
      setAnimationStarted(true); // Set state for stable rendering (mobile fix)

      setWhiteFadeOut(true);

      // Faster transition - Matrix text appears quickly
      textTimer = setTimeout(() => {
        setShowTechText(true);
      }, 100); // Reduced from 200ms

      // Faster transition to Pacman (Matrix text + message = ~2.5s)
      pacmanTimer = setTimeout(() => {
        setShowPacman(true);
      }, 3500); // Reduced from 5500ms
    };

    // Check immediately on mount with a small delay to ensure DOM is ready
    const checkTimer = setTimeout(() => {
      if (hasStartedAnimationRef.current) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;
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
  // Note: We use refs for timers to prevent cleanup from clearing them when isInView flickers on mobile
  const textTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pacmanTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mounted || !isInView || hasStartedAnimationRef.current) {
      return;
    }

    if (isInView) {
      hasStartedAnimationRef.current = true;
      setAnimationStarted(true); // Set state for stable rendering (mobile fix)

      // Start white fade out immediately when section comes into view
      setWhiteFadeOut(true);

      // Faster transition - Matrix text appears quickly
      textTimerRef.current = setTimeout(() => {
        setShowTechText(true);
      }, 100); // Reduced from 200ms for quicker transition

      // Faster transition to Pacman - Matrix text finishes in ~2s, message shows for ~0.5s
      // Quick transition maintains engagement
      pacmanTimerRef.current = setTimeout(() => setShowPacman(true), 3500); // Reduced from 5500ms

      // Don't clear timers in cleanup - once animation starts, it should complete
      // The ref check prevents double-triggering anyway
    }
  }, [isInView, mounted]);

  // Reset overlay dismissal whenever Pacman sequence retriggers
  useEffect(() => {
    if (showPacman) {
      setOverlayDismissed(false);
      // Close any open HeroAnimation modals when Pacman is about to show
      // This prevents modals from appearing over Pacman game on mobile
      window.dispatchEvent(new CustomEvent("closeHeroModals"));
    }
  }, [showPacman]);

  // Close HeroAnimation modals when white fade starts (mobile safety)
  useEffect(() => {
    if (whiteFadeOut) {
      // Small delay to ensure modals are closed before white fade appears
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("closeHeroModals"));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [whiteFadeOut]);

  // Auto-scroll to Pacman once game is revealed (only once)
  // On mobile, skip auto-scroll as it can cause viewport issues and the overlay is fullscreen anyway
  useEffect(() => {
    if (!mounted) return;

    // Skip auto-scroll for overlay mode - it's fullscreen fixed position
    // Only scroll for inline mode
    if (showInlinePacman && !hasScrolledToPacman && pacmanRef.current) {
      // Small delay to let the overlay-to-inline transition complete
      const scrollTimer = setTimeout(() => {
        pacmanRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        setHasScrolledToPacman(true);
      }, 300);
      return () => clearTimeout(scrollTimer);
    }
  }, [showInlinePacman, hasScrolledToPacman, mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Countdown when Pacman shows and game hasn't started yet
    let countdownInterval: NodeJS.Timeout;
    if (showPacman && countdown > 0 && !gameStarted && !isPlaying) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
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

  // Overlay dismissal removed - users scroll past if not interested

  const renderPacmanExperience = (variant: "overlay" | "inline") => {
    // Larger dimensions for 4K screens - uses viewport units with larger max values
    const containerDimensions =
      variant === "overlay"
        ? { width: "min(92vw, 1400px)", height: "min(88vh, 1000px)" }
        : { width: "min(95vw, 1200px)", height: "min(85vh, 950px)" };

    return (
      <motion.div
        key={`${variant}-pacman`}
        ref={pacmanRef}
        initial={
          variant === "overlay"
            ? { opacity: 0, scale: 0.85, y: 20, x: "-6vw" }
            : { opacity: 0, scale: 0.5, rotate: -180, x: "-6vw" }
        }
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0, x: "-6vw" }}
        className={
          variant === "overlay"
            ? "relative w-full max-w-5xl mx-auto"
            : "relative mx-auto [scroll-margin-top:50vh]"
        }
      >
        <motion.div
          className="text-center mb-8 md:mb-12 px-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <h2
            className="text-xl md:text-2xl lg:text-3xl font-black mb-4"
            style={{
              fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
              textShadow: `
                2px 2px 0px #000,
                -2px -2px 0px #000,
                2px -2px 0px #000,
                -2px 2px 0px #000
              `,
              imageRendering: "pixelated",
              letterSpacing: "2px",
              color: "#a855f7",
            }}
          >
            Vi kan ta oss an diametralt olika projekt!
          </h2>
          <p
            className="text-sm md:text-base lg:text-lg text-gray-300 mb-2"
            style={{
              fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
              textShadow: "1px 1px 0px #000",
              imageRendering: "pixelated",
              letterSpacing: "1px",
            }}
          >
            Varför inte lite härlig retro?
          </p>
          <p
            className="text-xs md:text-sm text-yellow-400"
            style={{
              fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
              textShadow: "1px 1px 0px #000",
              imageRendering: "pixelated",
            }}
          >
            🏆 Kom på toplistan & vi bjuder på en testsajt gratis! 🏆
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto"
          style={containerDimensions}
          animate={{
            rotate: countdown === 0 && !isPlaying ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <div
            className="absolute inset-0 -m-4 border-8 border-black rounded-lg pointer-events-none"
            style={{
              imageRendering: "pixelated",
              boxShadow: `
                4px 4px 0 0 #333,
                8px 8px 0 0 #666,
                12px 12px 0 0 #999
              `,
            }}
          />

          <div
            className="relative rounded-lg overflow-hidden w-full h-full flex items-center justify-center p-8"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
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
                    fontFamily:
                      "var(--font-pixel), 'Press Start 2P', monospace",
                    textShadow:
                      "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                    imageRendering: "pixelated",
                    letterSpacing: "2px",
                    borderRadius: "0",
                    boxShadow: "4px 4px 0px #000, -2px -2px 0px #000",
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
                    imageRendering: "pixelated",
                  }}
                >
                  <div className="text-center px-4">
                    <h3
                      className="text-3xl md:text-4xl font-bold text-white mb-4"
                      style={{
                        fontFamily:
                          "var(--font-pixel), 'Press Start 2P', monospace",
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
                        imageRendering: "pixelated",
                        letterSpacing: "2px",
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
                    background: "rgba(0, 0, 0, 0.75)",
                    imageRendering: "pixelated",
                    border: "4px solid #fff",
                    borderStyle: "double",
                  }}
                >
                  <div className="text-center px-4">
                    <h3
                      className="text-3xl md:text-4xl font-bold text-white mb-4"
                      style={{
                        fontFamily:
                          "var(--font-pixel), 'Press Start 2P', monospace",
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
                        imageRendering: "pixelated",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                      }}
                    >
                      {gameStarted ? "PAUSAT" : "DEMO KLAR"}
                    </h3>
                    <p
                      className="text-lg md:text-xl text-white/90 mb-6"
                      style={{
                        fontFamily:
                          "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow:
                          "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                        imageRendering: "pixelated",
                        letterSpacing: "1px",
                      }}
                    >
                      Vi kan bygga allt från spel till företagslösningar!
                    </p>
                    <p
                      className="text-base md:text-lg text-white/80"
                      style={{
                        fontFamily:
                          "var(--font-pixel), 'Press Start 2P', monospace",
                        textShadow:
                          "1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000",
                        imageRendering: "pixelated",
                        letterSpacing: "1px",
                      }}
                    >
                      Tryck på <strong>Spela{hasPlayed ? " igen" : ""}</strong>{" "}
                      för att fortsätta.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TECHNICAL column - positioned relative to game container, hidden on mobile */}
          <div className="hidden lg:block absolute left-0 -translate-x-full -translate-y-1/2 top-1/2 pr-12 xl:pr-24 text-right space-y-3 z-30 whitespace-nowrap">
            <p
              className="text-base xl:text-lg font-black mb-3"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#0066CC",
                textShadow: `
                  2px 2px 0px #000,
                  -1px -1px 0px #000,
                  1px -1px 0px #000,
                  -1px 1px 0px #000
                `,
                imageRendering: "pixelated",
                letterSpacing: "2px",
              }}
            >
              TEKNISKT
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
              }}
            >
              • Datadriven
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
              }}
            >
              • Funktionell
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
              }}
            >
              • Interaktiv
            </p>
          </div>

          {/* CREATIVE column - positioned relative to game container, hidden on mobile */}
          <div className="hidden lg:block absolute right-0 translate-x-full -translate-y-1/2 top-1/2 pl-8 xl:pl-16 space-y-3 z-30 whitespace-nowrap">
            <p
              className="text-base xl:text-lg font-black mb-3"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#FF0000",
                textShadow: `
                  2px 2px 0px #000,
                  -1px -1px 0px #000,
                  1px -1px 0px #000,
                  -1px 1px 0px #000
                `,
                imageRendering: "pixelated",
                letterSpacing: "2px",
              }}
            >
              KREATIVT
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
              }}
            >
              • Vacker
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
              }}
            >
              • Animerad
            </p>
            <p
              className="text-xs xl:text-sm font-bold"
              style={{
                fontFamily: "var(--font-pixel)",
                color: "#000",
                textShadow: "1px 1px 0px #fff, -1px -1px 0px #fff",
                imageRendering: "pixelated",
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
        // 8-bit Nintendo style dark background - full viewport coverage
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Matrix video background - replaces white overlay for portal effect */}
      {/* Creates immersive transition from explosion to Pac-Man game */}
      {/* Much higher z-index (1000) to be above HeroAnimation's white overlay (z-index 100) and modals (z-index 60) */}
      {whiteFadeOut && (
        <>
          {/* Matrix video background */}
          <motion.div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 1000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showPacman ? 0 : 1 }}
            transition={{
              duration: showPacman ? 1.5 : 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <video
              ref={matrixVideoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/videos/matrix_code.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </>
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
            backgroundSize: "8px 8px",
            imageRendering: "pixelated",
          }}
        />
        {/* Subtle 8-bit scanline effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Matrix text - EXACTLY centered in viewport */}
      {/* Use animationStarted instead of isInView for mobile stability - isInView can flicker on mobile during scroll */}
      <AnimatePresence>
        {animationStarted && showTechText && !showPacman && (
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
                  fontFamily:
                    "var(--font-pixel), 'Press Start 2P', 'Courier New', monospace",
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
                      textShadow:
                        "3px 3px 0px #000000, -3px -3px 0px #000000, 3px -3px 0px #000000, -3px 3px 0px #000000",
                      fontFamily:
                        "var(--font-pixel), 'Press Start 2P', monospace",
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
                  className="text-2xl md:text-4xl font-semibold tracking-wide text-center"
                  style={{
                    marginTop: "200px",
                    color: "#00ff00", // Matrix green color
                    textShadow:
                      "0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00",
                  }}
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

      {/* Pacman Overlay Modal - shows on top of everything when Matrix video is done */}
      {/* Smooth fade from Matrix video into Pacman game */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* 8-bit background with desaturation */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'url("/images/backgrounds/8-bit.webp")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                filter: "saturate(0.3) contrast(1.1)",
              }}
            />
            {/* Dark overlay for better contrast with game */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Pacman game in overlay */}
            {renderPacmanExperience("overlay")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8-bit background for inline mode with desaturation */}
      {showInlinePacman && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url("/images/backgrounds/8-bit.webp")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "saturate(0.3) contrast(1.1)",
          }}
        />
      )}

      {/* Content - only show when section is in view */}
      {/* Reduced height for better visibility on large screens */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 pt-32 md:pt-40">
        {/* Dark overlay when inline Pacman is visible for better contrast */}
        {showInlinePacman && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}
        <AnimatePresence mode="wait">
          {showInlinePacman && renderPacmanExperience("inline")}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
