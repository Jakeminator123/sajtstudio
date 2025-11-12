'use client';

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'black' | 'transparent';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  animate?: boolean;
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  black: 'bg-black text-white',
  transparent: 'bg-transparent',
};

const paddingClasses = {
  sm: 'py-8 sm:py-12 md:py-16',
  md: 'py-12 sm:py-16 md:py-24',
  lg: 'py-16 sm:py-24 md:py-32 lg:py-48',
  xl: 'py-24 sm:py-32 md:py-48 lg:py-64',
};

export default function Section({
  children,
  className = '',
  background = 'white',
  padding = 'lg',
  id,
  animate = true,
}: SectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const content = (
    <section
      ref={ref}
      id={id}
      className={`
        ${backgroundClasses[background]} 
        ${paddingClasses[padding]} 
        relative overflow-hidden
        content-visibility-auto
        ${className}
      `}
    >
      {children}
    </section>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {content}
    </motion.div>
  );
}

// Container component for consistent width and padding
interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({ 
  children, 
  className = '', 
  maxWidth = 'xl' 
}: ContainerProps) {
  return (
    <div className={`
      container mx-auto px-4 sm:px-6 lg:px-8 
      ${maxWidthClasses[maxWidth]}
      ${className}
    `}>
      {children}
    </div>
  );
}
