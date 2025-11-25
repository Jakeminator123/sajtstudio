'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [currentYear] = useState<number>(() => new Date().getFullYear());

  return (
    <footer className="bg-black text-white py-12 relative overflow-hidden" role="contentinfo">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Sajtstudio
            </h3>
            <p className="text-gray-400">Modern webbdesign för framgångsrika företag</p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col md:flex-row gap-6 md:gap-8">
            {[
              { href: "/", label: "Hem" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/contact", label: "Kontakt" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:text-accent transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p suppressHydrationWarning>
            © {currentYear ?? new Date().getFullYear()} Sajtstudio. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}

