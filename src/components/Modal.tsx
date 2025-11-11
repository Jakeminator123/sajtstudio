'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { designTokens } from '@/config/designTokens';
import { trapFocus } from '@/lib/focusUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'lg' 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll and trap focus when modal is open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // Trap focus after a small delay to ensure modal is rendered
      let cleanupFocusTrap: (() => void) | undefined;
      const focusTrapTimeout = setTimeout(() => {
        if (modalRef.current) {
          cleanupFocusTrap = trapFocus(modalRef.current);
        }
      }, 100);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        clearTimeout(focusTrapTimeout);
        if (cleanupFocusTrap) {
          cleanupFocusTrap();
        }
      };
    }
  }, [isOpen]);

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur animation */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal container with enhanced animations */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50, rotateX: 10 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.34, 1.56, 0.64, 1],
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`relative bg-white w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 border-2 border-accent/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              />
              
              {/* Close button with enhanced hover */}
              <motion.button
                whileHover={{ 
                  scale: 1.15,
                  rotate: 90,
                  backgroundColor: "#f3f4f6"
                }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 transition-colors z-10 rounded-full shadow-lg"
                aria-label="Stäng modal"
              >
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              </motion.button>

              {/* Modal content */}
              <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Project Details Modal Component
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    category: string;
    description: string;
    longDescription?: string;
    color: string;
    image?: string;
    technologies?: string[];
    link?: string;
  };
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="relative">
        {/* Hero section with image support */}
        <motion.div 
          className={`${project.color} h-80 relative flex items-center justify-center overflow-hidden`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background image if available */}
          {project.image && (
            <motion.div
              className="absolute inset-0 opacity-30"
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
          )}
          
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center text-white px-8 relative z-10"
          >
            <motion.h1 
              className="text-display font-black mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {project.title}
            </motion.h1>
            <motion.p 
              className="text-h3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {project.category}
            </motion.p>
          </motion.div>
          
          {/* Animated corner accents */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/40 to-transparent"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </motion.div>

        {/* Content section */}
        <div className="p-8 sm:p-12 md:p-16 lg:p-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl mx-auto"
          >
            {/* Description */}
            <h2 className="text-h2 font-bold mb-6">Om projektet</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              {project.longDescription || project.description}
            </p>

            {/* Technologies */}
            {project.technologies && (
              <div className="mb-12">
                <h3 className="text-h3 font-bold mb-6">Tekniker</h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {project.link && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-black text-white font-semibold hover:bg-accent transition-colors"
                >
                  Besök hemsidan
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}
