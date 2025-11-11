'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  // Scroll-based animation
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const footerOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const footerY = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <motion.footer
      ref={footerRef}
      style={{ opacity: footerOpacity, y: footerY }}
      className="bg-black text-white py-12 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div>
            <motion.h3
              className="text-2xl font-bold mb-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Sajtstudio
            </motion.h3>
            <p className="text-gray-400">Modern webbdesign för framgångsrika företag</p>
          </div>
          
          <nav className="flex flex-col md:flex-row gap-6 md:gap-8">
            {[
              { href: "/", label: "Hem" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/contact", label: "Kontakt" },
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="text-sm hover:text-accent transition-colors relative group"
                >
                  {link.label}
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300"
                  />
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"
        >
          <p>© {new Date().getFullYear()} Sajtstudio. Alla rättigheter förbehållna.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

