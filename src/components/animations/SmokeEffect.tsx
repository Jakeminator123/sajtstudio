"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SmokeEffectProps {
    count?: number;
    speed?: number;
    opacity?: number;
}

export default function SmokeEffect({
    count = 5,
    speed = 20,
    opacity = 0.15
}: SmokeEffectProps) {
    const smokeParticles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const seed = i * 0.618033988749895; // Golden ratio for distribution
            return {
                id: i,
                startX: (seed * 100) % 100,
                startY: 50 + ((seed * 1.618) * 30) % 30,
                delay: (seed * 10) % 15,
                duration: speed + ((seed * 100) % 5),
                size: 200 + ((seed * 100) % 150),
            };
        });
    }, [count, speed]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {smokeParticles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.startX}%`,
                        top: `${particle.startY}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${opacity * 0.5}) 40%, transparent 70%)`,
                        filter: "blur(40px)",
                    }}
                    initial={{
                        x: -particle.size,
                        y: 0,
                        opacity: 0,
                        scale: 0.8,
                    }}
                    animate={{
                        x: ["-100%", "200%"],
                        y: [-50, 50, -30],
                        opacity: [0, opacity, opacity * 0.7, 0],
                        scale: [0.8, 1.2, 1, 0.6],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 3,
                    }}
                />
            ))}
        </div>
    );
}

