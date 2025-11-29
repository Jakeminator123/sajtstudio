"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks:
    | readonly { href: string; label: string }[]
    | Array<{ href: string; label: string }>;
}

/**
 * MobileMenu Component
 *
 * @description Mobile-specific slide-in menu component.
 * Only used on mobile devices (hidden on desktop via lg:hidden in parent).
 *
 * @mobile - 100% mobile component
 * @desktop - Not used (hidden)
 *
 * @see HeaderNav - Parent component that uses this menu
 * @see RESPONSIVE_DESIGN_GUIDE.md - For responsive patterns
 *
 * ============================================
 * MOBILE MENU COMPONENT
 * ============================================
 *
 * Slide-in mobile menu that appears on mobile devices.
 * Contains navigation links and CTA button.
 */
export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
}: MobileMenuProps) {
  const { isLight } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-sm z-40 lg:hidden ${
              isLight ? "bg-amber-900/30" : "bg-black/80"
            }`}
          />

          {/* Menu Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-sm border-l z-50 lg:hidden overflow-y-auto ${
              isLight
                ? "bg-gradient-to-br from-[#fef9e7] via-[#fff5e6] to-[#f0f7ff] border-amber-200/50"
                : "bg-black border-white/10"
            }`}
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 opacity-90 ${
                isLight
                  ? "bg-gradient-to-br from-amber-50 via-orange-50/50 to-sky-50"
                  : "bg-gradient-to-br from-black via-gray-950 to-black"
              }`}
            />

            {/* Content */}
            <div className="relative p-8 pt-20">
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  isLight
                    ? "bg-gray-900/10 hover:bg-gray-900/20"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                aria-label="Stäng meny"
              >
                <svg
                  className={`w-5 h-5 ${isLight ? "text-gray-900" : "text-white"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                      onClick={(e) => {
                        onClose();
                        // Handle anchor links: if on different page, navigate first then scroll
                        const isAnchorLink = link.href.includes("#");
                        const pathname = window.location.pathname;
                        if (isAnchorLink && pathname !== "/") {
                          e.preventDefault();
                          window.location.href = link.href;
                        }
                      }}
                      className={`block py-3 px-4 text-lg font-semibold hover:text-accent transition-colors relative group overflow-hidden rounded-lg ${
                        isLight ? "text-gray-900" : "text-white"
                      }`}
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
                onClick={onClose}
              >
                <Button
                  href="/contact"
                  variant="cta"
                  size="md"
                  fullWidth
                  ariaLabel="Starta projekt"
                >
                  Starta projekt
                </Button>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  isLight ? "bg-sky-300/30" : "bg-accent/20"
                }`}
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
                className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
                  isLight ? "bg-amber-200/40" : "bg-tertiary/20"
                }`}
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
  );
}
