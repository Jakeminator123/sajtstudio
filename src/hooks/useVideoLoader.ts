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
    setMounted(true);
  }, []);

  // Set video playback rate for cinematic effect
  useEffect(() => {
    const video = videoRef.current;
    if (video && !videoError && playbackRate !== undefined) {
      // Handle video errors gracefully
      const handleError = () => {
        setVideoError(true);
      };

      // Wait for video to be loaded before setting playback rate
      const handleLoadedMetadata = () => {
        try {
          video.playbackRate = playbackRate;
        } catch (error) {
          // Silently fail if playback rate can't be set
        }
      };

      video.addEventListener("error", handleError);

      if (video.readyState >= 1) {
        // Video metadata already loaded
        handleLoadedMetadata();
      } else {
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }

      return () => {
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoError, playbackRate]);

  return { videoRef, videoError, mounted };
}
