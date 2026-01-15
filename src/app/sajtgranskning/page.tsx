'use client'

import Footer from '@/components/layout/Footer'
import HeaderNav from '@/components/layout/HeaderNav'
import { motion } from 'framer-motion'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SajtgranskningPage() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Redirect to utvardera page with audit mode and URL
    router.push(`/utvardera?mode=audit&url=${encodeURIComponent(normalizedUrl)}`)
  }

  return (
    <>
      <HeaderNav />
      <main className="bg-black text-white min-h-screen">
        <section className="min-h-screen py-24 md:py-32 flex items-center justify-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Sajtgranskning</h1>
              <p className="text-xl text-gray-400 max-w-xl mx-auto">
                Ange en hemsideadress för att börja granskningen
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 transition-all"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-accent text-white font-bold text-lg rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Starta granskning
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
