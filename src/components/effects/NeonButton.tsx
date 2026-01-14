"use client";

import { motion } from "framer-motion";
import { ReactNode, MouseEvent } from "react";

interface NeonButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "blue" | "purple" | "green" | "red" | "yellow";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function NeonButton({
  children,
  onClick,
  className = "",
  variant = "blue",
  size = "md",
  disabled = false,
  type = "button",
}: NeonButtonProps) {
  const colors = {
    blue: {
      bg: "bg-blue-500/20",
      border: "border-blue-400",
      shadow: "shadow-blue-500/50",
      hover: "hover:bg-blue-500/30",
      glow: "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)",
      text: "text-blue-100",
    },
    purple: {
      bg: "bg-purple-500/20",
      border: "border-purple-400",
      shadow: "shadow-purple-500/50",
      hover: "hover:bg-purple-500/30",
      glow: "0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)",
      text: "text-purple-100",
    },
    green: {
      bg: "bg-green-500/20",
      border: "border-green-400",
      shadow: "shadow-green-500/50",
      hover: "hover:bg-green-500/30",
      glow: "0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)",
      text: "text-green-100",
    },
    red: {
      bg: "bg-red-500/20",
      border: "border-red-400",
      shadow: "shadow-red-500/50",
      hover: "hover:bg-red-500/30",
      glow: "0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)",
      text: "text-red-100",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-400",
      shadow: "shadow-yellow-500/50",
      hover: "hover:bg-yellow-500/30",
      glow: "0 0 20px rgba(234, 179, 8, 0.5), 0 0 40px rgba(234, 179, 8, 0.3)",
      text: "text-yellow-100",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const colorStyle = colors[variant];
  const sizeStyle = sizes[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        ${colorStyle.bg} ${colorStyle.border} ${colorStyle.hover} ${colorStyle.text}
        ${sizeStyle}
        border-2 rounded-xl
        backdrop-blur-sm
        transition-all duration-300
        font-bold uppercase tracking-wider
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      style={{
        boxShadow: disabled ? "none" : colorStyle.glow,
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            `linear-gradient(90deg, transparent, ${
              variant === "blue"
                ? "rgba(59, 130, 246, 0.4)"
                : variant === "purple"
                ? "rgba(168, 85, 247, 0.4)"
                : variant === "green"
                ? "rgba(34, 197, 94, 0.4)"
                : variant === "red"
                ? "rgba(239, 68, 68, 0.4)"
                : "rgba(234, 179, 8, 0.4)"
            }, transparent)`,
          ],
          x: ["-200%", "200%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current" />
    </motion.button>
  );
}
