'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface MetricsChartProps {
  scores: {
    [key: string]: number;
  };
}

export default function MetricsChart({ scores }: MetricsChartProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const getColorForScore = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  const getGradeForScore = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const metricLabels: { [key: string]: string } = {
    seo: 'SEO',
    technical_seo: 'Teknisk SEO',
    ux: 'Användarupplevelse',
    content: 'Innehåll',
    performance: 'Prestanda',
    accessibility: 'Tillgänglighet',
    security: 'Säkerhet',
    mobile: 'Mobilanpassning'
  };

  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Average Score Circle */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="16"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                stroke={getColorForScore(averageScore)}
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(averageScore / 100) * 502.4} 502.4`}
                initial={{ strokeDasharray: "0 502.4" }}
                animate={{ strokeDasharray: `${(averageScore / 100) * 502.4} 502.4` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-center"
              >
                <span className="text-5xl font-bold text-white">{Math.round(averageScore)}</span>
                <span className="text-lg text-gray-400 block">Snittpoäng</span>
                <span className="text-3xl font-bold" style={{ color: getColorForScore(averageScore) }}>
                  {getGradeForScore(averageScore)}
                </span>
              </motion.div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400 text-center mt-4 max-w-xs"
          >
            {averageScore >= 80 && "Utmärkt! Din sajt presterar över genomsnittet."}
            {averageScore >= 60 && averageScore < 80 && "Bra grund, men det finns utrymme för förbättringar."}
            {averageScore < 60 && "Betydande förbättringsmöjligheter identifierade."}
          </motion.p>
        </div>

        {/* Individual Metrics */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(scores).map(([key, score], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredMetric(key)}
              onMouseLeave={() => setHoveredMetric(null)}
              className="relative"
            >
              <div className={`p-6 rounded-xl bg-white/5 border transition-all ${
                hoveredMetric === key
                  ? 'border-white/30 bg-white/10 transform scale-105'
                  : 'border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">
                    {metricLabels[key] || key}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: getColorForScore(score) }}>
                      {score}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getColorForScore(score) }}
                  />
                </div>

                {/* Grade Badge */}
                <div className="absolute -top-2 -right-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                    style={{ backgroundColor: getColorForScore(score) }}
                  >
                    {getGradeForScore(score)}
                  </motion.div>
                </div>
              </div>

              {/* Hover Tooltip */}
              {hoveredMetric === key && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-0 right-0 p-3 bg-gray-900 rounded-lg shadow-xl z-10"
                >
                  <p className="text-sm text-gray-300">
                    {score >= 80 && "Utmärkt prestanda inom detta område"}
                    {score >= 60 && score < 80 && "Acceptabel nivå med förbättringspotential"}
                    {score < 60 && "Prioritera förbättringar inom detta område"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center"
      >
        <div>
          <p className="text-2xl font-bold text-green-400">
            {Object.values(scores).filter(s => s >= 80).length}
          </p>
          <p className="text-sm text-gray-400">Utmärkta områden</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-400">
            {Object.values(scores).filter(s => s >= 60 && s < 80).length}
          </p>
          <p className="text-sm text-gray-400">Bra områden</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">
            {Object.values(scores).filter(s => s < 60).length}
          </p>
          <p className="text-sm text-gray-400">Kritiska områden</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
