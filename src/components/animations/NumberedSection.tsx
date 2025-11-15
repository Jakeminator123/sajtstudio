"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NumberedSectionProps {
  number: string;
  title?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export default function NumberedSection({
  number,
  title,
  children,
  className = "",
  dark = false,
}: NumberedSectionProps) {
  return (
    <section className={`relative ${className}`}>
      {/* Number indicator with vertical line */}
      <div className="absolute top-0 left-4 md:left-8 lg:left-16">
        <div className="sticky top-24">
          {/* Number badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div
              className={`
                font-mono text-xs md:text-sm font-bold tracking-wider
                ${dark ? "text-white/60" : "text-gray-400"}
              `}
            >
              {number}
            </div>
            
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className={`
                w-px h-32 mt-4 origin-top
                ${dark ? "bg-white/20" : "bg-gray-300"}
              `}
            />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="pl-16 md:pl-24 lg:pl-32">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={`
              text-4xl md:text-6xl lg:text-7xl font-black mb-12 md:mb-16
              ${dark ? "text-white" : "text-gray-900"}
            `}
          >
            {title}
          </motion.h2>
        )}
        
        {children}
      </div>
    </section>
  );
}

