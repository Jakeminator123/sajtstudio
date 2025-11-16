"use client";

/**
 * HeaderNav Component
 * 
 * @description Hybrid navigation component that handles both mobile and desktop layouts.
 * - Desktop: Shows navigation links and CTA button in header
 * - Mobile: Shows hamburger menu button that opens MobileMenu component
 * 
 * @mobile - Mobile menu button (lg:hidden), MobileMenu component
 * @desktop - Desktop navigation (hidden lg:flex), Desktop CTA button
 * @both - Logo, header container
 * 
 * @see MobileMenu - Mobile-specific menu component
 * @see RESPONSIVE_DESIGN_GUIDE.md - For responsive patterns
 */

import Button from "@/components/ui/Button";
import { siteConfig } from "@/config/siteConfig";
import { useMounted } from "@/hooks/useMounted";
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";

type NavLink = {
  href: string;
  label: string;
  hash?: string;
};

export default function HeaderNav() {
  const pathname = usePathname();
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentHash, setCurrentHash] = useState("");
  const [shimmeringIndex, setShimmeringIndex] = useState<number | null>(null);
  const shimmerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll({
    layoutEffect: false,
  });

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

  const navLinks = useMemo<NavLink[]>(() => {
    const baseLinks = siteConfig.nav.links;
    const homeLink = baseLinks.find((link) => link.href === "/");
    const otherLinks = baseLinks.filter((link) => link.href !== "/");
    const anchorLinks =
      siteConfig.nav.homeAnchors?.map((anchor) => {
        const normalizedHash = anchor.href.startsWith("#")
          ? anchor.href
          : `#${anchor.href}`;

        return {
          label: anchor.label,
          hash: normalizedHash,
          // Always link to home page with anchor, so it works from any page
          href: `/${normalizedHash}`,
        };
      }) ?? [];

    return [
      ...(homeLink ? [{ ...homeLink }] : []),
      ...anchorLinks,
      ...otherLinks,
    ];
  }, [pathname]);

  // Deterministic shimmer effect on nav links - only after mount to avoid hydration mismatch
  useEffect(() => {
    if (navLinks.length === 0) return;

    // Small delay to ensure hydration is complete
    const timeout = setTimeout(() => {
      let shimmerCounter = 0;
      shimmerIntervalRef.current = setInterval(() => {
        // Use deterministic seed based on counter and pathname for consistent behavior
        const seed = (shimmerCounter * 0.618033988749895 + pathname.length) % 1; // Golden ratio for better distribution
        const deterministicIndex = Math.floor(seed * navLinks.length);
        setShimmeringIndex(deterministicIndex);
        shimmerCounter++;

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
        shimmerIntervalRef.current = null;
      }
    };
  }, [navLinks.length, pathname]);

  return (
    <>
      {/* Main Header */}
      {/* ============================================
         HEADER CONTAINER
         ============================================
         Fixed header that changes appearance on scroll
         Works on both mobile and desktop
      */}
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
          style={{ backgroundSize: "200% 100%" }}
        />

        {/* Red accent glow on scroll */}
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-tertiary/5 to-transparent pointer-events-none"
          />
        )}

        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex items-center justify-between relative">
            {/* ============================================
               LOGO
               ============================================
               Visible on both mobile and desktop
            */}
            <Link
              href="/"
              className="group relative"
              prefetch={true}
            >
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

            {/* ============================================
               DESKTOP NAVIGATION
               ============================================
               Visible only on desktop (lg breakpoint and above)
               Contains navigation links with hover effects and shimmer animations
            */}
            <nav className="hidden lg:flex items-center gap-8 relative">
              <div className="flex items-center gap-1 relative">
                {navLinks.map((link, index) => {
                  const isAnchorLink = Boolean(link.hash);
                  const isActive =
                    (!isAnchorLink && pathname === link.href) ||
                    (isAnchorLink && pathname === "/" && currentHash === link.hash);

                  return (
                    <motion.div
                      key={link.hash ?? link.href}
                      onHoverStart={() => setHoveredIndex(index)}
                      onHoverEnd={() => setHoveredIndex(null)}
                      className="relative"
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          // Handle anchor links: if on different page, navigate first then scroll
                          if (isAnchorLink && pathname !== "/") {
                            e.preventDefault();
                            // Use Next.js router for better navigation
                            window.location.href = link.href;
                            return;
                          }
                          // Allow normal navigation for regular links
                        }}
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
            </nav>

            {/* ============================================
                 DESKTOP CTA BUTTON
                 ============================================
                 Visible on desktop, hidden on mobile (mobile CTA is in MobileMenu)
              */}
            <div className="cta-button-header hidden lg:block">
              <Button
                href="/contact"
                variant="cta"
                size="sm"
                ariaLabel="Starta projekt"
              >
                Starta projekt
              </Button>
            </div>

            {/* ============================================
               MOBILE MENU BUTTON (Hamburger)
               ============================================
               Visible only on mobile (hidden on lg and above)
               Opens/closes the mobile menu
            */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden relative w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
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
      </motion.header >

      {/* ============================================
         MOBILE MENU
         ============================================ */}
      < MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)
        }
        navLinks={navLinks}
      />
    </>
  );
}