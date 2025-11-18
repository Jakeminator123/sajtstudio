"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePreloadDuringIntro } from "@/hooks/usePreloadDuringIntro";

const INTRO_VIDEO_SEEN_KEY = "intro_video_seen";

export default function IntroVideo() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload critical resources while intro video is playing
  usePreloadDuringIntro(isVisible);

  // Check if user has seen intro video before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem(INTRO_VIDEO_SEEN_KEY);
      if (!hasSeen) {
        // Show video immediately - this is the first thing when user logs in
        setIsVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const video = videoRef.current;
    if (!video) {
      // Video ref not ready yet, try again shortly
      const retryTimeout = setTimeout(() => {
        if (videoRef.current && isVisible) {
          // Retry logic will be handled by the next effect run
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    // Force video to start playing immediately when visible
    const startPlaying = async () => {
      try {
        video.currentTime = 0; // Start from beginning
        video.muted = true; // Ensure muted for autoplay
        await video.play();
      } catch (error) {
        // If autoplay is blocked, try again when video is ready
        if (video.readyState >= 2) {
          video.play().catch(() => {
            // Autoplay blocked - will try again on user interaction
          });
        }
      }
    };

    // Try to play video when it's loaded
    const handleCanPlay = async () => {
      try {
        if (video.paused) {
          video.muted = true;
          await video.play();
        }
      } catch (error) {
        // Autoplay blocked - try again
      }
    };

    // Also try to play when video has enough data
    const handleLoadedData = async () => {
      try {
        if (video.paused) {
          video.muted = true;
          await video.play();
        }
      } catch (error) {
        // Autoplay blocked
      }
    };

    // Hide video when it ends
    const handleEnded = () => {
      setHasPlayed(true);
      setIsVisible(false);
      // Mark as seen in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(INTRO_VIDEO_SEEN_KEY, "true");
      }
    };

    // Hide after max 8 seconds even if video hasn't ended
    const timeoutId = setTimeout(() => {
      if (!hasPlayed) {
        setHasPlayed(true);
        setIsVisible(false);
        // Mark as seen in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(INTRO_VIDEO_SEEN_KEY, "true");
        }
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
    video.addEventListener("ended", handleEnded);

    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isVisible, hasPlayed]);

  // Allow user to skip by clicking
  const handleClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setHasPlayed(true);
    setIsVisible(false);
    // Mark as seen in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(INTRO_VIDEO_SEEN_KEY, "true");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
          {/* Video - slides in from the side, starts playing immediately */}
          <motion.video
            ref={videoRef}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1.2,
              delay: 0,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              setHasPlayed(true);
              setIsVisible(false);
              // Mark as seen in localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem(INTRO_VIDEO_SEEN_KEY, "true");
              }
            }}
            onLoadedData={(e) => {
              // Ensure video plays when loaded
              const video = e.currentTarget;
              if (video.paused) {
                video.play().catch(() => {
                  // Autoplay blocked, will try again in useEffect
                });
              }
            }}
          >
            <source src="/videos/intro_vid.mp4" type="video/mp4" />
          </motion.video>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="absolute top-4 right-4 md:top-8 md:right-8 px-4 py-2 bg-black/50 hover:bg-black/70 text-white text-sm md:text-base font-semibold rounded-lg transition-colors backdrop-blur-sm"
            aria-label="Skip intro"
          >
            Hoppa över
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

