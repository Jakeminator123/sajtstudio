'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useState, useRef } from 'react'

const portfolioProjects = [
  {
    id: 1,
    title: 'Digital Innovation',
    category: 'Web Design',
    image: '/images/portfolio/portfolio_1.webp',
    description: 'Modern webbdesign för framtidens företag',
    color: 'from-blue-600 to-purple-600',
  },
  {
    id: 2,
    title: 'Creative Solutions',
    category: 'Branding',
    image: '/images/portfolio/portfolio_2.webp',
    description: 'Visuell identitet som står ut',
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 3,
    title: 'Tech Showcase',
    category: 'Development',
    image: '/images/portfolio/portfolio_3.webp',
    description: 'Kraftfulla tekniska lösningar',
    color: 'from-pink-600 to-red-600',
  },
  {
    id: 4,
    title: 'Design System',
    category: 'Architecture',
    image: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    description: 'Skalbar arkitektur och design',
    color: 'from-red-600 to-orange-600',
  },
  {
    id: 5,
    title: 'Visual Stories',
    category: 'UI/UX',
    image: '/images/portfolio/portfolio_5.webp',
    description: 'Användarupplevelser som berör',
    color: 'from-green-600 to-teal-600',
  },
  {
    id: 6,
    title: 'Brand Evolution',
    category: 'Strategy',
    image: '/images/portfolio/portfolio_6.webp',
    description: 'Strategisk varumärkesutveckling',
    color: 'from-orange-600 to-yellow-600',
  },
]

export default function PortfolioGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<(typeof portfolioProjects)[0] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  return (
    <section
      ref={containerRef}
      className="relative py-32 overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Background gradient */}
      <motion.div className="absolute inset-0 opacity-30" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
              Våra Senaste Projekt
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Utforska vårt portfolio av innovativa webbupplevelser och digitala lösningar
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ scale }}
        >
          {portfolioProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(project.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => setSelectedProject(project)}
              className="group relative cursor-pointer"
            >
              <div
                className="relative overflow-hidden rounded-2xl bg-gray-900 aspect-[4/3] w-full"
                style={{ minHeight: '200px' }}
              >
                {/* Image */}
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                />

                {/* Dark overlay for text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={
                      hoveredId === project.id ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm text-gray-300 font-medium uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-2 mb-3">{project.title}</h3>
                    <p className="text-gray-200 text-sm">{project.description}</p>
                  </motion.div>
                </div>

                {/* Corner accent */}
                <motion.div
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                  animate={
                    hoveredId === project.id ? { scale: 1.2, rotate: 90 } : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-20"
        >
          <p className="text-gray-400 mb-8">
            Vill du se mer av vårt arbete eller diskutera ditt nästa projekt?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
          >
            Starta ett projekt
          </motion.button>
        </motion.div>
      </div>

      {/* Modal for selected project */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full bg-gray-900 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-8">
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                {selectedProject.category}
              </span>
              <h3 className="text-3xl font-bold text-white mt-2 mb-4">{selectedProject.title}</h3>
              <p className="text-gray-300 text-lg mb-6">{selectedProject.description}</p>
              <button
                className={`px-6 py-3 bg-gradient-to-r ${selectedProject.color} text-white font-semibold rounded-lg hover:scale-105 transition-transform`}
              >
                Visa projekt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
