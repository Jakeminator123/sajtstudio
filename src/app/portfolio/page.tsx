"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import CaseStudyModal from "@/components/CaseStudyModal";
import WordReveal from "@/components/WordReveal";
import { caseStudies, type CaseStudy } from "@/data/caseStudies";

// Get unique categories
const categories: string[] = [
  "Alla", 
  ...Array.from(new Set(caseStudies.map(c => c.category).filter((c): c is string => !!c)))
];

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCaseStudies =
    selectedCategory === "Alla"
      ? caseStudies
      : caseStudies.filter((c) => c.category === selectedCategory);

  const handleOpenModal = (caseStudy: CaseStudy) => {
    const index = caseStudies.findIndex(c => c.id === caseStudy.id);
    setSelectedIndex(index);
    setSelectedCaseStudy(caseStudy);
  };

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % caseStudies.length;
    setSelectedIndex(nextIndex);
    setSelectedCaseStudy(caseStudies[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = selectedIndex === 0 ? caseStudies.length - 1 : selectedIndex - 1;
    setSelectedIndex(prevIndex);
    setSelectedCaseStudy(caseStudies[prevIndex]);
  };

  return (
    <>
      <HeaderNav />
      <main className="pt-24">
        <section className="py-32 md:py-48 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-20"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
                <WordReveal text="Portfolio" />
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                <WordReveal
                  text="Utvalda case studies som visar vår kreativa kraft"
                  delay={0.3}
                  staggerDelay={0.04}
                />
              </p>
            </motion.div>

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex flex-wrap justify-center gap-3 mb-20"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-accent text-white scale-105"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-accent hover:text-accent"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            {/* Case Studies Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
            >
              {filteredCaseStudies.map((caseStudy, index) => (
                <motion.div
                  key={caseStudy.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="group cursor-pointer"
                  onClick={() => handleOpenModal(caseStudy)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden mb-6">
                    <Image
                      src={caseStudy.thumbnail}
                      alt={caseStudy.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:from-black/80 transition-colors duration-500" />
                    
                    {/* Overlay text */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-accent text-sm uppercase tracking-wider mb-2">
                        {caseStudy.category}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="text-gray-500 text-sm mb-2">{caseStudy.client}</div>
                    <h3 className="text-2xl md:text-3xl font-black mb-3 group-hover:text-accent transition-colors duration-300">
                      {caseStudy.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed line-clamp-2">
                      {caseStudy.problem.substring(0, 120)}...
                    </p>

                    {/* Tech stack preview */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {caseStudy.tech.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {caseStudy.tech.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium">
                          +{caseStudy.tech.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Case Study Modal */}
      {selectedCaseStudy && (
        <CaseStudyModal
          isOpen={!!selectedCaseStudy}
          onClose={() => setSelectedCaseStudy(null)}
          caseStudy={selectedCaseStudy}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={selectedIndex < caseStudies.length - 1}
          hasPrev={selectedIndex > 0}
        />
      )}
    </>
  );
}
