"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface NeuralBackgroundProps {
  /** Opacity of the dark overlay (0-1), default 0.7 */
  dimOpacity?: number;
  /** Number of neural nodes */
  nodeCount?: number;
  /** Primary color for glows */
  primaryColor?: string;
  /** Secondary color for accents */
  secondaryColor?: string;
}

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface Connection {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export default function NeuralBackground({
  dimOpacity = 0.7,
  nodeCount = 30,
  primaryColor = "#3b82f6",
  secondaryColor = "#8b5cf6",
}: NeuralBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate nodes
  const nodes: Node[] = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, [nodeCount]);

  // Generate connections between nearby nodes
  const connections: Connection[] = useMemo(() => {
    const conns: Connection[] = [];
    const maxDistance = 25;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance && conns.length < 50) {
          conns.push({
            id: conns.length,
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            delay: Math.random() * 3,
          });
        }
      }
    }
    return conns;
  }, [nodes]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-20 bg-black" />
    );
  }

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          left: "10%",
          top: "20%",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-15"
        style={{
          background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
          right: "10%",
          bottom: "20%",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Neural network visualization */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Connections */}
        {connections.map((conn) => (
          <motion.line
            key={`conn-${conn.id}`}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke={primaryColor}
            strokeWidth="0.5"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              pathLength: [0, 1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: conn.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={`node-${node.id}`}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill={node.id % 3 === 0 ? secondaryColor : primaryColor}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor}20 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}20 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${primaryColor}40, transparent)`,
          boxShadow: `0 0 20px ${primaryColor}40`,
        }}
        animate={{
          top: ["-10%", "110%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Dark overlay for dimming */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: dimOpacity }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}

