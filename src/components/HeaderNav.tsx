'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import { designTokens } from '@/config/designTokens';

export default function HeaderNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // More nuanced scroll detection
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });
  
  // Smooth background opacity based on scroll
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.98)']
  );
  
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 rgba(0,0,0,0)', '0 1px 0 rgba(0,0,0,0.1)']
  );

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ 
          backgroundColor: headerBg,
          boxShadow: headerShadow,
        }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-colors duration-500`}
        role="banner"
      >
        <nav className="container mx-auto px-6 py-5" role="navigation" aria-label="Huvudnavigation">
          <div className="flex items-center justify-between">
            {/* Logo with new icon */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Sajtstudio - Startsida">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/logo.svg"
                  alt="Sajtstudio logotyp"
                  width={36}
                  height={36}
                  className="transition-transform duration-300"
                />
              </motion.div>
              <span className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors duration-300" aria-hidden="true">
                Sajtstudio
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {[
                { href: '/', label: 'Hem' },
                { href: '/portfolio', label: 'Portfolio' },
                { href: '/contact', label: 'Kontakt' },
              ].map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                </motion.div>
              ))}
              
              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-accent transition-all duration-300"
                >
                  Starta projekt
                </Link>
              </motion.div>
            </div>
            
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-8 h-8 flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isMenuOpen ? 'Stäng meny' : 'Öppna meny'}</span>
              <motion.span
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 0 : -8,
                }}
                className="absolute w-6 h-0.5 bg-black transition-colors"
              />
              <motion.span
                animate={{
                  opacity: isMenuOpen ? 0 : 1,
                }}
                className="absolute w-6 h-0.5 bg-black transition-colors"
              />
              <motion.span
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? 0 : 8,
                }}
                className="absolute w-6 h-0.5 bg-black transition-colors"
              />
            </motion.button>
          </div>
        </nav>
      </motion.header>
      
      {/* Mobile Menu Overlay */}
      <motion.div
        id="mobile-menu"
        initial={false}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-white z-40 md:hidden"
        aria-hidden={!isMenuOpen}
      >
        <nav className="container mx-auto px-6 pt-24" role="navigation">
          <div className="flex flex-col gap-8">
            {[
              { href: '/', label: 'Hem' },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/contact', label: 'Kontakt' },
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                  x: isMenuOpen ? 0 : -20,
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-bold hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                y: isMenuOpen ? 0 : 20,
              }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="inline-block px-8 py-4 bg-black text-white font-semibold hover:bg-accent transition-colors"
              >
                Starta projekt
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.div>
    </>
  );
}

