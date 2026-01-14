"use client";

import Footer from "@/components/layout/Footer";
import HeaderNav from "@/components/layout/HeaderNav";
import HeroSection from "@/components/sections/HeroSection";
import dynamic from "next/dynamic";

// Critical components loaded immediately for smooth scrolling
import ScrollIndicator from "@/components/animations/ScrollIndicator";
// Only load USPSection immediately - others can be lazy loaded for better LCP
import USPSection from "@/components/sections/USPSection";
// Defer heavy components that appear later - lazy load for better LCP

import { SectionSkeleton } from "@/components/ui/Skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import { usePrefetchOnScroll } from "@/hooks/usePrefetchOnScroll";
import { useTheme } from "@/hooks/useTheme";
import IntroVideo from "@/components/animations/IntroVideo";

// Lazy load sections that appear later - prefetched via usePrefetchOnScroll for smooth scrolling
// Using explicit error handling to prevent webpack module loading issues

const AboutSection = dynamic(
  () =>
    import("@/components/sections/AboutSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Defer loading for better LCP
  }
);

const ServicesSection = dynamic(
  () =>
    import("@/components/sections/ServicesSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Defer loading for better LCP
  }
);

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

const AboutUsVideoSection = dynamic(
  () =>
    import("@/components/sections/AboutUsVideoSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Prevent hydration mismatch
  }
);

const HeroAnimation = dynamic(
  () =>
    import("@/components/sections/HeroAnimation").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Heavy component with video - defer loading
  }
);

const TechShowcaseSection = dynamic(
  () =>
    import("@/components/sections/TechShowcaseSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Heavy component with Pacman game - defer loading
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

const TeamSection = dynamic(
  () =>
    import("@/components/sections/TeamSection").catch(() => {
      return { default: () => <SectionSkeleton /> };
    }),
  {
    loading: () => <SectionSkeleton />,
    ssr: false, // Client-only: uses Framer Motion transforms
  }
);

export default function Home() {
  const enablePrefetch =
    process.env.NEXT_PUBLIC_ENABLE_PREFETCH === "true";
  // Prefetch links/resources is great for UX, but it can hurt Lighthouse by adding extra work during audits.
  // Default: disabled unless explicitly enabled.
  usePrefetch(enablePrefetch);
  usePrefetchOnScroll(enablePrefetch);
  const { isLight } = useTheme();
  const enableIntroVideo = process.env.NEXT_PUBLIC_ENABLE_INTRO_VIDEO === "true";

  return (
    <>
      {/* Intro video - plays on page load to allow resources to load */}
      {enableIntroVideo && <IntroVideo />}

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

        {/* Portfolio animation - lazy loaded for better LCP */}
        <div
          id="portfolio"
          className="content-visibility-auto-lg"
          style={{ scrollMarginTop: "calc(var(--header-height, 80px) + 16px)" }}
        >
          <HeroAnimation />
        </div>
        {/* Tech vs Design showcase - lazy loaded for better LCP */}
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

        {/* About Us Video Section */}
        <div className="content-visibility-auto">
          <AboutUsVideoSection />
        </div>

        {/* Team Section - About the founders */}
        <div id="teamet" className="content-visibility-auto">
          <TeamSection />
        </div>

        {/* Big CTA - Fantasy style */}
        <div
          id="kontakt"
          className="content-visibility-auto-lg"
          style={{ scrollMarginTop: "calc(var(--header-height, 80px) + 16px)" }}
        >
          <BigCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
