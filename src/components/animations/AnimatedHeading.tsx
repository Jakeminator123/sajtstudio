'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedHeadingProps {
  children: ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'display' | 'hero' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  delay?: number;
  animate?: boolean;
  center?: boolean;
}

const sizeClasses = {
  display: 'text-5xl sm:text-6xl md:text-7xl lg:text-display font-black leading-[0.9]',
  hero: 'text-4xl sm:text-5xl md:text-6xl lg:text-hero font-black leading-[0.9]',
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-h1 font-bold',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-h2 font-bold',
  h3: 'text-xl sm:text-2xl md:text-3xl lg:text-h3 font-bold',
  h4: 'text-lg sm:text-xl md:text-2xl lg:text-h4 font-semibold',
};

export default function AnimatedHeading({
  children,
  level = 'h2',
  size = 'h2',
  className = '',
  delay = 0,
  animate = true,
  center = false,
}: AnimatedHeadingProps) {
  const Component = level;
  const classes = `
    ${sizeClasses[size]} 
    ${center ? 'text-center' : ''} 
    ${className}
  `.trim();

  if (!animate) {
    return <Component className={classes}>{children}</Component>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
    >
      <Component className={classes}>{children}</Component>
    </motion.div>
  );
}

// Animated text component for paragraphs
interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'lead';
  center?: boolean;
}

const textSizes = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  lead: 'text-base sm:text-lg md:text-lead',
};

export function AnimatedText({
  children,
  className = '',
  delay = 0.1,
  size = 'base',
  center = false,
}: AnimatedTextProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={`
        ${textSizes[size]} 
        ${center ? 'text-center' : ''} 
        ${className}
      `.trim()}
    >
      {children}
    </motion.p>
  );
}
