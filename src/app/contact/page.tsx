'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HeaderNav from '@/components/HeaderNav';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Use requestAnimationFrame for smoother updates and less DOM work
    let rafId: number;
    let lastUpdate = Date.now();
    
    const updateTime = () => {
      const now = Date.now();
      // Only update DOM if a full second has passed
      if (now - lastUpdate >= 1000) {
        setTime(new Date());
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(updateTime);
    };
    
    rafId = requestAnimationFrame(updateTime);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="text-6xl md:text-8xl font-bold mb-4 font-mono text-white">
        {hours}:{minutes}
        <span className="text-4xl md:text-6xl text-gray-400">:{seconds}</span>
      </div>
      <p className="text-gray-400">Stockholm, Sverige</p>
    </motion.div>
  );
}

export default function ContactPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Set playback rate to 0.125 (8x slower) when video loads
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.125; // 1/8 speed = 8x slower
    }
  }, []);

  return (
    <>
      <HeaderNav />
      <main className="relative min-h-screen bg-black">
        {/* Hero section with noir video background - 50% coverage */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video background - covers 50% of screen */}
          <div className="absolute inset-0 w-1/2 left-0 h-full overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: 'grayscale(100%) contrast(1.2)',
              }}
            >
              <source src="/videos/noir_hero.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for noir effect */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Black background for other 50% */}
          <div className="absolute inset-0 w-1/2 right-0 h-full bg-black" />

          {/* Content overlay */}
          <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white">
                Kontakt
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                Låt oss prata om ditt nästa projekt
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact form section */}
        <section className="relative py-24 md:py-32 bg-black">
          <div className="container mx-auto px-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Left side - Contact info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Kontaktinformation</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">E-post</p>
                      <a 
                        href="mailto:hello@sajtstudio.se" 
                        className="text-lg md:text-xl text-white hover:text-accent transition-colors"
                      >
                        hello@sajtstudio.se
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Telefon</p>
                      <a 
                        href="tel:+46701234567" 
                        className="text-lg md:text-xl text-white hover:text-accent transition-colors"
                      >
                        +46 70 123 45 67
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800">
                  <Clock />
                </div>
              </motion.div>

              {/* Right side - Contact form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-8 md:p-10 rounded-lg"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Skicka meddelande</h2>
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

