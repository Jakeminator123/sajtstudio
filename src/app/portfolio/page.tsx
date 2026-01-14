'use client';

import HeaderNav from "@/components/layout/HeaderNav";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const PortfolioHero = dynamic(
  () => import("@/components/sections/portfolio/PortfolioHero"),
  {
    ssr: true,
    loading: () => (
      <section className="relative min-h-[70vh] py-24 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl md:text-7xl font-black mb-6 text-white/50">
            Portfolio
          </div>
          <p className="text-lg md:text-2xl text-white/30">
            Laddar...
          </p>
        </div>
      </section>
    ),
  }
);

const PortfolioGallery = dynamic(
  () => import("@/components/sections/portfolio/PortfolioGallery"),
  {
    loading: () => <div className="min-h-screen" />,
  }
);

const PortfolioShowcase = dynamic(
  () => import("@/components/sections/portfolio/PortfolioShowcase"),
  {
    loading: () => <div className="min-h-screen" />,
  }
);

export default function PortfolioPage() {
  return (
    <>
      <HeaderNav />
      <main className="bg-black text-white min-h-screen">
        <PortfolioHero />
        <PortfolioGallery />
        <PortfolioShowcase />
      </main>
      <Footer />
    </>
  );
}
