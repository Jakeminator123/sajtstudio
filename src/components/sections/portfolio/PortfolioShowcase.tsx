'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useRef } from 'react'

// Showcase data for real client projects
const showcaseProjects = [
  {
    id: 'prometheus',
    title: 'Prometheus Poker',
    client: 'Prometheus Team',
    year: '2024',
    image: '/images/portfolio/showcase_prometheus.webp',
    description:
      'AI-driven pokeranalysplattform med preflop/postflop-verktyg, battle mode och power ranking',
    technologies: ['React', 'Node.js', 'AI/ML', 'WebSocket'],
    features: ['AI-driven analys', 'Realtidsberäkningar', 'Power Ranking'],
    url: 'https://prometheuspoker.com',
  },
  {
    id: 'dg97',
    title: 'DG97 Kontorshotell',
    client: 'DG97',
    year: '2024',
    image: '/images/portfolio/showcase_dg97.webp',
    description: 'Modern webbplats för kontorshotell i Vasastan, Stockholm med bokningssystem',
    technologies: ['WordPress', 'PHP', 'Responsive Design', 'SEO'],
    features: ['Online-bokning', 'Virtuell visning', 'Bloggplattform'],
    url: 'https://www.dg97.se',
  },
  {
    id: 'pynn',
    title: 'PYNN AI',
    client: 'PYNN',
    year: '2025',
    image: '/images/portfolio/pynn_hero.webp',
    description:
      'White-label AI-plattform för investerare, inkubatorer och acceleratorer i innovationsekosystemet',
    technologies: ['Next.js', 'TypeScript', 'AI/ML', 'PostgreSQL'],
    features: ['AI-analys', 'Dealflow Management', 'Global Marketplace'],
    url: 'https://pynn.ai',
  },
  {
    id: 'raymond',
    title: 'Raymond Media',
    client: 'Raymond Media AB',
    year: '2024',
    image: '/images/portfolio/raymond_hero.webp',
    description: 'Datadriven plattform för ringlistor och adressregister med avancerad filtrering',
    technologies: ['WordPress', 'PHP', 'MySQL', 'SEO'],
    features: ['Adressfiltrering', 'Leadgenerering', 'E-postlistor'],
    url: 'https://raymondmedia.se',
  },
]

export default function PortfolioShowcase() {
  const [activeProject, setActiveProject] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <section
      ref={containerRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black"
      style={{ position: 'relative' }}
    >
      {/* Animated background */}
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_50%)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
            Framtidens Projekt
          </span>
          <h2 className="text-5xl md:text-7xl font-black mt-4 mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Showcase
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Plattform för att visa upp dina kommande projekt och case studies
          </p>
        </motion.div>

        {/* Showcase Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Project details */}
          <motion.div style={{ y }} className="space-y-8">
            {/* Project selector */}
            <div className="flex gap-4 mb-8">
              {showcaseProjects.map((project, index) => (
                <motion.button
                  key={project.id}
                  onClick={() => setActiveProject(index)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    activeProject === index
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {project.title}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Project info */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-gray-400">
                      {showcaseProjects[activeProject].client}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-400">
                      {showcaseProjects[activeProject].year}
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-4">
                    {showcaseProjects[activeProject].title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {showcaseProjects[activeProject].description}
                  </p>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Teknologier
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {showcaseProjects[activeProject].technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Nyckelfunktioner
                  </h4>
                  <ul className="space-y-2">
                    {showcaseProjects[activeProject].features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Visa Live Demo
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right side - Project image */}
          <motion.div
            className="relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800"
              animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={showcaseProjects[activeProject].image}
                    alt={showcaseProjects[activeProject].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Overlay effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                animate={{ opacity: isHovered ? 0.3 : 0.6 }}
                transition={{ duration: 0.3 }}
              />

              {/* Browser frame */}
              <div className="absolute top-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-t-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 flex-1 bg-white/10 rounded-md h-6" />
                </div>
              </div>

              {/* Interactive hint */}
              <motion.div
                className="absolute bottom-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full"
                animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm text-white font-medium">Klicka för detaljer</span>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>

        {/* Add project section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 text-center"
        >
          <div className="inline-block p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Lägg till dina egna projekt</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Detta är en showcase-mall där du enkelt kan lägga till och visa upp dina kommande
              projekt
            </p>
            <button className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
              + Lägg till projekt
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
