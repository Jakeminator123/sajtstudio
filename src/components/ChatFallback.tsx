"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Modal from "@/components/Modal";

/**
 * ChatFallback
 * Visar en snygg fallback-FAB och modal om D-ID-agenten inte laddas.
 * Logik:
 * - Väntar en kort stund efter att sidan blivit interaktiv
 * - Om window.__didStatus !== 'loaded' → visar FAB
 * - Om D-ID lyckas ladda senare → döljer FAB
 */
export default function ChatFallback() {
  const [shouldShowFab, setShouldShowFab] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let hasWaited = false;

    const evaluate = () => {
      const status = window.__didStatus || "pending";
      if (!cancelled) {
        // Hide FAB if D-ID is loaded, show if error or still pending after initial delay
        setShouldShowFab(status !== "loaded" && (status === "error" || (hasWaited && status === "pending")));
      }
    };

    // Check immediately if status is already error
    const status = window.__didStatus || "pending";
    if (status === "error") {
      evaluate();
    }

    // Initial fördröjning – ge D-ID en chans att starta (3 sekunder)
    const t = setTimeout(() => {
      hasWaited = true;
      if (!cancelled) {
        evaluate();
      }
    }, 3000);

    // Polla regelbundet för att uppdatera status (efter initial wait)
    const interval = setInterval(() => {
      if (!cancelled && hasWaited) {
        evaluate();
      }
    }, 2000);

    // Also listen for status changes via custom event (if D-ID sets it)
    const handleStatusChange = () => {
      if (!cancelled) {
        evaluate();
      }
    };
    
    window.addEventListener('did-status-change', handleStatusChange);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener('did-status-change', handleStatusChange);
    };
  }, []);

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {shouldShowFab && (
          <motion.button
            aria-label="Öppna chat-fallback"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 rounded-full px-5 py-4 bg-gradient-to-r from-accent via-blue-600 to-tertiary text-white font-semibold shadow-2xl hover:shadow-accent/50 focus:outline-none"
          >
            Chatta med oss
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="md">
        <div className="bg-white">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Live‑agenten är offline här
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Vår interaktiva AI‑agent är inte tillgänglig på denna domän just
              nu. Men vi hjälper dig gärna – välj ett alternativ nedan.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-4 bg-black text-white font-semibold hover:bg-accent transition-colors"
              >
                Kontakta oss
              </Link>
              <a
                href="mailto:info@sajtstudio.se"
                className="inline-flex items-center justify-center px-6 py-4 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
              >
                Maila oss
              </a>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Tips: På produktionsdomänen visas vår fulla AI‑chatupplevelse.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
