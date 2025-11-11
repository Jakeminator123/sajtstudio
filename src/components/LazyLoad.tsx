'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({ 
  children, 
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ 
        once: true, 
        margin: rootMargin,
        amount: threshold 
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
    loading: () => loadingComponent ? <>{loadingComponent}</> : <div className="animate-pulse bg-gray-100 h-64" />,
    ssr: true,
  });
}

// Optimized Image component with blur placeholder
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string;
}

export function OptimizedImage({ 
  fallback = '/images/placeholder.webp',
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      <Image
        {...props}
        src={error ? fallback : props.src}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        className={`${props.className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        placeholder={props.placeholder || 'blur'}
        blurDataURL={props.blurDataURL || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-100" />
      )}
    </div>
  );
}
