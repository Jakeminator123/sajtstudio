"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}

export default function TypewriterText({
  texts,
  className = "",
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [
    displayText,
    currentTextIndex,
    isDeleting,
    texts,
    speed,
    deleteSpeed,
    pauseTime,
  ]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block ml-1"
      >
        |
      </motion.span>
    </span>
  );
}
