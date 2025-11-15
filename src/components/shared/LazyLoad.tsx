"use client";

import { ComponentType, ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image, { ImageProps } from "next/image";

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = "50px",
}: LazyLoadProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{
        once: true,
        margin: rootMargin,
        amount: threshold,
      }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

// Helper function for dynamic imports with loading state
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ReactNode
) {
  return dynamic(importFunc, {
    loading: () =>
      loadingComponent ? (
        <>{loadingComponent}</>
      ) : (
        <div className="animate-pulse bg-gray-100 h-64" />
      ),
    ssr: true,
  });
}

// Optimized Image component with blur placeholder

interface OptimizedImageProps extends ImageProps {
  fallback?: string;
}

export function OptimizedImage({
  fallback = "/images/placeholder.webp",
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(props.src);

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
    setImageSrc(props.src);
  }, [props.src]);

  // Handle image loading completion
  const handleLoadingComplete = () => {
    setLoaded(true);
  };

  // Use a hidden img element to detect errors since Next.js Image doesn't expose onError
  useEffect(() => {
    if (!error && imageSrc && imageSrc !== fallback) {
      const testImg = new window.Image();
      testImg.onerror = () => {
        if (fallback) {
          setError(true);
          setImageSrc(fallback);
        }
      };
      // Handle different src types (string, StaticImageData, StaticRequire)
      if (typeof imageSrc === 'string') {
        testImg.src = imageSrc;
      } else if (imageSrc && typeof imageSrc === 'object' && 'src' in imageSrc) {
        testImg.src = imageSrc.src;
      }
    }
  }, [imageSrc, fallback, error]);

  return (
    <div className="relative">
      {error && imageSrc === fallback ? (
        // Fallback image using regular img tag when Next.js Image fails
        <img
          src={fallback}
          alt={props.alt || ""}
          className={`${props.className || ""} transition-opacity duration-300 opacity-100`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <Image
          {...props}
          src={imageSrc}
          onLoadingComplete={handleLoadingComplete}
          className={`${props.className || ""} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          placeholder={props.placeholder || "blur"}
          blurDataURL={
            props.blurDataURL ||
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          }
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-100" />
      )}
    </div>
  );
}
