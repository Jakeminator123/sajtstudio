"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// Particle component - separate to allow hooks at component level
function Particle({
    index,
    scrollYProgress,
    randomLeft,
    randomTop,
    randomScale,
    randomX,
    randomY
}: {
    index: number;
    scrollYProgress: MotionValue<number>;
    randomLeft: number;
    randomTop: number;
    randomScale: number;
    randomX: number;
    randomY: number;
}) {
    const opacity = useTransform(scrollYProgress,
        [0.2, 0.3 + index * 0.02, 0.7 + index * 0.02, 0.8],
        [0, 1, 1, 0]
    );
    const scale = useTransform(scrollYProgress,
        [0.2, 0.5, 0.8],
        [0, randomScale, 0]
    );
    const x = useTransform(scrollYProgress,
        [0, 1],
        [0, randomX]
    );
    const y = useTransform(scrollYProgress,
        [0, 1],
        [0, randomY]
    );

    return (
        <motion.div
            className="absolute w-1 h-1 bg-accent/30 rounded-full"
            style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
                opacity,
                scale,
                x,
                y
            }}
        />
    );
}

export default function TransitionBridge() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [buttonShake, setButtonShake] = useState(false);
    const [particleValues, setParticleValues] = useState<Array<{
        randomLeft: number;
        randomTop: number;
        randomScale: number;
        randomX: number;
        randomY: number;
    }>>([]);

    // Track scroll progress for this section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Create various transforms for the morphing effect
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 1, 1, 0.8, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

    // Words will fly up to header button when scroll reaches certain point
    const wordsFlyUp = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
    const wordsY = useTransform(wordsFlyUp, [0, 1], [0, -800]); // Fly up to header
    const wordsX = useTransform(wordsFlyUp, [0, 1], [0, 300]); // Move towards button position
    const wordsScale = useTransform(wordsFlyUp, [0, 0.5, 1], [1, 1.2, 0.1]);
    const wordsOpacity = useTransform(wordsFlyUp, [0, 0.8, 1], [1, 1, 0]);

    // Generate particle values once on mount to avoid Math.random in render
    useEffect(() => {
        if (particleValues.length > 0) return; // Already generated

        const values = Array.from({ length: 20 }, () => ({
            randomLeft: Math.random() * 100,
            randomTop: Math.random() * 100,
            randomScale: 1 + Math.random(),
            randomX: (Math.random() - 0.5) * 200,
            randomY: (Math.random() - 0.5) * 200,
        }));
        // Use requestAnimationFrame to avoid setState in effect warning
        requestAnimationFrame(() => {
            setParticleValues(values);
        });
    }, [particleValues.length]);

    // Trigger button animation when words reach it
    useEffect(() => {
        const unsubscribe = wordsFlyUp.onChange(value => {
            if (value > 0.9 && !buttonShake) {
                setButtonShake(true);
                // Trigger button shake in header
                const button = document.querySelector('.cta-button-header');
                if (button) {
                    button.classList.add('shake-animation');
                    setTimeout(() => {
                        button.classList.remove('shake-animation');
                        setButtonShake(false);
                    }, 1000);
                }
            }
        });
        return () => unsubscribe();
    }, [wordsFlyUp, buttonShake]);

    return (
        <div
            ref={containerRef}
            className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white"
        >
            {/* Background geometric patterns */}
            <motion.div
                className="absolute inset-0"
                style={{ opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0]) }}
            >
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(0, 102, 255, 0.03) 35px,
                rgba(0, 102, 255, 0.03) 70px
              )
            `
                    }}
                />
            </motion.div>

            {/* Morphing text container */}
            <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
                {/* Main morphing text */}
                <motion.div
                    className="relative"
                    style={{
                        opacity,
                        scale,
                        perspective: 1000
                    }}
                >
                    {/* Design? and Functionality? words that fly to button */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center gap-8"
                        style={{
                            y: wordsY,
                            x: wordsX,
                            scale: wordsScale,
                            opacity: wordsOpacity,
                            zIndex: 50
                        }}
                    >
                        <motion.span
                            className="text-5xl md:text-7xl font-black"
                            style={{ color: '#0066FF' }}
                            initial={{ rotate: -5 }}
                            animate={{ rotate: 5 }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                            Design?
                        </motion.span>
                        <motion.span
                            className="text-5xl md:text-7xl font-black"
                            style={{ color: '#FF0033' }}
                            initial={{ rotate: 5 }}
                            animate={{ rotate: -5 }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                        >
                            Functionality?
                        </motion.span>
                    </motion.div>

                    {/* Background text layers */}
                    <motion.h3
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900/20"
                        style={{
                            opacity: useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 0.5, 0.5, 0])
                        }}
                    >
                        <span className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 bg-clip-text text-transparent">
                            Från vision till verklighet
                        </span>
                    </motion.h3>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]),
                    scale: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.5, 1, 0.5]),
                    rotate: useTransform(scrollYProgress, [0, 1], [0, 360])
                }}
            >
                <div className="w-32 h-32 border-4 border-accent/20 rounded-full" />
                <div className="absolute inset-0 w-32 h-32 border-4 border-accent/30 rounded-full rotate-45" />
                <div className="absolute inset-0 w-32 h-32 border-4 border-accent/10 rounded-full rotate-90" />
            </motion.div>

            {/* Connecting lines */}
            <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                style={{
                    scaleX: useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]),
                    opacity: useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.5, 0])
                }}
            />

            {/* Particle effects */}
            <motion.div className="absolute inset-0 pointer-events-none" suppressHydrationWarning>
                {particleValues.length > 0 ? (
                    particleValues.map((values, i) => (
                        <Particle
                            key={i}
                            index={i}
                            scrollYProgress={scrollYProgress}
                            randomLeft={values.randomLeft}
                            randomTop={values.randomTop}
                            randomScale={values.randomScale}
                            randomX={values.randomX}
                            randomY={values.randomY}
                        />
                    ))
                ) : (
                    // SSR fallback - deterministic values
                    [...Array(20)].map((_, i) => (
                        <Particle
                            key={i}
                            index={i}
                            scrollYProgress={scrollYProgress}
                            randomLeft={i * 5}
                            randomTop={i * 5}
                            randomScale={1.5}
                            randomX={0}
                            randomY={0}
                        />
                    ))
                )}
            </motion.div>
        </div>
    );
}
