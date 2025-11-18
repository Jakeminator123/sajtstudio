"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized Image component with automatic error handling and loading states
 */
export function OptimizedImage({
  fallback = "/images/hero/hero-background.webp",
  priority = false,
  sizes,
  className,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine sizes if not provided
  const imageSizes = sizes || "100vw";

  return (
    <div className={`relative ${className || ""}`}>
      <Image
        {...props}
        src={error ? fallback : props.src}
        alt={props.alt || ""}
        priority={priority}
        sizes={imageSizes}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className || ""}`}
        onError={() => {
          if (!error) {
            setError(true);
          }
        }}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
    </div>
  );
}
