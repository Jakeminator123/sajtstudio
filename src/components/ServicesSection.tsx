"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useModalManager } from "@/hooks/useModalManager";
import ServiceCard from "./ServiceCard";
import ServiceModal from "./ServiceModal";
import WordReveal from "./WordReveal";
import SmokeEffect from "./SmokeEffect";
import { services } from "@/data/services";
import type { Service } from "@/data/services";

export default function ServicesSection() {
  const { isOpen, modalId, data, openModal, closeModal } = useModalManager();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scroll-based parallax effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const videoOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 0.6, 0.5, 0.3]);
  const videoScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure video plays when mounted
  useEffect(() => {
    if (mounted && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's okay
      });
    }
  }, [mounted]);

  const handleOpenModal = (service: Service, index: number) => {
    setSelectedService(service);
    openModal(`service-${service.id}`, { service, index });
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedService(null);
  };

  return (
    <section 
      ref={sectionRef}
      className="section-spacing-md bg-black text-white relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <motion.video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: videoOpacity,
              scale: videoScale,
            }}
          >
            <source src="/videos/background_vid.mp4" type="video/mp4" />
          </motion.video>
        )}
        
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-10" />
        
        {/* Accent gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-tertiary/20 z-10"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.5, 0.3]),
          }}
        />
        
        {/* Animated grid pattern overlay */}
        <motion.div
          className="absolute inset-0 opacity-10 z-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 102, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 102, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.15, 0.05]),
          }}
        />
      </div>

      {/* Smoke effect - adjusted for dark background */}
      <SmokeEffect count={6} speed={20} opacity={0.15} />

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              opacity: useTransform(
                scrollYProgress,
                [0, 0.3 + i * 0.02, 0.7 + i * 0.02, 1],
                [0, 1, 1, 0]
              ),
              scale: useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]),
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-20">
        {/* Section header with enhanced styling */}
        <motion.div 
          className="mb-16 md:mb-24 text-center"
          style={{ y: textY }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none"
            style={{
              textShadow: "0 0 80px rgba(0, 102, 255, 0.5), 0 0 120px rgba(0, 102, 255, 0.3)",
            }}
          >
            <WordReveal 
              text="Våra Tjänster" 
              className="bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent"
            />
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <WordReveal
              text="Vi erbjuder kompletta lösningar för moderna företag som vill växa online"
              delay={0.3}
              staggerDelay={0.03}
              className="text-gray-200"
            />
          </motion.p>
        </motion.div>

        {/* Services grid with enhanced animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <ServiceCard
                service={service}
                index={index}
                onClick={() => handleOpenModal(service, index)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          service={selectedService}
          direction={
            data?.index !== undefined && data.index % 2 === 0 ? "left" : "right"
          }
        />
      )}
    </section>
  );
}
