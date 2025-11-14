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

export default function StartaProjektPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set playback rate to 0.125 (8x slower) when video loads
    const handleVideoLoad = () => {
      if (videoRef.current) {
        videoRef.current.playbackRate = 0.125; // 1/8 speed = 8x slower
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', handleVideoLoad);
      // Also try setting it immediately
      if (videoRef.current.readyState >= 1) {
        videoRef.current.playbackRate = 0.125;
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleVideoLoad);
      }
    };
  }, []);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAudit(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunde inte generera audit');
      }

      setAudit(data.audit);
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

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
              preload="auto"
              className="w-full h-full object-cover"
              style={{
                filter: 'grayscale(100%) contrast(1.2)',
              }}
            >
              <source src="/videos/noir_hero.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Dark overlay for noir effect - reduced opacity for better visibility */}
            <div className="absolute inset-0 bg-black/20" />
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
                Starta projekt
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
                Låt oss prata om ditt nästa projekt
              </p>

              {/* Site Audit Form */}
              <motion.form
                onSubmit={handleAudit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Ange din webbplats URL (t.ex. sajtstudio.se)"
                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-accent to-tertiary text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analyserar...' : 'Få gratis audit'}
                  </motion.button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.form>
            </motion.div>
          </div>
        </section>

        {/* Audit Results Section */}
        {audit && (
          <section className="relative py-24 md:py-32 bg-black border-t border-gray-800">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-4xl md:text-5xl font-black mb-8 text-white text-center">
                  Din webbplats-analys
                </h2>

                {/* Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                  {Object.entries(audit.audit_scores || {}).map(([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-lg"
                    >
                      <p className="text-gray-400 text-sm mb-2 uppercase">{key.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold text-white">{value}/10</p>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                {audit.strengths && audit.strengths.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Styrkor</h3>
                    <ul className="space-y-2">
                      {audit.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-gray-300 flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {audit.issues && audit.issues.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Förbättringsområden</h3>
                    <ul className="space-y-2">
                      {audit.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-gray-300 flex items-start">
                          <span className="text-yellow-400 mr-2">⚠</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Wins */}
                {audit.improvements?.quick_wins && audit.improvements.quick_wins.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Snabbvinstar</h3>
                    <div className="space-y-4">
                      {audit.improvements.quick_wins.map((win: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-lg"
                        >
                          <h4 className="text-xl font-bold text-white mb-2">{win.item}</h4>
                          <p className="text-gray-300 mb-2">{win.why}</p>
                          <p className="text-gray-400 text-sm">
                            <span className="text-accent">Impact:</span> {win.impact} |{' '}
                            <span className="text-accent">Effort:</span> {win.effort}
                          </p>
                          {win.how && (
                            <p className="text-gray-300 mt-2 text-sm">
                              <span className="text-accent">Hur:</span> {win.how}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pitch */}
                {audit.pitch && (
                  <div className="bg-gradient-to-r from-accent/20 to-tertiary/20 border border-accent/30 p-8 rounded-lg">
                    <h3 className="text-2xl font-bold text-white mb-4">{audit.pitch.headline}</h3>
                    {audit.pitch.summary && (
                      <p className="text-gray-300 mb-4">{audit.pitch.summary}</p>
                    )}
                    {audit.pitch.next_steps && audit.pitch.next_steps.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Nästa steg:</h4>
                        <ul className="space-y-1">
                          {audit.pitch.next_steps.map((step: string, idx: number) => (
                            <li key={idx} className="text-gray-300">• {step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

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
