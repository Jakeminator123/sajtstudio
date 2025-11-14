"use client";

import HeaderNav from "@/components/HeaderNav";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Critical components loaded immediately for smooth scrolling
import ScrollIndicator from "@/components/ScrollIndicator";
// Load first 3-4 sections immediately - they appear early and need smooth scrolling
import AboutSection from "@/components/AboutSection";
import USPSection from "@/components/USPSection";
import ServicesSection from "@/components/ServicesSection";
// CRITICAL: HeroAnimation must be ready when user scrolls - contains video explosion and Pacman game
import HeroAnimation from "@/components/HeroAnimation";
import TechShowcaseSection from "@/components/TechShowcaseSection";

import { SectionSkeleton } from "@/components/Skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import { usePrefetchOnScroll } from "@/hooks/usePrefetchOnScroll";

// Lazy load sections that appear later - prefetched via usePrefetchOnScroll for smooth scrolling

const ProcessSection = dynamic(() => import("@/components/ProcessSection"), {
  loading: () => <SectionSkeleton />,
});

const TestimonialsSection = dynamic(
  () => import("@/components/TestimonialsSection"),
  {
    loading: () => <SectionSkeleton />,
  }
);

const BigCTA = dynamic(() => import("@/components/BigCTA"), {
  loading: () => <SectionSkeleton />,
});

const OpticScrollShowcase = dynamic(
  () => import("@/components/OpticScrollShowcase"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Client-only: relies on window scroll APIs and Framer Motion observers
  }
);

export default function Home() {
  // Prefetch links on hover for faster navigation
  usePrefetch();
  // Prefetch components as user scrolls near them
  usePrefetchOnScroll();

  return (
    <>
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="relative z-10">
        {/* Hero with rain, lightning, and text animations */}
        <HeroSection />

        {/* Scroll indicator - fades out on scroll */}
        <ScrollIndicator />

        {/* About section with word reveal */}
        <div id="om-oss" className="content-visibility-auto">
          <AboutSection />
        </div>

        {/* USP Section - Numrerade punkter som beskriver företaget */}
        <div className="content-visibility-auto">
          <USPSection />
        </div>

        {/* Services with modals */}
        <div id="tjanster" className="content-visibility-auto">
          <ServicesSection />
        </div>

        {/* Portfolio animation - behåll nuvarande explosion */}
        {/* CRITICAL: HeroAnimation loaded directly - video explosion must be ready */}
        <div className="content-visibility-auto">
          <HeroAnimation />
        </div>
        {/* Tech vs Design showcase - interactive Pacman demo */}
        {/* CRITICAL: TechShowcaseSection loaded directly - Pacman game must be ready */}
        <div className="content-visibility-auto">
          <TechShowcaseSection />
        </div>

        {/* Scroll illusion lab inspired by Fantasy scrollytelling */}
        <div className="content-visibility-auto">
          <OpticScrollShowcase />
        </div>

        {/* Process steps */}
        <div id="process" className="content-visibility-auto">
          <ProcessSection />
        </div>

        {/* Testimonials */}
        <div id="omdomen" className="content-visibility-auto">
          <TestimonialsSection />
        </div>

        {/* Big CTA - Fantasy style */}
        <div className="content-visibility-auto">
          <BigCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
