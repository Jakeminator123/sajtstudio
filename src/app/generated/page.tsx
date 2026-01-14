"use client";

import Footer from "@/components/layout/Footer";
import HeaderNav from "@/components/layout/HeaderNav";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function GeneratedPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLight } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/generated/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ogiltigt lösenord");
        setLoading(false);
        return;
      }

      // Redirect to the slug route
      router.push(`/${data.slug}`);
    } catch {
      setError("Något gick fel. Försök igen senare.");
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderNav />
      <main
        className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
          isLight
            ? "bg-gradient-to-br from-[#fef9e7] via-[#fff5e6] to-[#f0f7ff]"
            : "bg-black"
        }`}
      >
        <section className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center">
          {/* Background effects */}
          <div className="absolute inset-0 z-0">
            <div
              className={`absolute inset-0 ${
                isLight ? "bg-[#fef9e7]" : "bg-black"
              }`}
            />
            <div
              className={`absolute inset-0 ${
                isLight
                  ? "bg-gradient-to-b from-[#fef9e7]/40 via-transparent to-[#fff5e6]/50"
                  : "bg-gradient-to-b from-black/20 via-transparent to-black/30"
              }`}
            />
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`backdrop-blur-xl border rounded-3xl p-8 md:p-10 shadow-2xl ${
                isLight
                  ? "bg-white/60 border-amber-200/50 shadow-amber-100/30"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <motion.h1
                className={`text-4xl md:text-5xl font-black mb-4 text-center ${
                  isLight ? "text-gray-800" : "text-white"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-white">
                  Genererad Sida
                </span>
              </motion.h1>

              <motion.p
                className={`text-center mb-8 ${
                  isLight ? "text-gray-600" : "text-white/70"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Ange lösenord för att komma åt din genererade sida
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? "text-gray-700" : "text-white/80"
                    }`}
                  >
                    Lösenord
                  </label>
                  <input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      isLight
                        ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : "bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    }`}
                    placeholder="Ange lösenord"
                    autoFocus
                    autoComplete="off"
                  />
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      isLight
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-red-500/20 border border-red-500/30 text-red-400"
                    }`}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    loading || !password.trim()
                      ? isLight
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                  }`}
                  whileHover={
                    !loading && password.trim() ? { scale: 1.02 } : {}
                  }
                  whileTap={!loading && password.trim() ? { scale: 0.98 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {loading ? "Verifierar..." : "Fortsätt"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
