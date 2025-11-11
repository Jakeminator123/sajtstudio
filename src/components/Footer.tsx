'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Sajtstudio</h3>
            <p className="text-gray-400">Modern webbdesign för framgångsrika företag</p>
          </div>
          
          <nav className="flex flex-col md:flex-row gap-6 md:gap-8">
            <Link href="/" className="text-sm hover:text-accent transition-colors">
              Hem
            </Link>
            <Link href="/portfolio" className="text-sm hover:text-accent transition-colors">
              Portfolio
            </Link>
            <Link href="/contact" className="text-sm hover:text-tertiary transition-colors">
              Kontakt
            </Link>
          </nav>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Sajtstudio. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}

