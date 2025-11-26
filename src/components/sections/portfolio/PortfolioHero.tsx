"use client";

import { motion } from "framer-motion";
import WordReveal from "@/components/animations/WordReveal";
import OptimizedVideo from "@/components/shared/OptimizedVideo";

export default function PortfolioHero() {
  return (
    <section className="relative min-h-[70vh] py-24 overflow-hidden content-visibility-auto bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,51,0.3),transparent_55%)] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black pointer-events-none" />
      <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none text-white">
            <WordReveal text="Portfolio" />
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto">
            Ett exklusivt nedslag i vår visuella storytelling – upplev noir-estetiken i helskärm.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none z-10" />
          <OptimizedVideo
            src="/videos/noir_hero.mp4"
            srcH264="/videos/noir_hero.mp4"
            poster="/images/hero/hero-background.webp"
            alt="Portfolio showcase video"
            className="w-full h-full"
            autoplay
            loop
            muted
            playsInline
          />
        </motion.div>
      </div>
    </section>
  );
}

