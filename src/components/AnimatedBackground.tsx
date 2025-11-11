"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="animated-gif-background w-full h-full relative opacity-[0.15]">
        <Image
          src="/images/hero/hero-animation.gif"
          alt=""
          fill
          className="object-cover"
          unoptimized
          priority={false}
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>
    </div>
  );
}
