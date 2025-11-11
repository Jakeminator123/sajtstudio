'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { processSteps } from '@/config/content/process';

interface ProcessStepProps {
  step: typeof processSteps[0];
  index: number;
}

function ProcessStep({ step, index }: ProcessStepProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
      whileHover={{ x: 4 }}
    >
      <div className="border-t border-black pt-8 pb-12 relative">
        {/* Hover background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.5 }}
        />
        
        <div className="flex items-start gap-6 relative z-10">
          <motion.span 
            className={`text-6xl md:text-8xl font-black transition-all duration-500 relative
              ${parseInt(step.number) % 2 === 0 
                ? 'text-gray-200 group-hover:text-accent' 
                : 'text-gray-200 group-hover:text-tertiary'
              }`}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {step.number}
            {/* Glow effect */}
            <motion.span
              className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-50
                ${parseInt(step.number) % 2 === 0 ? 'text-accent' : 'text-tertiary'}`}
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.2 }}
            >
              {step.number}
            </motion.span>
          </motion.span>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.h3 
              className="text-3xl md:text-4xl font-bold mb-4"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {step.title}
            </motion.h3>
            <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProcessSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-white relative overflow-hidden">
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
        <div className="absolute inset-0 bg-[url('/images/hero/city-background.webp')] bg-cover bg-center bg-no-repeat" />
      </div>
      
      {/* Background accent */}
      <motion.div
        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-gray-50/80 to-transparent opacity-50 z-0"
        initial={{ x: '-100%' }}
        animate={isInView ? { x: 0 } : { x: '-100%' }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-tertiary/5 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl mx-auto mb-16"
        >
          <motion.h2 
            className="text-hero md:text-display font-black mb-6 text-center leading-[0.9]"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Så här arbetar vi
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            En strukturerad process som säkerställer resultat
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-0">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.number}
                step={step}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


