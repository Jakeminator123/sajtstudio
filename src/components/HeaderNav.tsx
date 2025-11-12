"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";

export default function HeaderNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentHash, setCurrentHash] = useState("");
  const [shimmeringIndex, setShimmeringIndex] = useState<number | null>(null);
  const shimmerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Track current hash
  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash);
      }
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);


  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = pathname === "/"
    ? [
      { href: "/", label: "Hem" },
      { href: "#tjanster", label: "Tjänster" },
      { href: "#process", label: "Process" },
      { href: "#omdomen", label: "Omdömen" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/contact", label: "Kontakt" },
    ]
    : siteConfig.nav.links;

  // Random shimmer effect on nav links - only after mount to avoid hydration mismatch
  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timeout = setTimeout(() => {
      shimmerIntervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * navLinks.length);
        setShimmeringIndex(randomIndex);

        // Clear shimmer after animation
        setTimeout(() => {
          setShimmeringIndex(null);
        }, 3000);
      }, 8000); // Trigger every 8 seconds
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (shimmerIntervalRef.current) {
        clearInterval(shimmerIntervalRef.current);
      }
    };
  }, [navLinks.length]);

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50"
          : "bg-transparent"
          }`}
      >
        {/* Animated gradient line at top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 100%",
          }}
        />

        {/* Red accent glow on scroll */}
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-tertiary/5 to-transparent pointer-events-none"
          />
        )}

        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                {/* Logo glow effect */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-accent/50 blur-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent to-tertiary p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <Image
                        src="/logo.svg"
                        alt="Sajtstudio"
                        width={24}
                        height={24}
                        className="brightness-0 invert"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Text logo */}
                <div className="relative">
                  <span className="text-xl font-black text-white">
                    Sajtstudio
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-accent to-tertiary"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-1 relative">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href ||
                    (link.href.startsWith('#') && pathname === '/' && currentHash === link.href);

                  return (
                    <motion.div
                      key={link.href}
                      onHoverStart={() => setHoveredIndex(index)}
                      onHoverEnd={() => setHoveredIndex(null)}
                      className="relative"
                    >
                      <Link
                        href={link.href}
                        className={`nav-link-shimmer px-4 py-2 text-sm font-semibold transition-all duration-300 relative z-10 ${isActive
                          ? "text-white"
                          : "text-gray-400 hover:text-white"
                          } ${shimmeringIndex === index ? 'shimmer-active' : ''}`}
                        suppressHydrationWarning
                      >
                        {link.label}

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-accent/20 to-tertiary/20 rounded-lg border border-accent/30"
                            transition={{ type: "spring", duration: 0.5 }}
                          />
                        )}

                        {/* Hover effect */}
                        {hoveredIndex === index && !isActive && (
                          <motion.div
                            layoutId="hoverTab"
                            className="absolute inset-0 bg-white/5 rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group cta-button-header"
              >
                {/* Button glow */}
                <motion.div
                  className="absolute inset-0 bg-tertiary/50 blur-xl rounded-full"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Link
                  href="/contact"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-accent to-tertiary text-white font-bold rounded-full overflow-hidden block"
                >
                  {/* Shimmer effect */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                  <span className="relative">Starta projekt</span>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center"
            >
              <div className="relative w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: menuOpen ? 45 : 0,
                    y: menuOpen ? 8 : 0,
                  }}
                  className="w-full h-0.5 bg-white origin-left"
                />
                <motion.span
                  animate={{
                    opacity: menuOpen ? 0 : 1,
                    scaleX: menuOpen ? 0 : 1,
                  }}
                  className="w-full h-0.5 bg-white"
                />
                <motion.span
                  animate={{
                    rotate: menuOpen ? -45 : 0,
                    y: menuOpen ? -8 : 0,
                  }}
                  className="w-full h-0.5 bg-white origin-left"
                />
              </div>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Modal */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-black border-l border-white/10 z-50 lg:hidden overflow-y-auto"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-90" />

              {/* Content */}
              <div className="relative p-8 pt-20">
                {/* Close button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMenuOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Menu items */}
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 px-4 text-lg font-semibold text-white hover:text-accent transition-colors relative group overflow-hidden rounded-lg"
                      >
                        {/* Hover background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-accent/10 to-tertiary/10"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-accent to-tertiary text-white font-bold rounded-full relative overflow-hidden"
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      animate={{
                        y: ["100%", "-100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                    <span className="relative">Starta projekt</span>
                  </Link>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -top-20 -left-20 w-40 h-40 bg-tertiary/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}