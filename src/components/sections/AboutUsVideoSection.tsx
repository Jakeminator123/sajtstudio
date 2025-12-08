"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

// Parse SRT format subtitles
interface Subtitle {
  id: number;
  start: number;
  end: number;
  text: string;
}

const subtitlesData: Subtitle[] = [
  { id: 0, start: 0.079, end: 0.389, text: "Hej." },
  { id: 1, start: 0.839, end: 1.84, text: "Vi är sajtstudio," },
  {
    id: 2,
    start: 1.96,
    end: 3.64,
    text: "tre personer som brinner för design.",
  },
  { id: 3, start: 3.96, end: 5.659, text: "AI och riktigt vassa hemsidor." },
  {
    id: 4,
    start: 6.119,
    end: 9.56,
    text: "Vi hjälper företag som vill ha mer än bara en snygg digital fasad.",
  },
  { id: 5, start: 10.039, end: 11.84, text: "Din hemsida ska generera leads," },
  {
    id: 6,
    start: 12.159,
    end: 14.199,
    text: "kunder och förtroende och den ska vara byggd",
  },
  {
    id: 7,
    start: 14.199,
    end: 16.43,
    text: "för hur webben fungerar idag och imorgon.",
  },
  { id: 8, start: 16.879, end: 18.36, text: "Vår grej är att märja design," },
  { id: 9, start: 18.6, end: 19.549, text: "AI och teknik." },
  {
    id: 10,
    start: 20.049,
    end: 22.18,
    text: "Vi använder AI för att förstå din bransch,",
  },
  {
    id: 11,
    start: 22.569,
    end: 24.25,
    text: "dina kunder och vad de söker efter.",
  },
  {
    id: 12,
    start: 24.69,
    end: 26.579,
    text: "Utifrån det bygger vi sajter som är",
  },
  { id: 13, start: 27.01, end: 27.68, text: "snabba" },
  { id: 14, start: 27.969, end: 29.53, text: "och tydligt strukturerade." },
  { id: 15, start: 29.93, end: 31.51, text: "SEO-optimerade" },
  {
    id: 16,
    start: 31.809,
    end: 34.209,
    text: "och redan nu anpassade för en framtid där AI",
  },
  {
    id: 17,
    start: 34.209,
    end: 36.45,
    text: "kommer påverka hur man hittar och tolkar innehåll.",
  },
  { id: 18, start: 36.86, end: 38.319, text: "Vi erbjuder tre saker." },
  { id: 19, start: 38.81, end: 39.49, text: "För det första," },
  {
    id: 20,
    start: 40.25,
    end: 42.169,
    text: "möjlighet att autogenerera sidor.",
  },
  {
    id: 21,
    start: 42.569,
    end: 44.25,
    text: "Perfekt om du vill komma igång snabbt,",
  },
  {
    id: 22,
    start: 44.65,
    end: 47.09,
    text: "eller bygga ut din befintliga sajt steg för steg.",
  },
  { id: 23, start: 47.529, end: 48.159, text: "För det andra," },
  {
    id: 24,
    start: 48.759,
    end: 51.639,
    text: "Fullskaliga projekt där vi tar ansvar för hela resan.",
  },
  { id: 25, start: 52.099, end: 53.04, text: "Från första idé," },
  {
    id: 26,
    start: 53.4,
    end: 55.779,
    text: "via design och utveckling i React och Next.",
  },
  {
    id: 27,
    start: 56.159,
    end: 58.319,
    text: "Till lansering och löpande optimering.",
  },
  { id: 28, start: 58.759, end: 59.599, text: "Och för det tredje," },
  { id: 29, start: 60.15, end: 61.36, text: "Sajt-audits." },
  {
    id: 30,
    start: 61.759,
    end: 63.72,
    text: "Vi går igenom din nuvarande hemsida,",
  },
  { id: 31, start: 64.12, end: 65.309, text: "hittar flaskhalsar" },
  {
    id: 32,
    start: 65.599,
    end: 68.529,
    text: "och ger en konkret plan för hur den kan börja prestera bättre.",
  },
  { id: 33, start: 68.959, end: 69.959, text: "För både besökare," },
  {
    id: 34,
    start: 70.319,
    end: 72.319,
    text: "Google och framtidens AI-verktyg.",
  },
  { id: 35, start: 72.839, end: 74.36, text: "Bakom sajtstudio står jag," },
  { id: 36, start: 74.68, end: 75.639, text: "Jakob Eberg," },
  {
    id: 37,
    start: 76.01,
    end: 78.79,
    text: "tillsammans med Oskar Guditz och Joakim Hallsten.",
  },
  { id: 38, start: 79.239, end: 80.12, text: "Vi är i uppstart," },
  {
    id: 39,
    start: 80.239,
    end: 81.599,
    text: "men långt ifrån nya på det här.",
  },
  {
    id: 40,
    start: 82.04,
    end: 84.069,
    text: "Vill du se vad vi kan göra för ditt företag?",
  },
  { id: 41, start: 84.519, end: 85.08, text: "Hör av dig," },
  {
    id: 42,
    start: 85.559,
    end: 88.389,
    text: "så tar vi ett rakt och konkret samtal om din nästa hemsida.",
  },
];

