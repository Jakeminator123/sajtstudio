'use client'

import { useMounted } from '@/hooks/useMounted'
import { useTheme } from '@/hooks/useTheme'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Tech stack items with SVG icons
const techStack = [
  {
    name: 'React',
    description: 'Komponentbaserad UI-arkitektur för interaktiva gränssnitt.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9" />
      </svg>
    ),
  },
  {
    name: 'Next.js',
    description: 'Fullstack-framework för snabba, SEO-vänliga webbapplikationer.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z" />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    description: 'Typsäkerhet som minskar buggar och förbättrar utvecklarupplevelsen.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.306.34v2.458a3.95 3.95 0 00-.643-.361 5.093 5.093 0 00-.717-.26 5.453 5.453 0 00-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 00-.623.242c-.17.104-.3.229-.393.374a.888.888 0 00-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 01-1.012 1.085 4.38 4.38 0 01-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 01-1.84-.164 5.544 5.544 0 01-1.512-.493v-2.63a5.033 5.033 0 003.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 00-.074-1.089 2.12 2.12 0 00-.537-.5 5.597 5.597 0 00-.807-.444 27.72 27.72 0 00-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 011.47-.629 7.536 7.536 0 011.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
      </svg>
    ),
  },
  {
    name: 'AI / OpenAI',
    description: 'AI-driven innehållsgenerering och smart webbplatsoptimering.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.67.248 6.067 6.067 0 005.186 2.68 5.986 5.986 0 001.07 5.49 6.05 6.05 0 001.73 12.2a5.985 5.985 0 00.516 4.911 6.046 6.046 0 006.51 2.9A6.065 6.065 0 0012.33 23.75a6.067 6.067 0 006.484-2.43 5.985 5.985 0 004.116-2.813 6.05 6.05 0 00-.648-6.686zM12.33 22.12a4.507 4.507 0 01-2.9-1.054l.144-.08 4.815-2.78a.783.783 0 00.396-.682V10.97l2.035 1.175a.072.072 0 01.04.056v5.622a4.527 4.527 0 01-4.53 4.297zM3.68 18.13a4.503 4.503 0 01-.539-3.03l.144.084 4.815 2.78a.783.783 0 00.787 0l5.879-3.395v2.35a.072.072 0 01-.029.062l-4.869 2.81a4.527 4.527 0 01-6.188-1.66zM2.45 7.94a4.503 4.503 0 012.36-1.978V11.6a.783.783 0 00.396.681l5.879 3.394-2.035 1.175a.072.072 0 01-.069.006l-4.87-2.813A4.527 4.527 0 012.45 7.94zM19.37 11.6l-5.879-3.394 2.035-1.175a.072.072 0 01.069-.006l4.87 2.813a4.527 4.527 0 01-.47 8.121V12.28a.783.783 0 00-.396-.681zM21.396 8.9l-.144-.084-4.815-2.78a.783.783 0 00-.787 0L9.771 9.43V7.08a.072.072 0 01.029-.062l4.87-2.812a4.527 4.527 0 016.726 4.694zM8.68 13.03l-2.035-1.175a.072.072 0 01-.04-.056V6.176a4.527 4.527 0 017.43-3.473l-.143.08-4.815 2.78a.783.783 0 00-.396.682v6.785zm1.104-2.38l2.618-1.512 2.617 1.512v3.023l-2.617 1.512-2.618-1.512z" />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS för snabb, konsekvent och responsiv design.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
      </svg>
    ),
  },
  {
    name: 'Framer Motion',
    description: 'Professionella animationer som ger liv åt gränssnittet.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
      </svg>
    ),
  },
]

function TechCard({
  tech,
  index,
  isLight,
}: {
  tech: (typeof techStack)[0]
  index: number
  isLight: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
        isLight
          ? 'bg-white/70 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50'
          : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/40 hover:bg-white/8'
      }`}
    >
      {/* Icon */}
      <div
        className={`mb-4 transition-colors duration-300 ${
          isLight
            ? 'text-gray-600 group-hover:text-accent'
            : 'text-gray-400 group-hover:text-accent'
        }`}
      >
        {tech.icon}
      </div>

      {/* Name */}
      <h3
        className={`text-xl font-bold mb-2 ${
          isLight ? 'text-gray-900' : 'text-white'
        }`}
      >
        {tech.name}
      </h3>

      {/* Description */}
      <p
        className={`text-sm leading-relaxed ${
          isLight ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        {tech.description}
      </p>

      {/* Subtle hover accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent via-tertiary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
    </motion.div>
  )
}

export default function TechShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mounted = useMounted()
  const { isLight } = useTheme()
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className={`py-32 md:py-48 relative overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-gradient-to-br from-gray-50 via-sky-50 to-amber-50'
          : 'bg-gradient-to-b from-gray-950 via-black to-gray-950'
      }`}
    >
      {/* Decorative background */}
      {isLight ? (
        <>
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.p
            className={`text-sm uppercase tracking-widest font-semibold mb-4 ${
              isLight ? 'text-accent' : 'text-accent'
            }`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            Teknik & Verktyg
          </motion.p>

          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Byggt med{' '}
            <span className="bg-gradient-to-r from-accent to-tertiary bg-clip-text text-transparent">
              framtidens teknik
            </span>
          </h2>

          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Vi använder de bästa verktygen och ramverken för att bygga snabba,
            skalbara och vackra webbplatser.
          </p>
        </motion.div>

        {/* Tech stack grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {techStack.map((tech, index) => (
            <TechCard
              key={tech.name}
              tech={tech}
              index={index}
              isLight={isLight}
            />
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className={`text-center mt-16 text-sm ${
            isLight ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          ...och mycket mer. Varje projekt får den stack som passar bäst.
        </motion.p>
      </div>
    </section>
  )
}
