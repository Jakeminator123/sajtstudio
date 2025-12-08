"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePreloadDuringIntro } from "@/hooks/usePreloadDuringIntro";

const INTRO_VIDEO_SEEN_KEY = "intro_video_seen";

export default function IntroVideo() {
  const [isVisible, setIsVisible] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Preload critical resources while intro video is playing
  usePreloadDuringIntro(isVisible);

  // Check if user has seen intro video before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem(INTRO_VIDEO_SEEN_KEY);
      // Always show video on first visit (hasSeen is null or not set)
      // For debugging: uncomment the line below to force show video
      // localStorage.removeItem(INTRO_VIDEO_SEEN_KEY);
      if (!hasSeen) {
        // Show video immediately - this is the first thing when user logs in
        // Use requestAnimationFrame to avoid setState in effect warning
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }
    }
  }, []);

  // Hide video and mark as seen
  const hideVideo = () => {
    if (hasEndedRef.current) return; // Already hidden
    hasEndedRef.current = true;

    // Clear timeout if it exists
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    setIsVisible(false);
    // Mark as seen in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(INTRO_VIDEO_SEEN_KEY, "true");
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    const video = videoRef.current;
    if (!video) {
      // Video ref not ready yet, retry after a short delay
      const retryTimeout = setTimeout(() => {
        if (videoRef.current && isVisible && !hasEndedRef.current) {
          // Effect will re-run when video ref is available
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    // Reset ended flag when video becomes visible
    hasEndedRef.current = false;

    // Force video to start playing immediately when visible
    const startPlaying = async () => {
      if (hasEndedRef.current) return;
      try {
        video.currentTime = 0; // Start from beginning
        video.muted = true; // Ensure muted for autoplay
        // Set playsInline for mobile compatibility
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("x5-playsinline", "true");
        await video.play();
      } catch {
        // If autoplay is blocked, try again when video is ready
        if (video.readyState >= 2 && !hasEndedRef.current) {
          video.play().catch(() => {
            // Autoplay blocked - will try again on user interaction
          });
        }
      }
    };

    // Try to play video when it's loaded
    const handleCanPlay = async () => {
      if (hasEndedRef.current) return;
      try {
        if (video.paused) {
          video.muted = true;
          await video.play();
        }
      } catch {
        // Autoplay blocked - try again
      }
    };

    // Also try to play when video has enough data
    const handleLoadedData = async () => {
      if (hasEndedRef.current) return;
      try {
        if (video.paused) {
          video.muted = true;
          await video.play();
        }
      } catch {
        // Autoplay blocked
      }
    };

    // Hide after max 8 seconds even if video hasn't ended
    timeoutIdRef.current = setTimeout(() => {
      if (!hasEndedRef.current) {
        hideVideo();
      }
    }, 8000);

    // Start playing immediately
    startPlaying();

    // Try to play immediately if video is already loaded
    if (video.readyState >= 2) {
      handleCanPlay();
    }

    // Also try when video can start playing
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    video.addEventListener("canplay", handleCanPlay, { once: true });
    video.addEventListener("canplaythrough", handleCanPlay, { once: true });
    video.addEventListener("loadeddata", handleLoadedData, { once: true });
    // Note: onEnded is handled via the onEnded prop on the video element to avoid double handling

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [isVisible]);

  // Allow user to skip by clicking
  const handleClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    hideVideo();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === " ") {
              handleClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Skip intro video"
        >
          {/* Video - fades in smoothly with slight scale */}
          <motion.video
            ref={videoRef}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.5,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            autoPlay
            muted
            playsInline
            preload="auto"
            webkit-playsinline="true"
            x5-playsinline="true"
            onEnded={hideVideo}
            onLoadedData={(e) => {
              // Ensure video plays when loaded
              if (hasEndedRef.current) return;
              const video = e.currentTarget;
              if (video.paused) {
                video.play().catch(() => {
                  // Autoplay blocked, will try again in useEffect
                });
              }
            }}
            onError={() => {
              setVideoError(true);
              // Hide video if it fails to load after delay
              setTimeout(() => {
                if (!hasEndedRef.current) {
                  hideVideo();
                }
              }, 2000);
            }}
            onPlay={() => {
              // Video started playing successfully
              setNeedsUserInteraction(false);
              setVideoError(false);
            }}
            onPause={() => {
              // Check if paused due to autoplay policy
              if (videoRef.current && !hasEndedRef.current) {
                setNeedsUserInteraction(true);
              }
            }}
          >
            <source src="/videos/intro_vid.mp4" type="video/mp4" />
            <track kind="captions" srcLang="sv" label="Svenska" />
            Din webbläsare stödjer inte video-taggen.
          </motion.video>

          {/* Play button if autoplay is blocked */}
          {needsUserInteraction && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {
                    // Still blocked
                  });
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10"
              aria-label="Spela video"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="text-white text-lg font-semibold mb-2">Tryck för att spela</p>
                <p className="text-white/70 text-sm">Intro-video</p>
              </div>
            </motion.button>
          )}

          {/* Error message if video fails to load */}
          {videoError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 z-10"
            >
              <div className="text-center px-4">
                <p className="text-white text-lg mb-4">Kunde inte ladda videon</p>
                <button
                  onClick={handleClick}
                  className="px-6 py-2 bg-white text-black rounded-lg font-semibold"
                >
                  Fortsätt ändå
                </button>
              </div>
            </motion.div>
          )}

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="absolute top-4 right-4 md:top-8 md:right-8 px-4 py-2 bg-black/50 hover:bg-black/70 text-white text-sm md:text-base font-semibold rounded-lg transition-colors backdrop-blur-sm z-20"
            aria-label="Skip intro"
          >
            Hoppa över
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