export default function AboutUsVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-20%" });
  const { isLight } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(1);
  const [hasVideo, setHasVideo] = useState(false);

  // Calculate subtitle based on current time using useMemo instead of useEffect
  const currentSubtitle = useMemo(() => {
    const subtitle = subtitlesData.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    return subtitle?.text || "";
  }, [currentTime]);

  // Update video duration when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration || 1);
      setHasVideo(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // currentSubtitle is now computed via useMemo, no need to reset it
  };

  return (
    <section
      ref={sectionRef}
      id="om-oss-video"
      className={`section-spacing-md relative overflow-hidden min-h-screen flex items-center ${
        isLight
          ? "bg-gradient-to-b from-amber-50 via-orange-50/50 to-sky-50"
          : "bg-gradient-to-b from-black via-gray-950 to-black"
      }`}
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {/* Animated grid pattern */}
        <div
          className={`absolute inset-0 ${isLight ? "opacity-10" : "opacity-5"}`}
          style={{
            backgroundImage: `
              linear-gradient(${
                isLight ? "rgba(0, 102, 255, 0.2)" : "rgba(0, 102, 255, 0.1)"
              } 1px, transparent 1px),
              linear-gradient(90deg, ${
                isLight ? "rgba(0, 102, 255, 0.2)" : "rgba(0, 102, 255, 0.1)"
              } 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            isLight ? "bg-accent/10" : "bg-accent/5"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            isLight ? "bg-tertiary/10" : "bg-tertiary/5"
          }`}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 ${
              isLight
                ? "text-gray-900"
                : "bg-gradient-to-r from-white via-accent to-tertiary bg-clip-text text-transparent"
            }`}
          >
            Om Oss
          </h2>

          {/* Placeholder text - customize this */}
          <p
            className={`text-lg md:text-xl max-w-3xl mx-auto ${
              isLight ? "text-gray-700" : "text-gray-300"
            }`}
          >
            Tre personer. En vision. Hemsidor som faktiskt levererar.
          </p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Video wrapper with aspect ratio */}
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl ${
              isLight
                ? "shadow-gray-300/50 border border-gray-200"
                : "shadow-accent/20 border border-white/10"
            }`}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              preload="metadata"
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/videos/om_oss.mp4" type="video/mp4" />
              <track kind="captions" srcLang="sv" label="Svenska" default />
              Din webbläsare stöder inte videouppspelning.
            </video>

            {/* Play button overlay */}
            {!isPlaying && (
              <motion.button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-label="Spela video"
              >
                <motion.div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
                    isLight
                      ? "bg-white/90 group-hover:bg-white"
                      : "bg-accent/90 group-hover:bg-accent"
                  } transition-all shadow-lg`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className={`w-8 h-8 md:w-10 md:h-10 ml-1 ${
                      isLight ? "text-accent" : "text-white"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </motion.button>
            )}

            {/* Click to pause when playing */}
            {isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 cursor-pointer"
                aria-label="Pausa video"
              />
            )}

            {/* Subtitle overlay */}
            {currentSubtitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 md:bottom-8 left-4 right-4 text-center"
              >
                <span
                  className={`inline-block px-4 py-2 md:px-6 md:py-3 rounded-lg text-base md:text-xl font-medium ${
                    isLight
                      ? "bg-white/95 text-gray-900 shadow-lg"
                      : "bg-black/80 text-white backdrop-blur-sm"
                  }`}
                >
                  {currentSubtitle}
                </span>
              </motion.div>
            )}

            {/* Decorative corners */}
            <div
              className={`absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl ${
                isLight ? "border-accent/30" : "border-accent/50"
              }`}
            />
            <div
              className={`absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 rounded-tr-2xl ${
                isLight ? "border-tertiary/30" : "border-tertiary/50"
              }`}
            />
            <div
              className={`absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 rounded-bl-2xl ${
                isLight ? "border-tertiary/30" : "border-tertiary/50"
              }`}
            />
            <div
              className={`absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl ${
                isLight ? "border-accent/30" : "border-accent/50"
              }`}
            />
          </div>

          {/* Video progress bar */}
          {isPlaying && hasVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 h-1 rounded-full overflow-hidden ${
                isLight ? "bg-gray-200" : "bg-white/20"
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-accent to-tertiary transition-all duration-100"
                style={{
                  width: `${(currentTime / videoDuration) * 100}%`,
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Additional info below video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p
            className={`text-sm md:text-base ${
              isLight ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Klicka på videon för att lära känna oss bättre
          </p>
        </motion.div>
      </div>
    </section>
  );
}
