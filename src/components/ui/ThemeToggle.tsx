"use client";

import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden group transition-colors ${
        isDark
          ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-accent/50"
          : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-600/50 hover:border-yellow-500/50"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Byt till ljust läge" : "Byt till mörkt läge"}
      title={isDark ? "Ljust läge" : "Mörkt läge"}
      suppressHydrationWarning
    >
      {/* Sun icon */}
      <motion.svg
        className="w-5 h-5 text-yellow-400 absolute"
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? -90 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </motion.svg>

      {/* Moon icon */}
      <motion.svg
        className="w-5 h-5 text-blue-300 absolute"
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : 90,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </motion.svg>

      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          background: isDark
            ? "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(250, 204, 21, 0.3) 0%, transparent 70%)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
