"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import { projects, categories } from "@/data/projects";
import { ProjectModal } from "@/components/Modal";
import { PortfolioGridSkeleton } from "@/components/Skeleton";

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedProject, setSelectedProject] = useState<
    (typeof projects)[0] | null
  >(null);

  const filteredProjects =
    selectedCategory === "Alla"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <>
      <HeaderNav />
      <main className="pt-24">
        <section className="py-32 md:py-48 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-20"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-hero md:text-display font-black mb-8 leading-[0.9]"
              >
                Portfolio
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="text-h4 text-gray-600 max-w-2xl mx-auto"
              >
                Utvalda projekt som visar vad vi kan skapa
              </motion.p>
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
                  className={`px-8 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-black text-white scale-105"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-black hover:text-black"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            {/* Projects Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div
                    className={`${project.color} aspect-[4/3] rounded-lg flex flex-col items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="relative z-10 text-center p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {project.title}
                      </h3>
                      <p className="text-white/80 mb-3">{project.category}</p>
                      <p className="text-white/70 text-sm mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          project={selectedProject}
        />
      )}
    </>
  );
}
