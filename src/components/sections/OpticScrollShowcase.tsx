"use client";

import {
  motion,
  motionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import SectionTemplate from "@/templates/SectionTemplate";
import { designTokens } from "@/config/designTokens";
import { prefersReducedMotion } from "@/lib/performance";

const layers = [
  {
    id: "stars",
    className:
      "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_55%)] opacity-60",
  },
  {
    id: "grid",
    className:
      "absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:140px_140px] opacity-70",
  },
  {
    id: "beam",
    className:
      "absolute inset-x-[-40%] top-1/3 h-[40%] bg-gradient-to-b from-transparent via-white/10 to-transparent blur-3xl",
  },
];

const illusions = [
  {
    label: "PARALLAX",
    title: "Djup utan WebGL",
    copy: "Bakgrundslager som rör sig i olika hastigheter ger en optisk illusion av höjd och djup – exakt som i Fantasy’s parallaxscener.",
  },
  {
    label: "ZOOM",
    title: "Scrollstyrd kamera",
    copy: "Skalning kopplad till scroll-position simulerar en kameraåkning. Elementen känns som om de dras mot dig.",
  },
  {
    label: "STICKY",
    title: "Scrollytelling",
    copy: "När innehållet låses fast kan berättelsen byta fokus utan att användaren tappar riktningen – perfekt för case-studier.",
  },
];

const timeline = [
  "Ignition",
  "Parallax drift",
  "Zoom warp",
  "Sticky landing",
];

const fallbackBackground = "/images/hero/hero-background.webp";

export default function OpticScrollShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
    layoutEffect: false,
  });
  const fallbackProgress = useMemo(() => motionValue(0), []);

  const reduceMotion = useMemo(() => prefersReducedMotion(), []);
  const motionSafe = !reduceMotion;
  
  const progress = useMemo(() => {
    // If scrollYProgress is a valid MotionValue (has .get method) use it directly
    if (scrollYProgress && typeof (scrollYProgress as any).get === "function") {
      return scrollYProgress as typeof fallbackProgress;
    }
    // If we get a plain number (happens on first server render) mirror it into fallback MotionValue
    if (typeof scrollYProgress === "number") {
      fallbackProgress.set(scrollYProgress);
    }
    return fallbackProgress;
  }, [scrollYProgress, fallbackProgress]);

  const parallaxBackY = useTransform(
    progress,
    [0, 1],
    motionSafe ? ["0%", "-40%"] : ["0%", "0%"]
  );
  const parallaxMidY = useTransform(
    progress,
    [0, 1],
    motionSafe ? ["0%", "-20%"] : ["0%", "0%"]
  );
  const parallaxFrontY = useTransform(
    progress,
    [0, 1],
    motionSafe ? ["0%", "20%"] : ["0%", "0%"]
  );
  const starOpacity = useTransform(progress, [0, 0.5, 1], [0.2, 0.6, 1]);

  // Halo - subtil och naturlig expansion
  const haloScale = useTransform(
    progress,
    motionSafe ? [0, 0.3, 0.6, 1] : [0, 1],
    motionSafe ? [0.8, 1.0, 1.15, 1.25] : [1, 1]
  );
  const haloOpacity = useTransform(
    progress,
    motionSafe ? [0, 0.2, 0.5, 0.8, 1] : [0, 1],
    motionSafe ? [0.3, 0.6, 0.7, 0.65, 0.55] : [0.6, 0.6]
  );
  
  // Viewport - mjukare zoom och rotation
  const viewportScale = useTransform(
    progress,
    motionSafe ? [0, 0.3, 0.6, 0.85, 1] : [0, 1],
    motionSafe ? [0.8, 1.0, 1.2, 1.4, 1.6] : [1, 1]
  );
  const viewportRotate = useTransform(
    progress,
    [0, 0.5, 1],
    motionSafe ? [-3, 0, 4] : [0, 0, 0]
  );
  const viewportY = useTransform(
    progress,
    [0, 0.5, 1],
    motionSafe ? ["8%", "0%", "-6%"] : ["0%", "0%", "0%"]
  );
  // Fade the white overlay faster so it doesn’t stay bright for long
  const overlayOpacity = useTransform(
    progress,
    motionSafe ? [0, 0.25, 0.45, 0.7, 1] : [0, 1],
    motionSafe ? [0, 0.08, 0.2, 0.3, 0.3] : [0.15, 0.15]
  );

  // Text - tydlig och skarp när den ska läsas (ingen blur)
  const copyY = useTransform(progress, [0, 0.25], [50, 0]);
  const copyOpacity = useTransform(
    progress, 
    [0, 0.1, 0.25, 0.95, 1], 
    [0, 0.4, 1, 1, 0.85]
  );

  // Convert motion values to regular values for style prop
  // All state must be declared BEFORE any hooks that use them
  const [copyYValue, setCopyYValue] = useState(50);
  const [copyOpacityValue, setCopyOpacityValue] = useState(0);
  const [parallaxProgress, setParallaxProgress] = useState(0);
  const [status, setStatus] = useState("Ignition");
  const [percent, setPercent] = useState(0);
  
  const statusRef = useRef(status);
  const percentRef = useRef(percent);
  const accent = designTokens.colors.accent.DEFAULT;
  const tertiary = designTokens.colors.tertiary.DEFAULT;
  const white = designTokens.colors.primary.white;

  // Hooks that use state - must come AFTER state declarations
  useMotionValueEvent(copyY, "change", setCopyYValue);
  useMotionValueEvent(copyOpacity, "change", setCopyOpacityValue);
  useMotionValueEvent(progress, "change", (latest) => {
    if (!motionSafe) {
      setParallaxProgress(latest);
    }
  });

  const timelineScale = useTransform(progress, [0, 1], [0.05, 1]);

  // Subscribe to scrollYProgress changes manually
  useEffect(() => {
    // Ensure scrollYProgress exists before subscribing
    if (!scrollYProgress) return;
    
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const nextPercent = Math.round(latest * 100);
      if (nextPercent !== percentRef.current) {
        percentRef.current = nextPercent;
        setPercent(nextPercent);
      }

      const nextStatus =
        latest < 0.33 ? "Ignition" : latest < 0.66 ? "Warp" : "Landing";
      if (nextStatus !== statusRef.current) {
        statusRef.current = nextStatus;
        setStatus(nextStatus);
      }
    });
    
    return unsubscribe;
  }, [scrollYProgress]);

  // Create parallax transforms for each card - hooks must be called unconditionally
  // Use array form instead of function form to avoid .to() issues
  // Always create the same transforms - reduced motion handled via CSS prefers-reduced-motion
  // Increased values for more visible parallax effect
  const cardParallax0 = useTransform(progress, [0, 1], motionSafe ? [30, -10] : [0, 0]);
  const cardParallax1 = useTransform(progress, [0, 1], motionSafe ? [50, -20] : [0, 0]);
  const cardParallax2 = useTransform(progress, [0, 1], motionSafe ? [70, -30] : [0, 0]);

  /* ---------- Exploding image transforms ------------- */
  const explodeStart = 0.35;
  const explodeEnd = 0.5;

  // Two images fly upward-left / upward-right, one towards viewer
  const img1X = useTransform(progress, [explodeStart, explodeEnd], [0, -250]);
  const img1Y = useTransform(progress, [explodeStart, explodeEnd], [0, -350]);
  const img1Rot = useTransform(progress, [explodeStart, explodeEnd], [0, -45]);
  const img1Opacity = useTransform(progress, [explodeStart, explodeEnd, 0.7], [1, 1, 0]);

  const img2X = useTransform(progress, [explodeStart, explodeEnd], [0, 250]);
  const img2Y = useTransform(progress, [explodeStart, explodeEnd], [0, -350]);
  const img2Rot = useTransform(progress, [explodeStart, explodeEnd], [0, 45]);
  const img2Opacity = useTransform(progress, [explodeStart, explodeEnd, 0.7], [1, 1, 0]);

  const img3Scale = useTransform(progress, [explodeStart, explodeEnd], [1, 3]);
  const img3Opacity = useTransform(progress, [explodeStart, explodeEnd, 0.6], [1, 0.5, 0]);

  return (
    <SectionTemplate
      background="black"
      padding="3xl"
      animate={false}
      className="relative overflow-hidden"
    >
      <div
        ref={sectionRef}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-b from-[#040404] via-black to-[#050505] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 min-h-[120vh]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={mounted ? {
              opacity: typeof starOpacity === 'number' ? starOpacity : (starOpacity?.get?.() ?? 0.2),
              backgroundImage: `radial-gradient(circle at 70% 0%, ${accent}66, transparent 50%)`,
            } : {
              opacity: 0.2,
              backgroundImage: `radial-gradient(circle at 70% 0%, ${accent}66, transparent 50%)`,
            }}
            suppressHydrationWarning
          />
          <motion.div
            className="absolute inset-0"
            style={mounted ? { y: parallaxBackY } : { y: 0 }}
            suppressHydrationWarning
          >
            <div className={layers[0].className} />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            style={mounted ? { y: parallaxMidY } : { y: 0 }}
            suppressHydrationWarning
          >
            <div className={layers[1].className} />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            style={mounted ? { y: parallaxFrontY } : { y: 0 }}
            suppressHydrationWarning
          >
            <div className={layers[2].className} />
          </motion.div>

          {!motionSafe && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[40px] bg-center bg-cover opacity-30 mix-blend-screen"
              style={{
                backgroundImage: `url('${fallbackBackground}')`,
                backgroundAttachment: "fixed",
              }}
              animate={{ y: parallaxProgress * -40 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
        </div>

        <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
          <motion.div style={{ y: copyYValue, opacity: copyOpacityValue }} suppressHydrationWarning>
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">
              Optiska experiment
            </p>
            <h2 className="mt-6 text-4xl md:text-5xl font-black leading-tight">
              Scroll Illusions Lab
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-xl">
              En hyllning till Fantasy-stilen: parallaxlager, zoom-effekter och
              sticky storytelling sammanfogas till en scrollytelling-modul som
              visar hur vi bygger visuella illusioner.
            </p>

            <div className="mt-10 space-y-6">
              {illusions.map((item, index) => {
                const parallaxY = index === 0 ? cardParallax0 : index === 1 ? cardParallax1 : cardParallax2;
                return (
                <motion.div
                  key={item.label}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
                  style={mounted ? { y: parallaxY } : { y: 0 }}
                  suppressHydrationWarning
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50">
                    <span>{item.label}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">
                    {item.copy}
                  </p>
                </motion.div>
                );
              })}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-white/50">
              {timeline.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 px-4 py-2"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="w-full lg:sticky lg:top-24">
            <motion.div className="relative aspect-[4/3] overflow-visible">
              <motion.div
                className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-transparent via-white/8 to-transparent blur-[80px]"
                style={mounted ? { 
                  scale: typeof haloScale === 'number' ? haloScale : (haloScale?.get?.() ?? 1),
                  opacity: typeof haloOpacity === 'number' ? haloOpacity : (haloOpacity?.get?.() ?? 0.3)
                } : { scale: 1, opacity: 0.3 }}
                suppressHydrationWarning
              />

              <motion.div
                className="relative h-full rounded-[40px] border border-white/10 bg-black/60 shadow-[0_40px_140px_rgba(0,0,0,0.6)] overflow-hidden"
                style={mounted ? {
                  scale: viewportScale,
                  rotate: viewportRotate,
                  y: viewportY,
                } : {
                  scale: 1,
                  rotate: 0,
                  y: 0,
                }}
                suppressHydrationWarning
              >
                <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                  <motion.div
                    className="absolute inset-0"
                    style={mounted ? {
                      backgroundImage: `radial-gradient(circle at 30% 30%, ${accent}40, transparent 70%)`,
                      opacity: typeof haloOpacity === 'number' ? haloOpacity : (haloOpacity?.get?.() ?? 0.3),
                    } : {
                      backgroundImage: `radial-gradient(circle at 30% 30%, ${accent}40, transparent 70%)`,
                      opacity: 0.3,
                    }}
                    suppressHydrationWarning
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={mounted ? {
                      backgroundImage: `radial-gradient(circle at 80% 60%, ${tertiary}25, transparent 60%)`,
                      opacity: typeof haloOpacity === 'number' ? haloOpacity : (haloOpacity?.get?.() ?? 0.3),
                    } : {
                      backgroundImage: `radial-gradient(circle at 80% 60%, ${tertiary}25, transparent 60%)`,
                      opacity: 0.3,
                    }}
                    suppressHydrationWarning
                  />
                </div>
                <video
                  className="h-full w-full object-cover opacity-90"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src="/videos/telephone_ringin.mp4"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"
                  style={mounted ? { 
                    opacity: typeof overlayOpacity === 'number' ? overlayOpacity : (overlayOpacity?.get?.() ?? 0)
                  } : { opacity: 0 }}
                  suppressHydrationWarning
                />

                {/* Exploding thumbnails */}
                <motion.div className="absolute inset-0 pointer-events-none perspective-[800px]">
                  <motion.div
                    className="absolute left-1/3 top-1/3 w-40 h-24"
                    style={mounted ? { x: img1X, y: img1Y, rotateZ: img1Rot, opacity: img1Opacity } : { x: 0, y: 0, rotateZ: 0, opacity: 1 }}
                    suppressHydrationWarning
                  >
                    <Image 
                      src="/images/portfolio/assets_task_01k05sqa0wedsbvfk5c0773fz5_1752541456_img_0.webp" 
                      alt="" 
                      fill 
                      sizes="(max-width: 640px) 160px, 160px"
                      className="object-cover rounded-lg shadow-lg" 
                    />
                  </motion.div>
                  <motion.div
                    className="absolute right-1/3 top-1/3 w-40 h-24"
                    style={mounted ? { x: img2X, y: img2Y, rotateZ: img2Rot, opacity: img2Opacity } : { x: 0, y: 0, rotateZ: 0, opacity: 1 }}
                    suppressHydrationWarning
                  >
                    <Image 
                      src="/images/portfolio/assets_task_01k1c880wqft0s0bcr3p77v2me_1753831780_img_0.webp" 
                      alt="" 
                      fill 
                      sizes="(max-width: 640px) 160px, 160px"
                      className="object-cover rounded-lg shadow-lg" 
                    />
                  </motion.div>
                  <motion.div
                    className="absolute left-1/2 top-1/2 w-32 h-20"
                    style={mounted ? { translateX: "-50%", translateY: "-50%", scale: img3Scale, opacity: img3Opacity, rotateX: 35 } : { translateX: "-50%", translateY: "-50%", scale: 1, opacity: 1, rotateX: 35 }}
                    suppressHydrationWarning
                  >
                    <Image 
                      src="/images/portfolio/assets_task_01k80qdg0ze1rskjzfpj7r1za3_1760961264_img_0.webp" 
                      alt="" 
                      fill 
                      sizes="(max-width: 640px) 128px, 128px"
                      className="object-cover rounded-lg shadow-lg" 
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-end justify-between p-6">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.5em] text-white/50">
                    Status
                  </p>
                  <p className="text-2xl font-semibold text-white">{status}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="relative h-32 w-px bg-white/15 overflow-hidden">
                    <motion.div
                      className="absolute inset-x-0 top-0 w-px"
                      style={mounted ? {
                        scaleY: typeof timelineScale === 'number' ? timelineScale : (timelineScale?.get?.() ?? 0.05),
                        originY: 0,
                        backgroundImage: `linear-gradient(to bottom, ${accent}, ${white}, ${tertiary})`,
                      } : {
                        scaleY: 0.05,
                        originY: 0,
                        backgroundImage: `linear-gradient(to bottom, ${accent}, ${white}, ${tertiary})`,
                      }}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Scroll
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {percent.toString().padStart(2, "0")}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SectionTemplate>
  );
}


