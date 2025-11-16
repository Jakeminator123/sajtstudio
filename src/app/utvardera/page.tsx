'use client';

import Footer from '@/components/layout/Footer';
import HeaderNav from '@/components/layout/HeaderNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';

type Mode = 'choice' | 'audit' | 'questions' | 'results';

interface AuditResult {
  audit_type: 'website_audit' | 'recommendation';
  company: string;
  domain?: string | null;
  audit_scores?: {
    seo: number;
    ux: number;
    content: number;
    performance: number;
    accessibility: number;
    technical_seo: number;
  };
  improvements?: Array<{
    item: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    why?: string;
    how?: string;
  }>;
  budget_estimate?: {
    low: number;
    high: number;
    currency: string;
  };
  cost: {
    tokens: number;
    sek: number;
    usd: number;
  };
  strengths?: string[];
  issues?: string[];
  website_type_recommendation?: string;
  expected_outcomes?: string[];
}

interface QuestionAnswers {
  industry: string;
  industryDescription: string;
  purpose: string;
  audience: string;
  content: string[];
  features: string[];
  budget?: string;
  timeline?: string;
}

export default function UtvarderaPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('choice');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({
    industry: '',
    industryDescription: '',
    purpose: '',
    audience: '',
    content: [],
    features: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUrlSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'audit',
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      setResult(data.result);
      setMode('results');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ett oväntat fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'questions',
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      setResult(data.result);
      setMode('results');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ett oväntat fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/audit/markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) throw new Error('Kunde inte generera Markdown');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Kunde inte ladda ner Markdown-fil');
    }
  };

  const questions = [
    {
      id: 'industry',
      title: 'Vilken bransch och verksamhet?',
      type: 'combo',
      options: [
        'E-handel',
        'Restaurang & Mat',
        'Konsultverksamhet',
        'Hälsa & Vård',
        'Bygg & Entreprenad',
        'IT & Tech',
        'Utbildning',
        'Annat'
      ],
    },
    {
      id: 'purpose',
      title: 'Vad är huvudsyftet med hemsidan?',
      type: 'single',
      options: [
        'Generera leads/förfrågningar',
        'Sälja produkter online',
        'Informera om tjänster',
        'Bygga varumärke',
        'Bokningar/tidsbokning',
      ],
    },
    {
      id: 'audience',
      title: 'Vem är er målgrupp?',
      type: 'single',
      options: [
        'Privatpersoner lokalt',
        'Privatpersoner nationellt',
        'Företag (B2B)',
        'Både privat och företag',
        'Internationell publik',
      ],
    },
    {
      id: 'content',
      title: 'Vad ska hemsidan visa?',
      type: 'multi',
      options: [
        'Produkter/tjänster',
        'Portfolio/tidigare arbeten',
        'Blogg/nyheter',
        'Kontaktinformation',
        'Om oss/företaget',
        'Priser',
        'Kundcase/referenser',
      ],
    },
    {
      id: 'features',
      title: 'Vilka funktioner behövs?',
      type: 'multi',
      options: [
        'Kontaktformulär',
        'Bokningssystem',
        'E-handel/varukorg',
        'Flerspråkighet',
        'Medlemsinlogg',
        'Nyhetsbrev',
        'Sökfunktion',
        'Live-chatt',
      ],
    },
  ];

  const currentQ = questions[currentQuestion];

  // Don't render animations until mounted on client
  if (!mounted) {
    return (
      <>
        <HeaderNav />
        <main className="relative min-h-screen overflow-hidden bg-black">
          <section className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center">
            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
              <div className="text-center">
                <LoadingSpinner className="text-white mx-auto" size="lg" />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderNav />
      <main className="relative min-h-screen overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {mode === 'choice' && (
            <motion.section
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center"
            >
              <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                {/* Animated background pattern */}
                <div className="absolute inset-0 -z-10 opacity-20">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 25% 25%, #0066ff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ff3366 0%, transparent 50%)',
                      filter: 'blur(100px)',
                    }}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center mb-16"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-white">
                        AI-driven
                      </span>
                      <span className="block text-white mt-2">Sajtutvärdering</span>
                    </h1>
                  </motion.div>
                  <motion.p
                    className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Få en professionell analys av din befintliga sajt eller få rekommendationer för en ny
                  </motion.p>

                  {/* Animated dots */}
                  <motion.div className="flex justify-center gap-2 mt-8">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.button
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    onClick={() => setMode('audit')}
                    className="group relative p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="text-5xl mb-4">🔍</div>
                      <h2 className="text-2xl font-bold text-white mb-3">Jag har en hemsida</h2>
                      <p className="text-gray-300">Få en djupgående analys av din befintliga sajt med konkreta förbättringsförslag</p>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    onClick={() => setMode('questions')}
                    className="group relative p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="text-5xl mb-4">🚀</div>
                      <h2 className="text-2xl font-bold text-white mb-3">Jag behöver en ny hemsida</h2>
                      <p className="text-gray-300">Svara på några frågor och få skräddarsydda rekommendationer för din nya sajt</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}

          {mode === 'audit' && (
            <motion.section
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center"
            >
              <div className="container mx-auto px-6 relative z-10 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <button
                    onClick={() => setMode('choice')}
                    className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                  >
                    <span>←</span> Tillbaka
                  </button>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    Analysera din hemsida
                  </h1>

                  <form onSubmit={handleUrlSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium mb-3 text-white/80 uppercase tracking-wider">
                        Hemsidans URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://exempel.se"
                        className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl"
                      >
                        <span className="text-red-400">⚠️</span> {error}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-8 py-5 bg-accent text-white font-bold text-lg rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-3">
                          <LoadingSpinner className="w-5 h-5" />
                          Analyserar...
                        </span>
                      ) : (
                        <>Starta analys</>
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-8 p-6 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-semibold text-white mb-3">Vad vi analyserar:</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ SEO och sökbarhet</li>
                      <li>✓ Användarupplevelse (UX)</li>
                      <li>✓ Innehållskvalitet</li>
                      <li>✓ Prestanda och laddningstider</li>
                      <li>✓ Tillgänglighet</li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}

          {mode === 'questions' && (
            <motion.section
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center"
            >
              <div className="container mx-auto px-6 relative z-10 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <button
                      onClick={() => {
                        if (currentQuestion === 0) {
                          setMode('choice');
                        } else {
                          setCurrentQuestion(currentQuestion - 1);
                        }
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <span>←</span> Tillbaka
                    </button>
                    <span className="text-gray-400">
                      {currentQuestion + 1} / {questions.length}
                    </span>
                  </div>

                  <div className="mb-8">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                        {currentQ.title}
                      </h2>

                      {currentQ.id === 'industry' && (
                        <div className="space-y-4">
                          <select
                            value={answers.industry}
                            onChange={(e) => setAnswers({ ...answers, industry: e.target.value })}
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white"
                          >
                            <option value="" className="bg-black">Välj bransch...</option>
                            {currentQ.options?.map((opt) => (
                              <option key={opt} value={opt} className="bg-black">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={answers.industryDescription}
                            onChange={(e) => setAnswers({ ...answers, industryDescription: e.target.value })}
                            placeholder="Beskriv din verksamhet..."
                            rows={4}
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40 resize-none"
                          />
                        </div>
                      )}

                      {currentQ.type === 'single' && currentQ.id !== 'industry' && (
                        <div className="space-y-3">
                          {currentQ.options?.map((option) => (
                            <label
                              key={option}
                              className="block cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={currentQ.id}
                                value={option}
                                checked={answers[currentQ.id as keyof QuestionAnswers] === option}
                                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                className="sr-only"
                              />
                              <div className={`p-4 rounded-xl border transition-all ${answers[currentQ.id as keyof QuestionAnswers] === option
                                ? 'bg-white/20 border-white/40 text-white'
                                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                }`}>
                                {option}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {currentQ.type === 'multi' && (
                        <div className="space-y-3">
                          {currentQ.options?.map((option) => {
                            const fieldKey = currentQ.id as 'content' | 'features';
                            const isChecked = answers[fieldKey].includes(option);
                            return (
                              <label
                                key={option}
                                className="block cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentValues = answers[fieldKey];
                                    if (e.target.checked) {
                                      setAnswers({
                                        ...answers,
                                        [fieldKey]: [...currentValues, option],
                                      });
                                    } else {
                                      setAnswers({
                                        ...answers,
                                        [fieldKey]: currentValues.filter((v) => v !== option),
                                      });
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div className={`p-4 rounded-xl border transition-all ${isChecked
                                  ? 'bg-white/20 border-white/40 text-white'
                                  : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                  }`}>
                                  <span className="mr-2">{isChecked ? '✓' : '○'}</span>
                                  {option}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(currentQuestion + 1);
                        } else {
                          handleQuestionSubmit();
                        }
                      }}
                      disabled={isLoading || (
                        currentQ.id === 'industry' ? !answers.industry || !answers.industryDescription :
                          currentQ.type === 'single' ? !answers[currentQ.id as keyof QuestionAnswers] :
                            currentQ.type === 'multi' ? (answers[currentQ.id as 'content' | 'features'].length === 0) : false
                      )}
                      className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-3">
                          <LoadingSpinner className="w-5 h-5" />
                          Genererar rekommendationer...
                        </span>
                      ) : currentQuestion < questions.length - 1 ? (
                        'Nästa →'
                      ) : (
                        'Få rekommendationer'
                      )}
                    </motion.button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl"
                    >
                      <span className="text-red-400">⚠️</span> {error}
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.section>
          )}

          {mode === 'results' && result && (
            <motion.section
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden"
            >
              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-6xl mx-auto"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setMode('choice');
                        setResult(null);
                        setError(null);
                        setUrl('');
                        setCurrentQuestion(0);
                        setAnswers({
                          industry: '',
                          industryDescription: '',
                          purpose: '',
                          audience: '',
                          content: [],
                          features: [],
                        });
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <span>←</span> Ny analys
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={downloadJSON}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                      >
                        <span>💾</span> JSON
                      </button>
                      <button
                        onClick={downloadMarkdown}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                      >
                        <span>📄</span> Markdown
                      </button>
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {result.audit_type === 'website_audit' ? 'Analysresultat' : 'Rekommendationer'}
                  </h1>
                  {result.domain && (
                    <p className="text-xl text-gray-400 mb-8">{result.domain}</p>
                  )}

                  {/* Kostnadsinformation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 inline-block"
                  >
                    <p className="text-sm text-gray-400">
                      Analys kostnad: <span className="text-white font-semibold">{result.cost.sek.toFixed(2)} SEK</span>
                      <span className="text-gray-400 ml-2">({result.cost.usd.toFixed(4)} USD)</span>
                      <span className="text-gray-400 ml-2">• {result.cost.tokens} tokens</span>
                    </p>
                  </motion.div>

                  {/* Resultatinnehåll - kommer implementeras i nästa steg */}
                  <div className="grid gap-8">
                    {result.audit_scores && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8"
                      >
                        <h2 className="text-2xl font-bold text-white mb-6">Poängöversikt</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {Object.entries(result.audit_scores).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="relative w-24 h-24 mx-auto mb-3">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="8"
                                    fill="none"
                                  />
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke={value >= 80 ? '#22c55e' : value >= 60 ? '#fbbf24' : '#ef4444'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(value / 100) * 251.2} 251.2`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-2xl font-bold text-white">{value}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-300 capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {result.improvements && result.improvements.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8"
                      >
                        <h2 className="text-2xl font-bold text-white mb-6">Förbättringsförslag</h2>
                        <div className="space-y-4">
                          {result.improvements.map((improvement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="backdrop-blur-sm bg-white/5 rounded-xl p-6"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">{improvement.item}</h3>
                                <div className="flex gap-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${improvement.impact === 'high' ? 'bg-green-500/20 text-green-300' :
                                    improvement.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                      'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {improvement.impact === 'high' ? 'Hög påverkan' :
                                      improvement.impact === 'medium' ? 'Medel påverkan' : 'Låg påverkan'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${improvement.effort === 'low' ? 'bg-blue-500/20 text-blue-300' :
                                    improvement.effort === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                                      'bg-red-500/20 text-red-300'
                                    }`}>
                                    {improvement.effort === 'low' ? 'Enkelt' :
                                      improvement.effort === 'medium' ? 'Medel' : 'Svårt'}
                                  </span>
                                </div>
                              </div>
                              {improvement.why && (
                                <p className="text-sm text-gray-300 mb-2">
                                  <strong>Varför:</strong> {improvement.why}
                                </p>
                              )}
                              {improvement.how && (
                                <p className="text-sm text-gray-300">
                                  <strong>Hur:</strong> {improvement.how}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {result.strengths && result.strengths.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-3xl p-6"
                        >
                          <h2 className="text-xl font-bold text-green-300 mb-4">✓ Styrkor</h2>
                          <ul className="space-y-2">
                            {result.strengths.map((strength, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="text-gray-300 flex items-start"
                              >
                                <span className="text-green-400 mr-2">•</span>
                                {strength}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {result.issues && result.issues.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-3xl p-6"
                        >
                          <h2 className="text-xl font-bold text-red-300 mb-4">⚠ Problem</h2>
                          <ul className="space-y-2">
                            {result.issues.map((issue, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="text-gray-300 flex items-start"
                              >
                                <span className="text-red-400 mr-2">•</span>
                                {issue}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>

                    {result.budget_estimate && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 text-center"
                      >
                        <h2 className="text-2xl font-bold text-white mb-4">Budgetuppskattning</h2>
                        <div className="flex justify-center items-center gap-8">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Minimum</p>
                            <p className="text-3xl font-bold text-white">
                              {result.budget_estimate.low.toLocaleString('sv-SE')}
                              <span className="text-lg ml-2">{result.budget_estimate.currency}</span>
                            </p>
                          </div>
                          <div className="text-4xl text-gray-600">—</div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Maximum</p>
                            <p className="text-3xl font-bold text-white">
                              {result.budget_estimate.high.toLocaleString('sv-SE')}
                              <span className="text-lg ml-2">{result.budget_estimate.currency}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {result.expected_outcomes && result.expected_outcomes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-3xl p-8"
                      >
                        <h2 className="text-2xl font-bold text-white mb-6">🎯 Förväntade resultat</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.expected_outcomes.map((outcome, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9 + index * 0.05 }}
                              className="flex items-start gap-3"
                            >
                              <span className="text-2xl">📈</span>
                              <p className="text-gray-300">{outcome}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {result.website_type_recommendation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="backdrop-blur-xl bg-gradient-to-r from-accent/20 to-tertiary/20 border border-accent/30 rounded-3xl p-8"
                      >
                        <h2 className="text-2xl font-bold text-white mb-4">💡 Rekommenderad webbplatstyp</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          {result.website_type_recommendation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

