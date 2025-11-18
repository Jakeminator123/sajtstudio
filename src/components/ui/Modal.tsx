"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";
// import { designTokens } from "@/config/designTokens"; // Temporarily unused
import { trapFocus } from "@/lib/focusUtils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "lg",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll and trap focus when modal is open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll - use getComputedStyle to get actual values
      const computedStyle = window.getComputedStyle(document.body);
      const originalOverflow = computedStyle.overflow;
      const originalPaddingRight = computedStyle.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
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
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced backdrop with gradient blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-gradient-to-br from-black/90 via-black/85 to-gray-900/90"
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-gray-800/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>

          {/* Modal container with enhanced animations */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={`relative bg-white w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated border glow with blue/gray gradient */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(75, 85, 99, 0.1) 50%, rgba(0, 102, 255, 0.2) 100%)",
                  borderRadius: "inherit",
                }}
              >
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-accent/30 via-gray-400/20 to-accent/30 rounded-[inherit]" />
              </motion.div>

              {/* Blue gradient accent corners */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-800/10 to-transparent pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              />

              {/* Enhanced close button */}
              <motion.button
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                  backgroundColor: "#f3f4f6",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 flex items-center justify-center bg-white hover:bg-gray-50 transition-all duration-300 z-20 rounded-full shadow-lg border border-gray-200 group"
                aria-label="Stäng modal"
              >
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 blur-md"
                  transition={{ duration: 0.3 }}
                />
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10 text-gray-700 group-hover:text-accent transition-colors duration-300"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              </motion.button>

              {/* Modal content with custom scrollbar */}
              <div className="overflow-y-auto max-h-[90vh] custom-scrollbar relative z-10">
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
        {/* Enhanced hero section with image support */}
        <motion.div
          className={`${project.color} h-80 md:h-96 relative flex items-center justify-center overflow-hidden`}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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

          {/* Enhanced gradient overlay with blue/gray */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-gray-800/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-center text-white px-8 relative z-10"
          >
            <motion.h1
              className="text-display font-black mb-4 leading-[0.9]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {project.title}
            </motion.h1>
            <motion.p
              className="text-h3 font-semibold text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {project.category}
            </motion.p>
          </motion.div>

          {/* Enhanced animated corner accents */}
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/30 to-transparent"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-gray-800/30 to-transparent"
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        </motion.div>

        {/* Enhanced content section */}
        <div className="p-8 sm:p-12 md:p-16 lg:p-20 bg-white relative">
          {/* Blue gradient accent */}
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/5 to-transparent opacity-50 pointer-events-none" />

          {/* Gray gradient accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-900/3 to-transparent opacity-50 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="max-w-3xl mx-auto relative z-10"
          >
            {/* Description */}
            <motion.h2
              className="text-h2 font-black mb-6 text-black"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Om projektet
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 leading-relaxed mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {project.longDescription || project.description}
            </motion.p>

            {/* Technologies */}
            {project.technologies && (
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h3 className="text-h3 font-bold mb-6 text-black">Tekniker</h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.7 + index * 0.05,
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-gray-100 hover:bg-accent/10 text-gray-700 hover:text-accent font-medium transition-colors duration-300 border border-gray-200 hover:border-accent/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Enhanced CTA */}
            {project.link && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(0, 102, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-4 bg-black text-white font-semibold hover:bg-accent transition-all duration-300 relative overflow-hidden group shadow-lg"
                >
                  {/* Shimmer effect */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Besök hemsidan</span>
                </motion.a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}
