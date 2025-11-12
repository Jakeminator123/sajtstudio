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

export default function Home() {
  // Prefetch links on hover for faster navigation
  usePrefetch();

  return (
    <>
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="relative z-10">
        {/* Hero with rain, lightning, and text animations */}
        <HeroSection />

        {/* Scroll indicator - fades out on scroll */}
        <ScrollIndicator />

        {/* About section with word reveal */}
        <div id="om-oss">
          <AboutSection />
        </div>

        {/* USP Section - Numrerade punkter som beskriver företaget */}
        <USPSection />

        {/* Services with modals */}
        <div id="tjanster">
          <ServicesSection />
        </div>

        {/* Portfolio animation - behåll nuvarande explosion */}
        <HeroAnimation />

        {/* Process steps */}
        <div id="process">
          <ProcessSection />
        </div>

        {/* Testimonials */}
        <div id="omdomen">
          <TestimonialsSection />
        </div>

        {/* Big CTA - Fantasy style */}
        <BigCTA />
      </main>
      <Footer />
    </>
  );
}
