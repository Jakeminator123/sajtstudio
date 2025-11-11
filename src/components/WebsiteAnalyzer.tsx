"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SEARCHES_PER_DAY = 3;

interface WebsiteAnalysis {
  message?: string;
  [key: string]: unknown; // Allow for future expansion
}

interface AnalysisState {
  status: "idle" | "analyzing" | "success" | "error" | "rateLimited";
  searchesRemaining?: number;
  searchesUsed?: number;
  resetAt?: string;
  error?: string;
  analysis?: WebsiteAnalysis;
}

export default function WebsiteAnalyzer() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<AnalysisState>({ status: "idle" });

  // Hämta nuvarande status vid mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/analyze-website", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.searchesRemaining !== undefined) {
            setState({
              status: "idle",
              searchesRemaining: data.searchesRemaining,
              searchesUsed: data.searchesUsed,
              resetAt: data.resetAt,
            });
          }
        }
      } catch (error) {
        // Ignorera fel vid hämtning av status - använd default värden
        console.debug("Could not fetch initial status:", error);
      }
    };

    fetchStatus();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    setState({ status: "analyzing" });

    try {
      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "Ett fel uppstod" };
        }

        if (response.status === 429) {
          // Rate limited
          setState({
            status: "rateLimited",
            error: errorData.error,
            resetAt: errorData.resetAt,
            searchesRemaining: 0,
            searchesUsed: MAX_SEARCHES_PER_DAY,
          });
        } else {
          setState({
            status: "error",
            error: errorData.error || "Ett fel uppstod",
          });
        }
        return;
      }

      const data = await response.json();

      // Success
      setState({
        status: "success",
        searchesRemaining: data.searchesRemaining,
        searchesUsed: data.searchesUsed,
        resetAt: data.resetAt,
        analysis: data.analysis,
      });

      // Återställ URL efter lyckad analys
      setTimeout(() => {
        setUrl("");
        setState((prev) => ({
          ...prev,
          status: "idle",
        }));
      }, 5000);
    } catch (error) {
      // Only log errors in development, and only if it's not a network error
      // Note: In client-side code, we can't use process.env.NODE_ENV directly
      // So we'll just silently handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        // Silently handle network errors
      } else if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        // Only log in development (localhost)
        console.error("Fetch error:", error);
      }
      setState({
        status: "error",
        error:
          "Kunde inte ansluta till servern. Kontrollera din internetanslutning.",
      });
    }
  };

  const searchesRemaining = state.searchesRemaining ?? MAX_SEARCHES_PER_DAY;
  const searchesUsed = state.searchesUsed ?? 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 md:p-12 border border-gray-200 relative overflow-hidden"
      >
        {/* Subtle background video */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/noir_hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Blue gradient accent */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/5 to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <motion.h2
            className="text-h2 md:text-hero font-black mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Analysera din hemsida
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Få en snabb analys av din hemsida. Du har {searchesRemaining} av{" "}
            {MAX_SEARCHES_PER_DAY} sökningar kvar idag.
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Använda sökningar</span>
              <span>
                {searchesUsed} / {MAX_SEARCHES_PER_DAY}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent/60"
                initial={{ width: 0 }}
                animate={{
                  width: `${(searchesUsed / MAX_SEARCHES_PER_DAY) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="website-url"
                className="block text-sm font-semibold mb-2 text-gray-700"
              >
                Hemsideadress
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="website-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-4 border-2 border-gray-300 focus:border-accent focus:outline-none transition-colors text-lg"
                  required
                  disabled={state.status === "analyzing"}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Success message */}
              {state.status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-lg"
                >
                  <p className="font-semibold mb-1">Analys påbörjad!</p>
                  <p className="text-sm">
                    Din analys kommer snart att visas här. Du har{" "}
                    {state.searchesRemaining} sökningar kvar idag.
                  </p>
                </motion.div>
              )}

              {/* Rate limited message */}
              {state.status === "rateLimited" && (
                <motion.div
                  key="rateLimited"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-lg"
                >
                  <p className="font-semibold mb-1">Daglig gräns nådd</p>
                  <p className="text-sm">
                    Du har använt alla {MAX_SEARCHES_PER_DAY} sökningar för
                    idag. Kom tillbaka imorgon för att fortsätta.
                  </p>
                </motion.div>
              )}

              {/* Error message */}
              {state.status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-lg"
                >
                  <p className="font-semibold mb-1">Fel uppstod</p>
                  <p className="text-sm">
                    {state.error || "Försök igen senare"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={
                state.status === "analyzing" ||
                searchesRemaining === 0 ||
                !url.trim()
              }
              whileHover={
                state.status !== "analyzing" && searchesRemaining > 0
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                state.status !== "analyzing" && searchesRemaining > 0
                  ? { scale: 0.98 }
                  : {}
              }
              className="w-full px-8 py-4 bg-black text-white font-semibold hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group shadow-lg"
            >
              {/* Shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">
                {state.status === "analyzing"
                  ? "Analyserar..."
                  : searchesRemaining === 0
                  ? "Inga sökningar kvar"
                  : "Analysera hemsida"}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
