'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { featuredProjects } from '@/data/projects';
import { useRef } from 'react';
import { designTokens } from '@/config/designTokens';

export default function PortfolioSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 lg:py-48 bg-white relative overflow-hidden">
      {/* Subtle background video pattern - only load when in view */}
      {isInView && (
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover scale-150"
            style={{ filter: 'grayscale(100%) contrast(120%)' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src="/videos/noir_hero.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      
      {/* Subtle image texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/hero/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp')] bg-cover bg-center bg-no-repeat" />
      </div>
      
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50/80 to-transparent opacity-50 z-0" />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-tertiary/5 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-hero md:text-display font-black mb-8 leading-[0.9]"
          >
            Utvalda projekt
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-h4 text-gray-600 max-w-2xl mx-auto"
          >
            Hemsidor som gör skillnad för våra kunder
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15 + 0.3,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="group cursor-pointer relative"
            >
              <Link href="/portfolio">
                <motion.div 
                  className={`${project.color} aspect-[4/3] flex items-center justify-center relative overflow-hidden group`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Background image if available */}
                  {project.image && (
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    >
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        unoptimized
                        onError={(e) => {
                          // Silently handle image errors - fallback to gradient background
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {/* Animated gradient overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 0.7 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  
                  {/* Content container with enhanced animations */}
                  <motion.div 
                    className="relative z-10 text-center p-8"
                    initial={{ y: 0, opacity: 1 }}
                    whileHover={{ y: -8, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <motion.h3 
                      className="text-h3 font-black text-white mb-3"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {project.title}
                    </motion.h3>
                    <motion.p 
                      className="text-white/90 mb-3 text-lg font-semibold"
                      whileHover={{ scale: 1.02 }}
                    >
                      {project.category}
                    </motion.p>
                    <motion.p 
                      className="text-white/80 text-base leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.description}
                    </motion.p>
                  </motion.div>
                  
                  {/* Animated corner accents */}
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: -45 }}
                    whileHover={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-tertiary/30 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: 45 }}
                    whileHover={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  
                  {/* Border glow effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-accent opacity-0 group-hover:opacity-50"
                    initial={{ scale: 0.95 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/portfolio"
              className="inline-block px-10 py-5 border-2 border-black text-black text-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
            >
              Se alla projekt
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

