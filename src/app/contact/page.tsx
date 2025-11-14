'use client';

import { useState, useEffect } from 'react';
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
      <div className="text-6xl md:text-8xl font-bold mb-4 font-mono">
        {hours}:{minutes}
        <span className="text-4xl md:text-6xl text-gray-400">:{seconds}</span>
      </div>
      <p className="text-gray-600">Stockholm, Sverige</p>
    </motion.div>
  );
}

export default function ContactPage() {
  return (
    <>
      <HeaderNav />
      <main style={{ paddingTop: 'var(--header-height)' }}>
        <section className="py-24 md:py-32 bg-white" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Kontakt
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Låt oss prata om ditt nästa projekt
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Left side - Contact info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4">Kontaktinformation</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">E-post</p>
                      <a 
                        href="mailto:hello@sajtstudio.se" 
                        className="text-lg hover:text-accent transition-colors"
                      >
                        hello@sajtstudio.se
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <a 
                        href="tel:+46701234567" 
                        className="text-lg hover:text-accent transition-colors"
                      >
                        +46 70 123 45 67
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <Clock />
                </div>
              </motion.div>

              {/* Right side - Contact form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-gray-50 p-8 rounded-lg"
              >
                <h2 className="text-2xl font-bold mb-6">Skicka meddelande</h2>
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

