"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: boolean;
}

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
  animation = true,
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 rounded";

  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-lg",
  };

  const defaultSizes: Record<string, { width?: string; height: string }> = {
    text: { width: "100%", height: "1rem" },
    circular: { width: "40px", height: "40px" },
    rectangular: { width: "100%", height: "200px" },
    card: { width: "100%", height: "400px" },
  };

  // Calculate dynamic width and height values using CSS custom properties
  // This approach uses CSS variables set via inline style (which is acceptable for dynamic values)
  // and then references them via CSS classes to avoid direct inline width/height styles
  const widthValue =
    width !== undefined
      ? typeof width === "number"
        ? `${width}px`
        : width
      : defaultSizes[variant].width || "auto";

  const heightValue =
    height !== undefined
      ? typeof height === "number"
        ? `${height}px`
        : height
      : defaultSizes[variant].height;

  // Create a deterministic CSS class for dynamic sizing to avoid inline styles
  const dynamicClass = useMemo(() => {
    const key = `${widthValue}__${heightValue}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_");
    return `skeleton-dyn-${key}`;
  }, [widthValue, heightValue]);

  // Inject a <style> tag for this dynamic class on the client
  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = `style-${dynamicClass}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    let created = false;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      created = true;
    }

    styleEl.textContent = `.${dynamicClass}{width:${widthValue};height:${heightValue};}`;

    if (created) {
      document.head.appendChild(styleEl);
    }

    return () => {
      // Keep styles to avoid flicker when multiple identical skeletons mount/unmount
      // If needed, uncomment to clean up:
      // document.getElementById(styleId)?.remove();
    };
  }, [dynamicClass, widthValue, heightValue]);

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${dynamicClass}`}
    >
      {animation && (
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />
      )}
    </div>
  );

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonElement}</div>
        ))}
      </div>
    );
  }

  return skeletonElement;
}

// Skeleton for section loading
export function SectionSkeleton() {
  return (
    <div className="py-16 sm:py-24 md:py-32 lg:py-48">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Skeleton
            variant="text"
            width="50%"
            height="3rem"
            className="mx-auto mb-4"
          />
          <Skeleton variant="text" width="70%" className="mx-auto" />
        </div>
        <div className="space-y-8">
          <Skeleton variant="rectangular" height="200px" />
          <Skeleton variant="text" count={3} />
        </div>
      </div>
    </div>
  );
}

// Skeleton for card loading
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <Skeleton variant="rectangular" height="200px" animation={false} />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="80%" height="1.5rem" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" count={2} />
      </div>
    </div>
  );
}

// Skeleton for portfolio grid
export function PortfolioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Skeleton
            variant="text"
            width="80%"
            height="4rem"
            className="mx-auto"
          />
          <Skeleton
            variant="text"
            width="90%"
            height="4rem"
            className="mx-auto"
          />
          <Skeleton
            variant="text"
            width="70%"
            height="4rem"
            className="mx-auto"
          />
          <div className="pt-8">
            <Skeleton
              variant="text"
              width="60%"
              height="1.5rem"
              className="mx-auto mb-8"
            />
            <div className="flex gap-4 justify-center">
              <Skeleton variant="rectangular" width="150px" height="50px" />
              <Skeleton variant="rectangular" width="150px" height="50px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
