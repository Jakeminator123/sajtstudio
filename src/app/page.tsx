"use client";

import Footer from "@/components/layout/Footer";
import HeaderNav from "@/components/layout/HeaderNav";
import HeroSection from "@/components/sections/HeroSection";
import dynamic from "next/dynamic";

// Critical components loaded immediately for smooth scrolling
import ScrollIndicator from "@/components/animations/ScrollIndicator";
// Load first 3-4 sections immediately - they appear early and need smooth scrolling
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import USPSection from "@/components/sections/USPSection";
// CRITICAL: HeroAnimation must be ready when user scrolls - contains video explosion and Pacman game
import HeroAnimation from "@/components/sections/HeroAnimation";
import TechShowcaseSection from "@/components/sections/TechShowcaseSection";

import { SectionSkeleton } from "@/components/ui/Skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import { usePrefetchOnScroll } from "@/hooks/usePrefetchOnScroll";
import { useTheme } from "@/hooks/useTheme";
import IntroVideo from "@/components/animations/IntroVideo";

// Lazy load sections that appear later - prefetched via usePrefetchOnScroll for smooth scrolling
// Using explicit error handling to prevent webpack module loading issues

const ProcessSection = dynamic(
  () =>
    import("@/components/sections/ProcessSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/sections/TestimonialsSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const BigCTA = dynamic(
  () =>
    import("@/components/sections/BigCTA").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const OpticScrollShowcase = dynamic(
  () =>
    import("@/components/sections/OpticScrollShowcase").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Client-only: relies on window scroll APIs and Framer Motion observers
  }
);

export default function Home() {
  // Prefetch links on hover for faster navigation - updated buttons v2
  usePrefetch();
  // Prefetch components as user scrolls near them - delayed to avoid blocking navigation
  usePrefetchOnScroll();
  const { isLight } = useTheme();

  return (
    <>
      {/* Intro video - plays on page load to allow resources to load */}
      <IntroVideo />

      <HeaderNav />
      <main id="main-content" tabIndex={-1} className={`relative z-10 transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-b from-amber-50 via-orange-50/30 to-sky-50"
          : "bg-black"
      }`}>
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

        {/* Scroll illusion lab - parallax, zoom, and sticky animations */}
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
