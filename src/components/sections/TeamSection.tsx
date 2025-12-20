"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useContentSection } from "@/hooks/useContent";
import { useMounted } from "@/hooks/useMounted";
import Image from "next/image";
import TeamConvergence from "@/components/animations/TeamConvergence";

/**
 * TeamMemberCard - Glassmorphic card with inward buckle effect on hover
 * 
 * The card appears to "press inward" when hovered, creating a tactile feel.
 * Uses inverse 3D rotation + subtle scale reduction for the effect.
 */
interface TeamMemberCardProps {
  name: string;
  role: string;
  description: string;
  image: string;
  linkedin: string;
  index: number;
}

function TeamMemberCard({ name, role, description, image, linkedin, index }: TeamMemberCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mounted = useMounted();

  // Mouse position for buckle effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics
  const springConfig = { damping: 20, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Inverted 3D rotation - creates "pressed inward" effect
  const rotateX = useTransform(y, [-0.5, 0.5], ["-6deg", "6deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["6deg", "-6deg"]);

  // Text warp effect - letters seem to bend toward cursor
  const textSkewX = useTransform(x, [-0.5, 0.5], ["2deg", "-2deg"]);
  const textSkewY = useTransform(y, [-0.5, 0.5], ["-1deg", "1deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;

    const xPct = mouseXPos / rect.width - 0.5;
    const yPct = mouseYPos / rect.height - 0.5;

    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Determine accent color based on index
  const accentColors = [
    { gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", glow: "rgba(59, 130, 246, 0.3)" },
    { gradient: "from-rose-500/20 to-orange-500/20", border: "border-rose-500/30", glow: "rgba(244, 63, 94, 0.3)" },
    { gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", glow: "rgba(16, 185, 129, 0.3)" },
  ];
  const accent = accentColors[index % 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.15,
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: mounted ? rotateX : 0,
          rotateY: mounted ? rotateY : 0,
          scale: isHovered ? 0.97 : 1,
          transformStyle: "preserve-3d",
        }}
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${accent.gradient}
          backdrop-blur-xl
          border ${accent.border}
          transition-all duration-300
          ${isHovered ? "shadow-2xl" : "shadow-lg shadow-black/20"}
        `}
        suppressHydrationWarning
      >
        {/* Inner glow on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none rounded-2xl"
          animate={{
            opacity: isHovered ? 0.4 : 0,
            boxShadow: isHovered ? `inset 0 0 60px ${accent.glow}` : "none",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
            backgroundSize: "200% 100%",
          }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10 p-6 md:p-8">
          {/* Profile image placeholder */}
          <motion.div
            className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-full overflow-hidden border-2 border-white/20"
            style={{
              transform: mounted && isHovered ? "translateZ(30px)" : "translateZ(0)",
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
              {image && image.includes("/images/team/") ? (
                <Image
                  src={image}
                  alt={`${name} - ${role}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 112px, 144px"
                />
              ) : (
                // Placeholder with initials
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-white/60">
                    {name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Glare effect on image */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                opacity: isHovered ? 1 : 0.5,
              }}
            />
          </motion.div>

          {/* Name with buckle text effect */}
          <motion.h3
            className="text-xl md:text-2xl font-bold text-white text-center mb-2"
            style={{
              transform: mounted && isHovered ? "translateZ(20px)" : "translateZ(0)",
              skewX: mounted ? textSkewX : 0,
              skewY: mounted ? textSkewY : 0,
            }}
            suppressHydrationWarning
          >
            {name}
          </motion.h3>

          {/* Role */}
          <motion.p
            className="text-sm md:text-base text-blue-400 font-semibold text-center mb-4 uppercase tracking-wider"
            style={{
              transform: mounted && isHovered ? "translateZ(15px)" : "translateZ(0)",
            }}
          >
            {role}
          </motion.p>

          {/* Description with subtle warp */}
          <motion.p
            className="text-sm md:text-base text-gray-300 text-center leading-relaxed"
            style={{
              transform: mounted && isHovered ? "translateZ(10px)" : "translateZ(0)",
              skewX: mounted ? textSkewX : 0,
            }}
            suppressHydrationWarning
          >
            {description}
          </motion.p>

          {/* LinkedIn link */}
          {linkedin && (
            <motion.a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 mt-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              style={{
                transform: mounted && isHovered ? "translateZ(25px)" : "translateZ(0)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Besök ${name}s LinkedIn-profil`}
            >
              {/* LinkedIn icon */}
              <svg
                className="w-5 h-5 text-[#0A66C2] group-hover:text-[#0A66C2]"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </motion.a>
          )}
        </div>

        {/* Bottom accent line */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
            index === 0 ? "from-blue-500 via-cyan-400 to-blue-500" :
            index === 1 ? "from-rose-500 via-orange-400 to-rose-500" :
            "from-emerald-500 via-teal-400 to-emerald-500"
          }`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0.5 }}
        />
      </motion.div>

      {/* Reflection/shadow underneath */}
      <motion.div
        className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl bg-gradient-to-r ${
          index === 0 ? "from-blue-500/30 to-cyan-500/30" :
          index === 1 ? "from-rose-500/30 to-orange-500/30" :
          "from-emerald-500/30 to-teal-500/30"
        }`}
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

/**
 * TeamSection - About the team behind Sajtstudio
 * 
 * SEO-optimized section with rich text content and interactive team member cards.
 * All content is editable via the /admin panel using CMS keys T52-T63 and B16-B18.
 */
export default function TeamSection() {
  const mounted = useMounted();
  const { getValue } = useContentSection("team");
  
  // Cards only appear AFTER the convergence animation completes
  const [showCards, setShowCards] = useState(false);

  // Get content from CMS with fallbacks
  const title = getValue("T52", "Teamet bakom Sajtstudio");
  const intro = getValue("T53", "Sajtstudio drivs av ett dynamiskt team av entreprenörer med bred erfarenhet inom teknik, media och affärer.");
  const outro = getValue("T63", "Tillsammans kombinerar vi teknisk expertis, kreativ marknadsföring och affärssinne.");

  const teamMembers = [
    {
      name: getValue("T54", "Jakob Eberg"),
      role: getValue("T57", "Tech Lead & Utveckling"),
      description: getValue("T60", "En före detta professionell pokerspelare som bytte karriärbana till tech-världen. Med flera års erfarenhet av programmering och mjukvaruutveckling ansvarar han för den tekniska utvecklingen."),
      image: getValue("B16", "/images/team/jakob-eberg.webp"),
      linkedin: getValue("T64", "https://www.linkedin.com/in/jakob-eberg/"),
    },
    {
      name: getValue("T55", "Oscar Guditz"),
      role: getValue("T58", "Affärsutveckling & Partnerskap"),
      description: getValue("T61", "En serieentreprenör som har drivit flera digitala projekt och företag. Han har byggt och sålt webbplatser samt varit involverad i olika tech-startups."),
      image: getValue("B17", "/images/team/oscar-guditz.webp"),
      linkedin: getValue("T65", "https://www.linkedin.com/in/oscar-guditz/"),
    },
    {
      name: getValue("T56", "Joakim Hallsten"),
      role: getValue("T59", "Media & Marknadsföring"),
      description: getValue("T62", "Vår expert inom media och marknadsföring med över ett decennium i branschen. Han ansvarar för innehållsstrategi och SEO."),
      image: getValue("B18", "/images/team/joakim-hallsten.webp"),
      linkedin: getValue("T66", "https://www.linkedin.com/in/joakim-hallsten/"),
    },
  ];

  return (
    <section
      className="relative py-20 md:py-32 bg-gradient-to-b from-gray-950 via-black to-gray-950 overflow-hidden"
      aria-labelledby="team-heading"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        {mounted && (
          <>
            <motion.div
              className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"
              animate={{
                x: [0, -30, 0],
                y: [0, 20, 0],
                scale: [1.1, 1, 1.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.h2
            id="team-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h2>

          {/* Intro text - SEO rich content */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {intro}
          </motion.p>

          {/* Additional SEO text */}
          <motion.p
            className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            En av våra medgrundare driver exempelvis ett kontorshotell i centrala Stockholm – en kreativ coworking-miljö 
            där entreprenörer och utvecklare möts. Denna koppling speglar vårt engagemang i startup-världen och tekniksfären, 
            vilket ger oss insikt i de utmaningar och möjligheter som moderna företag står inför.
          </motion.p>
        </motion.div>

        {/* Epic team convergence animation - scroll to see the magic */}
        <TeamConvergence onConverged={() => setShowCards(true)} />

        {/* Team member cards - ONLY appear after convergence */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-20"
          initial={{ opacity: 0, y: 60 }}
          animate={{ 
            opacity: showCards ? 1 : 0, 
            y: showCards ? 0 : 60,
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.1, 0.25, 1],
            staggerChildren: 0.15,
          }}
        >
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={member.name}
              name={member.name}
              role={member.role}
              description={member.description}
              image={member.image}
              linkedin={member.linkedin}
              index={index}
            />
          ))}
        </motion.div>

        {/* Outro text - SEO CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
            {outro}
          </p>

          <p className="text-base text-gray-400 leading-relaxed mb-8">
            Vi på Sajtstudio tar hand om din webbplats – så att du kan ta hand om din verksamhet. 
            Vi tror på transparens och trovärdighet, och är stolta över den erfarenhet vi tar med oss in i varje nytt samarbete. 
            När du arbetar med Sajtstudio får du inte bara en snygg hemsida, utan även en partner med djup förståelse för webb, media och affärer – redo att hjälpa ditt företag att växa online.
          </p>

          {/* Final CTA */}
          <motion.p
            className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Låt oss skapa något extraordinärt tillsammans.
          </motion.p>

          {/* Credits */}
          <motion.p
            className="text-sm text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Sajtstudio-teamet, 2025
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

