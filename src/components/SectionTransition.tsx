"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SectionTransitionProps {
  children: React.ReactNode;
  variant?: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "parallax";
  className?: string;
}

export default function SectionTransition({
  children,
  variant = "fade",
  className = "",
}: SectionTransitionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Different animation variants
  const getAnimationProps = () => {
    switch (variant) {
      case "fade":
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        };

      case "slide-up":
        return {
          initial: { opacity: 0, y: 60 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        };

      case "slide-left":
        return {
          initial: { opacity: 0, x: 60 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        };

      case "slide-right":
        return {
          initial: { opacity: 0, x: -60 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        };

      case "scale":
        return {
          initial: { opacity: 0, scale: 0.9 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
        };

      case "parallax":
        const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
        return {
          style: { y },
        };

      default:
        return {};
    }
  };

  const animationProps = getAnimationProps();
  
  return (
    <motion.div 
      ref={ref} 
      className={className}
      style={{ position: 'relative', ...animationProps.style }}
      {...animationProps}
    >
      {children}
    </motion.div>
  );
}

