"use client";

import { prefersReducedMotion } from "@/lib/performance";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface OptimizedVideoProps {
  src: string;
  srcAV1?: string;
  srcVP9?: string;
  srcH264?: string;
  poster: string;
  alt?: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
}

/**
 * Optimized video component with:
 * - Lazy loading behind placeholder
 * - Pauses when offscreen (Intersection Observer)
 * - Reduced motion support (shows poster image instead)
 * - Multiple format support (AV1/VP9/H.264)
 * - Low bitrate optimization
 */
export default function OptimizedVideo({
  src,
  srcAV1,
  srcVP9,
  srcH264,
  poster,
  alt = "",
  className = "",
  autoplay = false,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
  onLoadStart,
  onCanPlay,
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const shouldReduceMotion = prefersReducedMotion();

  // Intersection Observer: Load video when near viewport, pause when offscreen
  useEffect(() => {
    if (shouldReduceMotion || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading when video is near viewport (200px margin)
            if (!shouldLoad) {
              setShouldLoad(true);
            }
            // Play video when in viewport
            if (videoRef.current && autoplay && !isPlaying) {
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  // Autoplay blocked, user can start manually
                });
            }
          } else {
            // Pause when offscreen to save resources
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad, isPlaying, autoplay, shouldReduceMotion]);

  // Handle video loading
  useEffect(() => {
    if (!shouldLoad || !videoRef.current || shouldReduceMotion) return;

    const video = videoRef.current;

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      onCanPlay?.();
      if (autoplay) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked
          });
      }
    };

    const handleError = () => {
      setHasError(true);
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [shouldLoad, autoplay, onLoadStart, onCanPlay, shouldReduceMotion]);

  // If reduced motion is preferred, show poster image instead
  if (shouldReduceMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative aspect-video ${className}`}
      >
        <Image
          src={poster}
          alt={alt}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // If error or not loaded yet, show poster
  if (hasError || !shouldLoad) {
    return (
      <div
        ref={containerRef}
        className={`relative aspect-video ${className}`}
      >
        <Image
          src={poster}
          alt={alt}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover aspect-video"
        poster={poster}
        playsInline={playsInline}
        muted={muted}
        loop={loop}
        autoPlay={autoplay}
        controls={controls}
        preload="metadata"
      >
        {/* AV1 format (best compression) */}
        {srcAV1 && (
          <source src={srcAV1} type="video/mp4; codecs=av01.0.08M.08" />
        )}
        {/* VP9 format (good compression) */}
        {srcVP9 && <source src={srcVP9} type="video/webm; codecs=vp9" />}
        {/* H.264 fallback (widest support) */}
        {srcH264 && <source src={srcH264} type="video/mp4" />}
        {/* Default fallback */}
        <source src={src} type="video/mp4" />
        Din webbläsare stödjer inte video-taggen.
      </video>
    </div>
  );
}
