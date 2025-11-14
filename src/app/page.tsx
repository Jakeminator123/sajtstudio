"use client";

import HeaderNav from "@/components/HeaderNav";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Critical components loaded immediately
import HeroAnimation from "@/components/HeroAnimation";
import ScrollIndicator from "@/components/ScrollIndicator";

import { SectionSkeleton } from "@/components/Skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";

// Lazy load non-critical sections for better performance
const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  loading: () => <SectionSkeleton />,
});

const USPSection = dynamic(() => import("@/components/USPSection"), {
  loading: () => <SectionSkeleton />,
});

const ServicesSection = dynamic(() => import("@/components/ServicesSection"), {
  loading: () => <SectionSkeleton />,
});

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

const TechShowcaseSection = dynamic(
  () => import("@/components/TechShowcaseSection"),
  {
    loading: () => <div className="min-h-screen bg-white" />,
    ssr: false,
  }
);

export default function Home() {
  // Prefetch links on hover for faster navigation
  usePrefetch();

  return (
    <>
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="relative z-10 pt-[var(--header-height)]">
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
        <div className="content-visibility-auto">
          <HeroAnimation />
          {/* Tech vs Design showcase - interactive Pacman demo */}
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
