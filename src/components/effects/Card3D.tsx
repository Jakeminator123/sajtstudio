"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function Card3D({
  children,
  className = "",
  intensity = 10,
}: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${intensity}deg`, `-${intensity}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${intensity}deg`, `${intensity}deg`]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.5), transparent 50%)",
        }}
        animate={{
          opacity: x.get() !== 0 || y.get() !== 0 ? 0.3 : 0,
        }}
      />
    </motion.div>
  );
}
