"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardEntry {
  id: number;
  company_name: string;
  email: string;
  player_name: string | null;
  score: number;
  created_at: string;
}

interface LeaderboardProps {
  currentScore: number;
  showSubmitForm: boolean;
  onScoreSubmitted: () => void;
}

export default function Leaderboard({
  currentScore,
  showSubmitForm,
  onScoreSubmitted,
}: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    player_name: "",
  });

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setScores(data.scores || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          score: currentScore,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        onScoreSubmitted();
        fetchLeaderboard(); // Refresh leaderboard
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const pixelFont = {
    fontFamily: "var(--font-pixel), 'Press Start 2P', monospace",
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Submit Form */}
      <AnimatePresence>
        {showSubmitForm && !submitted && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-black/50 rounded-lg border border-yellow-400/30"
          >
            <h3
              className="text-yellow-400 text-sm mb-4 text-center"
              style={pixelFont}
            >
              SPARA DIN POÄNG!
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Företagsnamn *"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/70 border border-yellow-400/50 rounded text-white text-sm focus:border-yellow-400 focus:outline-none"
                style={pixelFont}
              />
              <input
                type="email"
                placeholder="E-post *"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/70 border border-yellow-400/50 rounded text-white text-sm focus:border-yellow-400 focus:outline-none"
                style={pixelFont}
              />
              <input
                type="text"
                placeholder="Spelarnamn (valfritt)"
                value={formData.player_name}
                onChange={(e) =>
                  setFormData({ ...formData, player_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/70 border border-yellow-400/50 rounded text-white text-sm focus:border-yellow-400 focus:outline-none"
                style={pixelFont}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition disabled:opacity-50"
                style={pixelFont}
              >
                {submitting ? "SPARAR..." : "SPARA"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Submitted confirmation */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-green-500/20 rounded-lg border border-green-500/50 text-center"
        >
          <p className="text-green-400 text-sm" style={pixelFont}>
            ✓ POÄNG SPARAD!
          </p>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="bg-black/50 rounded-lg border border-blue-400/30 overflow-hidden">
        <h3
          className="text-blue-400 text-sm p-3 text-center border-b border-blue-400/30"
          style={pixelFont}
        >
          🏆 TOP 10
        </h3>

        {loading ? (
          <div className="p-4 text-center text-white/50" style={pixelFont}>
            Laddar...
          </div>
        ) : scores.length === 0 ? (
          <div className="p-4 text-center text-white/50" style={pixelFont}>
            Inga poäng än!
          </div>
        ) : (
          <div className="divide-y divide-blue-400/20">
            {scores.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between px-3 py-2 ${
                  index < 3 ? "bg-yellow-400/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm w-6 ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-300"
                        : index === 2
                        ? "text-orange-400"
                        : "text-white/50"
                    }`}
                    style={pixelFont}
                  >
                    {index + 1}.
                  </span>
                  <div>
                    <p
                      className="text-white text-xs truncate max-w-[120px]"
                      style={pixelFont}
                    >
                      {entry.player_name || entry.company_name}
                    </p>
                    <p className="text-white/40 text-[10px]" style={pixelFont}>
                      {entry.company_name}
                    </p>
                  </div>
                </div>
                <span className="text-yellow-400 text-sm" style={pixelFont}>
                  {entry.score}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
