"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  thumbnail: string;
  hero: string;
  problem: string;
  solution: string;
  results: string[];
  tech: string[];
  images: string[];
}

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: CaseStudy;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function CaseStudyModal({
  isOpen,
  onClose,
  caseStudy,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: CaseStudyModalProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollPosition(target.scrollTop);
    };

    const modalContent = document.getElementById('case-study-content');
    modalContent?.addEventListener('scroll', handleScroll, { passive: true });

    return () => modalContent?.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-[101] overflow-hidden"
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="fixed top-6 right-6 z-[102] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              aria-label="Stäng"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Navigation arrows */}
            {hasPrev && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPrev}
                className="fixed left-6 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                aria-label="Föregående"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}

            {hasNext && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                className="fixed right-6 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                aria-label="Nästa"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}

            {/* Scrollable content */}
            <div
              id="case-study-content"
              className="h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero section */}
              <div className="relative h-screen">
                <Image
                  src={caseStudy.hero}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
                
                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                  <div className="max-w-6xl mx-auto">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-accent text-sm md:text-base uppercase tracking-wider mb-4"
                    >
                      {caseStudy.client}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-7xl font-black text-white mb-6"
                    >
                      {caseStudy.title}
                    </motion.h1>
                  </div>
                </div>
              </div>

              {/* Content sections */}
              <div className="bg-white text-gray-900">
                {/* Problem */}
                <section className="py-16 md:py-24">
                  <div className="max-w-4xl mx-auto px-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-5xl font-black mb-8"
                    >
                      Utmaningen
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="text-lg md:text-xl text-gray-700 leading-relaxed"
                    >
                      {caseStudy.problem}
                    </motion.p>
                  </div>
                </section>

                {/* Solution */}
                <section className="py-16 md:py-24 bg-gray-50">
                  <div className="max-w-4xl mx-auto px-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-5xl font-black mb-8"
                    >
                      Lösningen
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="text-lg md:text-xl text-gray-700 leading-relaxed"
                    >
                      {caseStudy.solution}
                    </motion.p>
                  </div>
                </section>

                {/* Images grid */}
                {caseStudy.images.length > 0 && (
                  <section className="py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {caseStudy.images.map((img, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative aspect-video overflow-hidden"
                          >
                            <Image
                              src={img}
                              alt={`${caseStudy.title} - Image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Results */}
                <section className="py-16 md:py-24 bg-gray-50">
                  <div className="max-w-4xl mx-auto px-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-5xl font-black mb-8"
                    >
                      Resultat
                    </motion.h2>
                    <div className="space-y-4">
                      {caseStudy.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4"
                        >
                          <svg
                            className="w-6 h-6 text-accent flex-shrink-0 mt-1"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-lg text-gray-700">{result}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Tech stack */}
                <section className="py-16 md:py-24">
                  <div className="max-w-4xl mx-auto px-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-3xl md:text-5xl font-black mb-8"
                    >
                      Teknologi
                    </motion.h2>
                    <div className="flex flex-wrap gap-4">
                      {caseStudy.tech.map((tech, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="px-6 py-3 bg-gray-100 text-gray-900 font-medium"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

