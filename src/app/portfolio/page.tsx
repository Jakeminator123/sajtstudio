"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import WordReveal from "@/components/WordReveal";

export default function PortfolioPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // autoplay kan blockeras av webbläsare – användaren kan starta manuellt
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  return (
    <>
      <HeaderNav />
      <main className="pt-24 bg-black text-white">
        <section className="relative min-h-[70vh] py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,51,0.3),transparent_55%)] opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black pointer-events-none" />
          <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none">
                <WordReveal text="Portfolio" />
              </h1>
              <p className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto">
                Ett exklusivt nedslag i vår visuella storytelling – upplev noir-estetiken i helskärm.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none z-10" />
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src="/videos/noir_hero.mp4"
                poster="/images/hero/alt_background.webp"
                playsInline
                muted
                loop
                controls
              >
                Din webbläsare stödjer inte video-taggen.
              </video>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
