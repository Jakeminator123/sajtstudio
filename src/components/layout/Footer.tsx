'use client'

import { useTheme } from '@/hooks/useTheme'
import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [currentYear] = useState<number>(() => new Date().getFullYear())
  const { isLight } = useTheme()

  return (
    <footer
      className={`py-12 relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 text-gray-800'
          : 'bg-black text-white'
      }`}
      role="contentinfo"
    >
      {/* Decorative background elements */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-tr from-blue-100/30 via-transparent to-rose-100/20'
            : 'bg-gradient-to-t from-accent/5 via-transparent to-transparent'
        }`}
      />

      {/* Subtle accent glow */}
      {isLight && (
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      )}
      {isLight && (
        <div className="absolute bottom-0 right-1/4 w-48 h-24 bg-gradient-to-tl from-rose-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3
              className={`text-2xl font-bold mb-2 ${
                isLight
                  ? 'bg-gradient-to-r from-gray-800 via-blue-700 to-rose-600 bg-clip-text text-transparent'
                  : 'text-white'
              }`}
            >
              Sajtstudio
            </h3>
            <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              Modern webbdesign för framgångsrika företag
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col md:flex-row gap-6 md:gap-8">
            {[
              { href: '/', label: 'Hem' },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/kontakt', label: 'Kontakt' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors relative group ${
                  isLight ? 'text-gray-600 hover:text-blue-600' : 'text-gray-300 hover:text-accent'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
                    isLight ? 'bg-blue-500' : 'bg-accent'
                  }`}
                />
              </Link>
            ))}
          </nav>
        </div>

        <div
          className={`border-t mt-8 pt-8 text-center text-sm ${
            isLight ? 'border-amber-200/50 text-gray-500' : 'border-gray-800 text-gray-400'
          }`}
        >
          <p suppressHydrationWarning>
            © {currentYear ?? new Date().getFullYear()} Sajtstudio. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  )
}
