import { useState, useEffect, useRef } from "react";

interface UseVideoLoaderOptions {
  preload?: "none" | "metadata" | "auto";
  playbackRate?: number;
}

interface UseVideoLoaderReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoError: boolean;
  mounted: boolean;
}

/**
 * Shared hook for video loading with error handling
 * Removes duplicated code from HeroSection and HeroAnimation
 */
export function useVideoLoader(
  options: UseVideoLoaderOptions = {}
): UseVideoLoaderReturn {
  const { preload = "auto", playbackRate } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Apply preload preference and listen for load/error events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (preload) {
      video.preload = preload;
    }

    const handleError = () => setVideoError(true);
    const handleLoadedData = () => setVideoError(false);

    video.addEventListener("error", handleError);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [preload]);

  // Set video playback rate for cinematic effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || playbackRate === undefined) return;

    const applyPlaybackRate = () => {
      try {
        video.playbackRate = playbackRate;
      } catch {
        // Ignore playback rate errors
      }
    };

    if (video.readyState >= 1) {
      applyPlaybackRate();
    } else {
      video.addEventListener("loadedmetadata", applyPlaybackRate, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", applyPlaybackRate);
    };
  }, [playbackRate]);

  return { videoRef, videoError, mounted };
}
