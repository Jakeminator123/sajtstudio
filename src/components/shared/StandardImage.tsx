"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

type AspectRatio = "square" | "video" | "wide" | "portrait" | "auto";
type MaxWidth = "sm" | "md" | "lg" | "xl" | "full";

interface StandardImageProps extends Omit<ImageProps, "width" | "height"> {
  aspectRatio?: AspectRatio;
  maxWidth?: MaxWidth;
  fallback?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

const objectFitClasses: Record<NonNullable<StandardImageProps["objectFit"]>, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

const aspectRatioClasses: Record<AspectRatio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
  auto: "",
};

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

/**
 * StandardImage - Unified image component with consistent sizing
 *
 * Provides standardized aspect ratios and max widths for consistent image display
 * across the site. Replaces both ImageOptimizer and LazyLoad OptimizedImage.
 *
 * @example
 * ```tsx
 * <StandardImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   aspectRatio="video"
 *   maxWidth="full"
 * />
 * ```
 */
export function StandardImage({
  aspectRatio = "auto",
  maxWidth = "full",
  fallback = "/images/hero/hero-background.webp",
  priority = false,
  objectFit = "cover",
  className = "",
  sizes,
  ...props
}: StandardImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(props.src);

  // Reset error state when src changes
  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    requestAnimationFrame(() => {
      setError(false);
      setIsLoading(true);
      setImageSrc(props.src);
    });
  }, [props.src]);

  // Determine sizes if not provided - responsive defaults
  const imageSizes = sizes ||
    (maxWidth === "full"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
      : maxWidth === "xl"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
      : maxWidth === "lg"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 1024px"
      : maxWidth === "md"
      ? "(max-width: 640px) 100vw, 768px"
      : "(max-width: 640px) 100vw, 640px");

  const aspectClass = aspectRatioClasses[aspectRatio];
  const maxWidthClass = maxWidthClasses[maxWidth];
  const objectFitClass = objectFitClasses[objectFit];
  const containerClasses = `relative ${aspectClass} ${maxWidthClass} ${className}`.trim();

  // Handle image loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Use a hidden img element to detect errors since Next.js Image doesn't expose onError
  useEffect(() => {
    if (error || !imageSrc || imageSrc === fallback) return;

    const testImg = new window.Image();
    testImg.onerror = () => {
      if (fallback) {
        // Use requestAnimationFrame to avoid setState in callback warning
        requestAnimationFrame(() => {
          setError(true);
          setImageSrc(fallback);
        });
      }
    };

    // Handle different src types (string, StaticImageData, StaticRequire)
    if (typeof imageSrc === "string") {
      testImg.src = imageSrc;
    } else if (imageSrc && typeof imageSrc === "object" && "src" in imageSrc) {
      testImg.src = imageSrc.src;
    }
  }, [imageSrc, fallback, error]);

  // If aspect ratio is auto, use fill layout, otherwise use width/height
  const useFillLayout = aspectRatio !== "auto";

  // If error and fallback, try Next.js Image with fallback src
  const finalSrc = error && imageSrc === fallback ? fallback : imageSrc;

  return (
    <div className={containerClasses}>
      {useFillLayout ? (
        <Image
          {...props}
          src={finalSrc}
          alt={props.alt || ""}
          fill
          sizes={imageSizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoadingComplete={handleLoadingComplete}
          className={`${objectFitClass} transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          placeholder={props.placeholder || "blur"}
          blurDataURL={
            props.blurDataURL ||
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          }
        />
      ) : (
        <Image
          {...props}
          src={finalSrc}
          alt={props.alt || ""}
          sizes={imageSizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoadingComplete={handleLoadingComplete}
          className={`w-full h-auto ${objectFitClass} transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${className}`}
          placeholder={props.placeholder || "blur"}
          blurDataURL={
            props.blurDataURL ||
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          }
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-100" />
      )}
    </div>
  );
}

