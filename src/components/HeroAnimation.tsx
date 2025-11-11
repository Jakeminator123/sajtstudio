'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroAnimation() {
  return (
    <section className="py-32 md:py-48 bg-gradient-to-b from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background with multiple images */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,102,255,0.4),transparent_60%)]" />
        <Image
          src="/images/hero/future_whoman.webp"
          alt=""
          fill
          className="object-cover opacity-20 mix-blend-overlay"
          loading="lazy"
          unoptimized
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-hero md:text-display font-black mb-8 leading-[0.9]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Våra hemsidor i aktion
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Se exempel på vad vi kan skapa
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto rounded-lg overflow-hidden shadow-2xl border-2 border-accent/20"
        >
          <Image
            src="/images/hero/gif_of_sites_maybee_hero_pic.gif"
            alt="Hemsidor i aktion"
            width={1200}
            height={675}
            className="w-full h-auto"
            loading="lazy"
            unoptimized
          />
        </motion.div>
        
        {/* Additional images grid below - lazy loaded */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-6xl mx-auto"
        >
          {[
            '/images/hero/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
            '/images/hero/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
            '/images/hero/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
            '/images/hero/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
          ].map((src, index) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative aspect-square overflow-hidden rounded-lg border border-accent/20"
            >
              <Image
                src={src}
                alt={`Portfolio exempel ${index + 1}`}
                fill
                className="object-cover"
                loading="lazy"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

