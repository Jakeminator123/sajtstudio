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
import IntroVideo from "@/components/animations/IntroVideo";

// Lazy load sections that appear later - prefetched via usePrefetchOnScroll for smooth scrolling
// Using explicit error handling to prevent webpack module loading issues

const ProcessSection = dynamic(
  () =>
    import("@/components/sections/ProcessSection").catch((err) => {
      console.error("Failed to load ProcessSection:", err);
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/sections/TestimonialsSection").catch((err) => {
      console.error("Failed to load TestimonialsSection:", err);
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const BigCTA = dynamic(
  () =>
    import("@/components/sections/BigCTA").catch((err) => {
      console.error("Failed to load BigCTA:", err);
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const OpticScrollShowcase = dynamic(
  () =>
    import("@/components/sections/OpticScrollShowcase").catch((err) => {
      console.error("Failed to load OpticScrollShowcase:", err);
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Client-only: relies on window scroll APIs and Framer Motion observers
  }
);

export default function Home() {
  // Prefetch links on hover for faster navigation
  usePrefetch();
  // Prefetch components as user scrolls near them - delayed to avoid blocking navigation
  usePrefetchOnScroll();

  return (
    <>
      {/* Intro video - plays on page load to allow resources to load */}
      <IntroVideo />

      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="relative z-10 bg-black">
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
