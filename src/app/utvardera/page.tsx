"use client";

import Footer from "@/components/layout/Footer";
import HeaderNav from "@/components/layout/HeaderNav";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Dashboard from "@/components/audit/Dashboard";
import LoadingState from "@/components/audit/LoadingState";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { ToastContainer, type ToastType } from "@/components/ui/Toast";
import Audit3DVisualization from "@/components/audit/Audit3DVisualization";
import AnimatedBackground from "@/components/effects/AnimatedBackground";
import TypewriterText from "@/components/effects/TypewriterText";
import Card3D from "@/components/effects/Card3D";
import NeonButton from "@/components/effects/NeonButton";
import FloatingIcons from "@/components/effects/FloatingIcons";
import WaveVisualizer from "@/components/effects/WaveVisualizer";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { AuditResult } from "@/types/audit";
import type { QuestionAnswers } from "@/lib/openai-client";
import { MODEL_OPTIONS, DEFAULT_MODEL } from "@/config/openai";

type Mode = "choice" | "audit" | "questions" | "results";

function UtvarderaPageContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("choice");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [loadingStage, setLoadingStage] = useState<
    "connecting" | "scraping" | "analyzing" | "generating"
  >("connecting");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type?: ToastType; duration?: number }>
  >([]);
  const [answers, setAnswers] = useState<QuestionAnswers>({
    industry: "",
    industryDescription: "",
    purpose: "",
    audience: "",
    content: [],
    features: [],
    budget: "",
    timeline: "",
  });
  const selectedModelMeta =
    MODEL_OPTIONS.find((option) => option.id === selectedModel) ?? MODEL_OPTIONS[0];

  // Toast notification helper
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // URL normalization helper
  const normalizeUrl = useCallback((urlInput: string): string => {
    let normalized = urlInput.trim();
    if (!normalized) {
      throw new Error("URL kan inte vara tom");
    }

    // Remove any leading/trailing whitespace and slashes
    normalized = normalized.trim().replace(/^\/+|\/+$/g, "");

    // Auto-add https:// if missing protocol
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }

    // Validate URL format
    try {
      const urlObj = new URL(normalized);
      // Ensure we have a valid hostname
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        throw new Error("Ogiltig URL - saknar domännamn");
      }
      return normalized;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Ogiltig URL-format. Ange t.ex. 'exempel.se' eller 'https://exempel.se'");
      }
      throw error;
    }
  }, []);

  // Auto-save result to localStorage
  useEffect(() => {
    if (result) {
      try {
        const savedResults = JSON.parse(
          localStorage.getItem("audit-results") || "[]"
        );
        const newResult = {
          ...result,
          savedAt: new Date().toISOString(),
        };
        // Keep only last 5 results
        const updatedResults = [newResult, ...savedResults].slice(0, 5);
        localStorage.setItem("audit-results", JSON.stringify(updatedResults));
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }, [result]);


  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Handle URL parameters from sajtgranskning page
  useEffect(() => {
    if (!mounted || isLoading) return;

    const urlParam = searchParams.get("url");
    const modeParam = searchParams.get("mode");

    if (modeParam === "audit" && urlParam) {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        // Normalize URL before setting
        const normalizedUrl = normalizeUrl(decodedUrl);
        setUrl(normalizedUrl);
        setMode("audit");
        // Auto-submit after a short delay to allow UI to render
        const timeoutId = setTimeout(() => {
          const form = document.querySelector('form') as HTMLFormElement | null;
          if (form) {
            form.requestSubmit();
          }
        }, 200);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ogiltig URL i länken");
        setMode("audit");
      }
    }
  }, [mounted, searchParams, normalizeUrl, isLoading]);

  const handleUrlSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate and normalize URL
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ogiltig URL");
      return;
    }

    setIsLoading(true);
    setLoadingStage("connecting");
    setLoadingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    setAbortController(controller);
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    // Stage timers with cleanup (only for visual stages)
    const stageTimeouts: NodeJS.Timeout[] = [];

    try {
      // Stage 1: Connecting
      setLoadingStage("connecting");
      setLoadingProgress(10);

      // Stage 2: Scraping
      const scrapingTimer = setTimeout(() => {
        if (!controller.signal.aborted) {
          setLoadingStage("scraping");
          setLoadingProgress(30);
        }
      }, 1000);
      stageTimeouts.push(scrapingTimer);

      // Stage 3: Analyzing
      const analyzingTimer = setTimeout(() => {
        if (!controller.signal.aborted) {
          setLoadingStage("analyzing");
          setLoadingProgress(60);
        }
      }, 3000);
      stageTimeouts.push(analyzingTimer);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "audit",
          url: normalizedUrl,
          model: selectedModel,
          webSearch: useWebSearch,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Stage 4: Generating
      setLoadingStage("generating");
      setLoadingProgress(85);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Okänt fel" }));
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data || !data.result) {
        throw new Error("Kunde inte hämta resultat från servern");
      }

      if (!data.success) {
        throw new Error(data.error || "Analysen misslyckades");
      }

      setLoadingProgress(100);
      setTimeout(() => {
        if (!controller.signal.aborted) {
          setResult(data.result);
          setMode("results");
          showToast("Analysen är klar! 🎉", "success");
        }
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError(
            "Tidsgränsen överskreds. Analysen tog för lång tid. Försök igen eller välj en snabbare analysnivå."
          );
        } else if (
          error.message.includes("timeout") ||
          error.message.includes("Timeout")
        ) {
          setError(
            "Tidsgränsen överskreds. Analysen tog för lång tid. Försök igen eller välj en snabbare analysnivå."
          );
        } else {
          setError(error.message || "Ett oväntat fel uppstod. Försök igen.");
        }
      } else {
        setError("Ett oväntat fel uppstod. Försök igen.");
      }
    } finally {
      // Cleanup all timers
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      stageTimeouts.forEach((timer) => clearTimeout(timer));
      setIsLoading(false);
      setLoadingProgress(0);
      setAbortController(null);
    }
  };

  const handleQuestionSubmit = async () => {
    setError(null);
    setIsLoading(true);
    setLoadingStage("connecting");
    setLoadingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    setAbortController(controller);
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      setLoadingStage("analyzing");
      setLoadingProgress(30);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "questions",
          answers,
          model: selectedModel,
          webSearch: useWebSearch,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      setLoadingStage("generating");
      setLoadingProgress(70);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Okänt fel" }));
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error(
          "Kunde inte hämta resultat från servern - ogiltigt svar"
        );
      }

      if (!data.success) {
        throw new Error(data.error || "Analysen misslyckades");
      }

      if (!data.result || typeof data.result !== "object") {
        throw new Error(
          "Kunde inte hämta resultat från servern - saknar resultat"
        );
      }

      // Validate result has required fields
      if (!data.result.audit_type || !data.result.cost) {
        throw new Error(
          "Kunde inte hämta resultat från servern - ogiltigt resultatformat"
        );
      }

      setLoadingProgress(100);

      // Set result after a short delay for smooth transition
      setTimeout(() => {
        setResult(data.result);
        setMode("results");
        showToast("Analysen är klar! 🎉", "success");
        setIsLoading(false);
        setLoadingProgress(0);
        setAbortController(null);
      }, 500);

      // Cleanup timers but not the result timer
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError(
            "Tidsgränsen överskreds. Analysen tog för lång tid. Försök igen eller välj en snabbare analysnivå."
          );
        } else if (
          error.message.includes("timeout") ||
          error.message.includes("Timeout")
        ) {
          setError(
            "Tidsgränsen överskreds. Analysen tog för lång tid. Försök igen eller välj en snabbare analysnivå."
          );
        } else {
          setError(error.message || "Ett oväntat fel uppstod. Försök igen.");
        }
      } else {
        setError("Ett oväntat fel uppstod. Försök igen.");
      }
    } finally {
      // Ensure cleanup even if error occurs
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setIsLoading(false);
      setLoadingProgress(0);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);
    setLoadingProgress(0);
    setLoadingStage("connecting");
    setError("Analysen avbröts av användaren");
    showToast("Analysen avbröts", "info");
  };

  const handleCopyLink = useCallback(() => {
    if (!result) return;

    try {
      const resultData = {
        domain: result.domain,
        company: result.company,
        auditType: result.audit_type,
        timestamp: new Date().toISOString(),
      };
      const encoded = btoa(JSON.stringify(resultData));
      const link = `${window.location.origin}${window.location.pathname}?result=${encoded}`;

      navigator.clipboard
        .writeText(link)
        .then(() => {
          showToast("Länk kopierad till urklipp! 🔗", "success", 3000);
        })
        .catch(() => {
          showToast("Kunde inte kopiera länk", "error");
        });
    } catch {
      showToast("Kunde inte kopiera länk", "error");
    }
  }, [result, showToast]);

  const downloadJSON = () => {
    if (!result) {
      setError("Inget resultat att ladda ner");
      return;
    }

    // Validate result structure before downloading
    if (!result.audit_type || !result.cost) {
      setError("Resultatet är ogiltigt och kan inte laddas ner");
      return;
    }

    try {
      // Add metadata to JSON
      const jsonData = {
        ...result,
        exported_at: new Date().toISOString(),
        export_version: "1.0",
      };

      const jsonString = JSON.stringify(jsonData, null, 2);

      // Validate JSON stringification succeeded
      if (!jsonString || jsonString.length === 0) {
        throw new Error("Kunde inte serialisera JSON-data");
      }

      const blob = new Blob([jsonString], {
        type: "application/json;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Generate filename with better formatting
      const dateStr = new Date().toISOString().split("T")[0];
      const domainPart = result.domain
        ? result.domain.replace(/\./g, "_").replace(/[^a-zA-Z0-9_]/g, "")
        : result.audit_type;
      const filename = `audit-${domainPart}-${dateStr}.json`;

      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      showToast("JSON-fil nedladdad! 💾", "success");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `Kunde inte ladda ner JSON-filen: ${error.message}`
          : "Kunde inte ladda ner JSON-filen";
      setError(errorMsg);
      showToast(errorMsg, "error");
    }
  };

  const downloadPDF = async () => {
    if (!result) {
      setError("Inget resultat att ladda ner");
      return;
    }

    // Validate result structure before requesting PDF
    if (!result.audit_type || !result.cost) {
      setError("Resultatet är ogiltigt och kan inte laddas ner som PDF");
      return;
    }

    // Set loading state for PDF generation
    setIsLoading(true);
    setLoadingStage("generating");
    setLoadingProgress(50);

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for PDF

      const response = await fetch("/api/audit/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Okänt fel" }));
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Validate response is PDF
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Servern returnerade inte en PDF-fil");
      }

      const blob = await response.blob();

      // Validate blob size
      if (blob.size === 0) {
        throw new Error("PDF-filen är tom");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Generate filename with better formatting
      const dateStr = new Date().toISOString().split("T")[0];
      const domainPart = result.domain
        ? result.domain.replace(/\./g, "_").replace(/[^a-zA-Z0-9_]/g, "")
        : result.audit_type;
      const filename = `audit-${domainPart}-${dateStr}.pdf`;

      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      showToast("PDF nedladdad! 📄", "success");
    } catch (error) {
      let errorMsg = "Kunde inte ladda ner PDF-fil";
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMsg = "PDF-generering tog för lång tid. Försök igen.";
        } else {
          errorMsg = `Kunde inte ladda ner PDF-fil: ${error.message}`;
        }
      }
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingStage("connecting");
    }
  };

  const questions = [
    {
      id: "industry",
      title: "Vilken bransch och verksamhet?",
      type: "combo",
      options: [
        "E-handel",
        "Restaurang & Mat",
        "Konsultverksamhet",
        "Hälsa & Vård",
        "Bygg & Entreprenad",
        "IT & Tech",
        "Utbildning",
        "Annat",
      ],
    },
    {
      id: "purpose",
      title: "Vad är huvudsyftet med hemsidan?",
      type: "single",
      options: [
        "Generera leads/förfrågningar",
        "Sälja produkter online",
        "Informera om tjänster",
        "Bygga varumärke",
        "Bokningar/tidsbokning",
      ],
    },
    {
      id: "audience",
      title: "Vem är er målgrupp?",
      type: "single",
      options: [
        "Privatpersoner lokalt",
        "Privatpersoner nationellt",
        "Företag (B2B)",
        "Både privat och företag",
        "Internationell publik",
      ],
    },
    {
      id: "content",
      title: "Vad ska hemsidan visa?",
      type: "multi",
      options: [
        "Produkter/tjänster",
        "Portfolio/tidigare arbeten",
        "Blogg/nyheter",
        "Kontaktinformation",
        "Om oss/företaget",
        "Priser",
        "Kundcase/referenser",
      ],
    },
    {
      id: "features",
      title: "Vilka funktioner behövs?",
      type: "multi",
      options: [
        "Kontaktformulär",
        "Bokningssystem",
        "E-handel/varukorg",
        "Flerspråkighet",
        "Medlemsinlogg",
        "Nyhetsbrev",
        "Sökfunktion",
        "Live-chatt",
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
        {/* Immersive animated background - Always visible for maximum impact */}
        <AnimatedBackground variant="aurora" />
        <div className="fixed inset-0 -z-[5] pointer-events-none">
          <FloatingIcons count={14} />
        </div>
        <div className="fixed inset-x-0 bottom-0 -z-10 pointer-events-none">
          <WaveVisualizer variant="sound" color="#60a5fa" height={140} />
        </div>
        <AnimatePresence mode="wait">
          {mode === "choice" && (
            <motion.section
              key="choice"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center"
            >
              <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center mb-16"
                >
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
                      <motion.span
                        className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          backgroundSize: "200% 200%",
                        }}
                      >
                        AI-driven
                      </motion.span>
                      <TypewriterText
                        texts={[
                          "Sajtutvärdering",
                          "Site valuation experience",
                          "Digitala rekommendationer",
                        ]}
                        className="block text-white mt-2 text-4xl md:text-5xl"
                        speed={110}
                        deleteSpeed={60}
                        pauseTime={1500}
                      />
                    </h1>
                  </motion.div>
                  <motion.p
                    className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <TypewriterText
                      texts={[
                        "Få en professionell analys av din befintliga sajt eller beställ en helt ny.",
                        "AI hjälper dig att prioritera, budgetera och imponera på dina kunder.",
                        "Vi kombinerar showiga effekter med konkreta affärsinsikter.",
                      ]}
                      className="block text-gray-300"
                      speed={85}
                      deleteSpeed={45}
                      pauseTime={2000}
                    />
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

                {/* Model Selection with Glow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-12 max-w-md mx-auto"
                >
                  <motion.label
                    className="block text-sm text-gray-400 mb-3 text-center uppercase tracking-wider"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Välj analysnivå
                  </motion.label>
                  <div className="relative">
                    <motion.select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-6 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white appearance-none cursor-pointer hover:bg-white/20 transition-all backdrop-blur-xl text-center"
                      whileHover={{
                        scale: 1.02,
                        borderColor: "rgba(255, 255, 255, 0.4)",
                      }}
                      style={{
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      {MODEL_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id} className="bg-gray-900 text-white">
                          {option.label} · ≈{" "}
                          {option.approxCostSek.toLocaleString("sv-SE", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}{" "}
                          SEK
                        </option>
                      ))}
                    </motion.select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    {selectedModelMeta.recommended && (
                      <p className="text-[11px] text-green-300 uppercase tracking-wider">Rekommenderad</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {selectedModelMeta.description} · ≈{" "}
                      {selectedModelMeta.approxCostSek.toLocaleString("sv-SE", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{" "}
                      SEK / körning
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseWebSearch((prev) => !prev)}
                      className={`px-5 py-2 rounded-full border transition-all text-sm ${
                        useWebSearch
                          ? "bg-green-500/20 border-green-400 text-green-200"
                          : "bg-white/5 border-white/20 text-gray-200 hover:border-white/40"
                      }`}
                      aria-pressed={useWebSearch}
                    >
                      {useWebSearch ? "WebSearch aktiverat" : "WebSearch av (standard)"}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center">
                      {useWebSearch
                        ? "Live-data via Responses API + web_search enligt ALLA.txt. Använd när aktuell fakta krävs."
                        : "Följer standardinställningen i ALLA.txt – ingen extern webbsök förrän du aktiverar det."}
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotateY: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                  >
                    <Card3D intensity={18} className="w-full">
                      <motion.button
                        onClick={() => setMode("audit")}
                        className="group relative p-8 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded-3xl hover:border-blue-400/60 transition-all duration-300 w-full"
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          boxShadow:
                            "0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)",
                        }}
                      >
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 rounded-3xl animate-pulse bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20" />
                        </div>

                        <div className="relative z-10">
                          <motion.div
                            className="text-5xl mb-4"
                            animate={{
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1.1, 1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            🔍
                          </motion.div>
                          <h2 className="text-2xl font-bold text-white mb-3">
                            Jag har en hemsida
                          </h2>
                          <p className="text-gray-300">
                            Få en djupgående analys av din befintliga sajt med
                            konkreta förbättringsförslag
                          </p>

                          {/* Animated accent lines */}
                          <motion.div
                            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                            animate={{
                              scaleX: [0, 1, 0],
                              opacity: [0, 0.8, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </motion.button>
                    </Card3D>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                  >
                    <Card3D intensity={18} className="w-full">
                      <motion.button
                        onClick={() => setMode("questions")}
                        className="group relative p-8 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-400/30 rounded-3xl hover:border-purple-400/60 transition-all duration-300 w-full"
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          boxShadow:
                            "0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1)",
                        }}
                      >
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 rounded-3xl animate-pulse bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20" />
                        </div>

                        <div className="relative z-10">
                          <motion.div
                            className="text-5xl mb-4"
                            animate={{
                              y: [0, -10, 0],
                              rotate: [0, 360],
                            }}
                            transition={{
                              y: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                              rotate: {
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                              },
                            }}
                          >
                            🚀
                          </motion.div>
                          <h2 className="text-2xl font-bold text-white mb-3">
                            Jag behöver en ny hemsida
                          </h2>
                          <p className="text-gray-300">
                            Svara på några frågor och få skräddarsydda
                            rekommendationer för din nya sajt
                          </p>

                          {/* Animated accent lines */}
                          <motion.div
                            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                            animate={{
                              scaleX: [0, 1, 0],
                              opacity: [0, 0.8, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1.5,
                            }}
                          />
                        </div>
                      </motion.button>
                    </Card3D>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}

          {mode === "audit" && !isLoading && (
            <motion.section
              key="audit"
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden flex items-center justify-center"
            >
              <div className="container mx-auto px-6 relative z-10 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <button
                    onClick={() => setMode("choice")}
                    className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                  >
                    <span>←</span> Tillbaka
                  </button>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    Analysera din hemsida
                  </h1>

                  <form onSubmit={handleUrlSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="url"
                        className="block text-sm font-medium mb-3 text-white/80 uppercase tracking-wider"
                      >
                        Hemsidans URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                        }}
                        onBlur={(e) => {
                          let value = e.target.value.trim();
                          if (!value) {
                            setUrl("");
                            return;
                          }
                          // Remove any leading/trailing whitespace
                          value = value.trim();
                          // Auto-add https:// if missing protocol
                          if (value && !value.match(/^https?:\/\//i)) {
                            // Remove any leading slashes
                            value = value.replace(/^\/+/, "");
                            value = `https://${value}`;
                          }
                          // Basic URL validation
                          try {
                            new URL(value);
                            setUrl(value);
                          } catch {
                            // Invalid URL, but let user continue typing
                            setUrl(value);
                          }
                        }}
                        placeholder="https://exempel.se eller exempel.se"
                        className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40"
                        required
                        disabled={isLoading}
                        title="Ange en giltig URL (t.ex. https://exempel.se eller bara exempel.se)"
                      />
                      <p className="mt-2 text-sm text-gray-400">
                        💡 Tips: Du kan ange URL:en med eller utan https://
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 backdrop-blur-xl bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 text-xl flex-shrink-0">
                            ⚠️
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{error}</p>
                            <button
                              onClick={() => setError(null)}
                              className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
                            >
                              Stäng
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <NeonButton
                      type="submit"
                      disabled={isLoading}
                      variant="blue"
                      size="lg"
                      className="w-full flex justify-center"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="w-5 h-5" />
                          Förbereder analys...
                        </>
                      ) : (
                        <>
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ⚡
                          </motion.span>
                          Starta analys
                        </>
                      )}
                    </NeonButton>
                  </form>

                  <motion.div
                    className="mt-8 p-6 backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border-2 border-white/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    }}
                    style={{
                      boxShadow:
                        "0 0 30px rgba(59, 130, 246, 0.1), inset 0 0 20px rgba(59, 130, 246, 0.05)",
                    }}
                  >
                    <h3 className="font-semibold text-white mb-4 text-lg flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        ⚙️
                      </motion.span>
                      Vad vi analyserar:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { icon: "🔍", text: "SEO och sökbarhet" },
                        { icon: "💫", text: "Användarupplevelse (UX)" },
                        { icon: "📝", text: "Innehållskvalitet" },
                        { icon: "⚡", text: "Prestanda och laddningstider" },
                        { icon: "♿", text: "Tillgänglighet" },
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          className="text-sm text-gray-300 flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          whileHover={{ x: 5, color: "#fff" }}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          >
                            {item.icon}
                          </motion.span>
                          {item.text}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </div>
            </motion.section>
          )}

          {mode === "audit" && isLoading && (
            <motion.section
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden"
            >
              <div className="container mx-auto px-6">
                <LoadingState
                  stage={loadingStage}
                  progress={loadingProgress}
                  onCancel={handleCancel}
                />
              </div>
            </motion.section>
          )}

          {mode === "questions" && isLoading && (
            <motion.section
              key="questions-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden"
            >
              <div className="container mx-auto px-6">
                <LoadingState
                  stage={loadingStage}
                  progress={loadingProgress}
                  onCancel={handleCancel}
                />
              </div>
            </motion.section>
          )}

          {mode === "questions" && !isLoading && (
            <motion.section
              key="questions"
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              style={{ willChange: "transform, opacity" }}
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
                          setMode("choice");
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
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 h-full rounded-full relative"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${
                            ((currentQuestion + 1) / questions.length) * 100
                          }%`,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        style={{ willChange: "width" }}
                      >
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                          style={{ width: '40%' }}
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                        {currentQ.title}
                      </h2>

                      {currentQ.id === "industry" && (
                        <div className="space-y-4">
                          <select
                            value={answers.industry}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                industry: e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-colors duration-200 text-white"
                          >
                            <option value="" className="bg-black">
                              Välj bransch...
                            </option>
                            {currentQ.options?.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-black"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={answers.industryDescription}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                industryDescription: e.target.value,
                              })
                            }
                            placeholder="Beskriv din verksamhet..."
                            rows={4}
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-colors duration-200 text-white placeholder-white/40 resize-none"
                          />
                        </div>
                      )}

                      {currentQ.type === "single" &&
                        currentQ.id !== "industry" && (
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
                                  checked={
                                    answers[
                                      currentQ.id as keyof QuestionAnswers
                                    ] === option
                                  }
                                  onChange={(e) =>
                                    setAnswers({
                                      ...answers,
                                      [currentQ.id]: e.target.value,
                                    })
                                  }
                                  className="sr-only"
                                />
                                <div
                                  className={`p-4 rounded-xl border transition-colors duration-200 ${
                                    answers[
                                      currentQ.id as keyof QuestionAnswers
                                    ] === option
                                      ? "bg-white/20 border-white/40 text-white"
                                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                                  }`}
                                  style={{ willChange: "background-color, border-color" }}
                                >
                                  {option}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}

                      {currentQ.type === "multi" && (
                        <div className="space-y-3">
                          {currentQ.options?.map((option) => {
                            const fieldKey = currentQ.id as
                              | "content"
                              | "features";
                            const isChecked =
                              answers[fieldKey].includes(option);
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
                                        [fieldKey]: currentValues.filter(
                                          (v) => v !== option
                                        ),
                                      });
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div
                                  className={`p-4 rounded-xl border transition-colors duration-200 ${
                                    isChecked
                                      ? "bg-white/20 border-white/40 text-white"
                                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                                  }`}
                                  style={{ willChange: "background-color, border-color" }}
                                >
                                  <span className="mr-2">
                                    {isChecked ? "✓" : "○"}
                                  </span>
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
                    <NeonButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion((prev) => prev + 1);
                        } else {
                          handleQuestionSubmit();
                        }
                      }}
                      disabled={
                        isLoading ||
                        (currentQ.id === "industry"
                          ? !answers.industry || !answers.industryDescription.trim()
                          : currentQ.type === "single"
                          ? !answers[currentQ.id as keyof QuestionAnswers]
                          : currentQ.type === "multi"
                          ? answers[currentQ.id as "content" | "features"]
                              .length === 0
                          : false)
                      }
                      variant="purple"
                      size="lg"
                      className="min-w-[220px] flex justify-center"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="w-5 h-5" />
                          Genererar...
                        </>
                      ) : currentQuestion < questions.length - 1 ? (
                        <>
                          Nästa
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            ✨
                          </motion.span>
                          Få rekommendationer
                        </>
                      )}
                    </NeonButton>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 backdrop-blur-xl bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl flex-shrink-0">
                          ⚠️
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{error}</p>
                          <button
                            onClick={() => setError(null)}
                            className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
                          >
                            Stäng
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.section>
          )}

          {mode === "results" && result && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative min-h-screen py-24 md:py-32 overflow-hidden"
            >
              <div className="container mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-7xl mx-auto"
                >
                  {/* Back Button with animation */}
                  <motion.button
                    onClick={() => {
                      setMode("choice");
                      setResult(null);
                      setError(null);
                      setUrl("");
                      setCurrentQuestion(0);
                      setAnswers({
                        industry: "",
                        industryDescription: "",
                        purpose: "",
                        audience: "",
                        content: [],
                        features: [],
                        budget: "",
                        timeline: "",
                      });
                    }}
                    className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05, x: -5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <motion.span
                      animate={{ x: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ←
                    </motion.span>
                    Ny analys
                  </motion.button>

                  {/* 3D Visualization with enhanced effects */}
                  {result.audit_scores && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95, rotateX: -10 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                      transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
                      className="mb-12 relative"
                    >
                      {/* Background glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-3xl"
                        animate={{
                          opacity: [0.3, 0.5, 0.3],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      <div className="relative text-center mb-8">
                        <motion.h2
                          className="text-3xl md:text-4xl font-bold text-white mb-2"
                          animate={{
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{
                            background:
                              "linear-gradient(90deg, #fff, #3b82f6, #a855f7, #fff)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Interaktiv 3D-visualisering
                        </motion.h2>
                        <motion.p
                          className="text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          Utforska dina analysresultat i 3D
                        </motion.p>
                      </div>

                      <motion.div
                        animate={{
                          y: [0, -15, 0],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Audit3DVisualization scores={result.audit_scores} />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Dashboard Component */}
                  <Dashboard
                    result={result}
                    onDownloadPDF={downloadPDF}
                    onDownloadJSON={downloadJSON}
                    isGeneratingPDF={isLoading && loadingStage === "generating"}
                    onCopyLink={handleCopyLink}
                  />
                </motion.div>
              </div>
              <ScrollToTop />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function UtvarderaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner className="text-white" size="lg" />
        </div>
      }
    >
      <UtvarderaPageContent />
    </Suspense>
  );
}
