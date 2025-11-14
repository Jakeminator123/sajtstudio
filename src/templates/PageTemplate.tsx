'use client';

import { ReactNode } from 'react';
import HeaderNav from '@/components/HeaderNav';
import Footer from '@/components/Footer';

interface PageTemplateProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * PageTemplate - Grundmall för alla sidor
 * 
 * Använd denna mall när du skapar nya sidor för att säkerställa
 * konsistent struktur och layout.
 */
export default function PageTemplate({
  children,
  showHeader = true,
  showFooter = true,
  className = '',
}: PageTemplateProps) {
  return (
    <>
      {showHeader && <HeaderNav />}
      <main className={`pt-24 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}

