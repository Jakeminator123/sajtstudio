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
import { FormEvent, useEffect, useState, useCallback } from "react";

type Mode = "choice" | "audit" | "questions" | "results";

interface AuditResult {
  audit_type: "website_audit" | "recommendation";
  company: string;
  domain?: string | null;
  audit_scores?: {
    seo: number;
    ux: number;
    content: number;
    performance: number;
    accessibility: number;
    technical_seo: number;
    security?: number;
    mobile?: number;
  };
  improvements?: Array<{
    item: string;
    category?: string;
    impact: "high" | "medium" | "low";
    effort: "low" | "medium" | "high";
    why?: string;
    how?: string;
    code_example?: string;
    estimated_time?: string;
    technologies?: string[];
  }>;
  budget_estimate?: {
    low?: number;
    high?: number;
    immediate_fixes?: { low: number; high: number };
    full_optimization?: { low: number; high: number };
    ongoing_monthly?: { low: number; high: number };
    initial_development?: { low: number; high: number };
    annual_maintenance?: { low: number; high: number };
    marketing_launch?: { low: number; high: number };
    currency: string;
    payment_structure?: string;
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
  security_analysis?: {
    https_status: string;
    headers_analysis: string;
    cookie_policy: string;
    vulnerabilities: string[];
  };
  competitor_insights?: {
    industry_standards: string;
    missing_features: string;
    unique_strengths: string;
  };
  technical_recommendations?: Array<{
    area: string;
    current_state: string;
    recommendation: string;
    implementation: string;
  }>;
  priority_matrix?: {
    quick_wins: string[];
    major_projects: string[];
    fill_ins: string[];
    thankless_tasks?: string[];
  };
  target_audience_analysis?: {
    demographics: string;
    behaviors: string;
    pain_points: string;
    expectations: string;
  };
  competitor_benchmarking?: {
    industry_leaders: string[];
    common_features: string[];
    differentiation_opportunities: string[];
  };
  technical_architecture?: {
    recommended_stack: {
      frontend: string;
      backend: string;
      cms: string;
      hosting: string;
    };
    integrations: string[];
    security_measures: string[];
  };
  content_strategy?: {
    key_pages: string[];
    content_types: string[];
    seo_foundation: string;
    conversion_paths: string[];
  };
  design_direction?: {
    style: string;
    color_psychology: string;
    ui_patterns: string[];
    accessibility_level: string;
  };
  implementation_roadmap?: {
    [phase: string]: {
      duration?: string;
      deliverables?: string[];
      activities?: string[];
    };
  };
  success_metrics?: {
    kpis: string[];
    tracking_setup: string;
    review_schedule: string;
  };
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
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
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
  });

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
      } catch (error) {
        console.error("Failed to save result to localStorage:", error);
      }
    }
  }, [result]);

  // Load last result on mount (optional - can be removed if not desired)
  useEffect(() => {
    try {
      const savedResults = JSON.parse(
        localStorage.getItem("audit-results") || "[]"
      );
      if (savedResults.length > 0 && !result) {
        // Optionally restore last result - commented out by default
        // setResult(savedResults[0]);
      }
    } catch (error) {
      console.error("Failed to load saved results:", error);
    }
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const handleUrlSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLoadingStage("connecting");
    setLoadingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      // Stage 1: Connecting
      setLoadingStage("connecting");
      setLoadingProgress(10);

      // Stage 2: Scraping
      setTimeout(() => {
        if (isLoading) {
          setLoadingStage("scraping");
          setLoadingProgress(30);
        }
      }, 1000);

      // Stage 3: Analyzing
      setTimeout(() => {
        if (isLoading) {
          setLoadingStage("analyzing");
          setLoadingProgress(60);
        }
      }, 3000);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      setAbortController(controller);
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "audit",
          url: url.trim(),
          model: selectedModel,
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
        console.error("Invalid response data:", data);
        throw new Error("Kunde inte hämta resultat från servern");
      }

      if (!data.success) {
        throw new Error(data.error || "Analysen misslyckades");
      }

      setLoadingProgress(100);
      setTimeout(() => {
        setResult(data.result);
        setMode("results");
        showToast("Analysen är klar! 🎉", "success");
      }, 500);
    } catch (error) {
      console.error("Audit error:", error);
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
      clearInterval(progressInterval);
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

    try {
      setLoadingStage("analyzing");
      setLoadingProgress(30);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      setAbortController(controller);
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "questions",
          answers,
          model: selectedModel,
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
        console.error("Invalid response data structure:", data);
        throw new Error(
          "Kunde inte hämta resultat från servern - ogiltigt svar"
        );
      }

      if (!data.success) {
        throw new Error(data.error || "Analysen misslyckades");
      }

      if (!data.result || typeof data.result !== "object") {
        console.error("Invalid result in response:", data);
        throw new Error(
          "Kunde inte hämta resultat från servern - saknar resultat"
        );
      }

      // Validate result has required fields
      if (!data.result.audit_type || !data.result.cost) {
        console.error("Result missing required fields:", {
          hasAuditType: !!data.result.audit_type,
          hasCost: !!data.result.cost,
          resultKeys: Object.keys(data.result),
        });
        throw new Error(
          "Kunde inte hämta resultat från servern - ogiltigt resultatformat"
        );
      }

      setLoadingProgress(100);
      setTimeout(() => {
        setResult(data.result);
        setMode("results");
        showToast("Analysen är klar! 🎉", "success");
      }, 500);
    } catch (error) {
      console.error("Recommendation error:", error);
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
      clearInterval(progressInterval);
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
    } catch (error) {
      console.error("Failed to copy link:", error);
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
      console.error("Invalid result structure for JSON download:", result);
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
      console.error("Failed to download JSON:", error);
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
      console.error("Invalid result structure for PDF download:", result);
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
      console.error("Failed to download PDF:", error);
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
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
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
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
                          duration: 5,
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
                      <option value="gpt-4o-mini" className="bg-gray-900">
                        Snabb analys (~0.2 SEK) - Rekommenderad
                      </option>
                      <option value="gpt-4o" className="bg-gray-900">
                        Premium analys (~3 SEK)
                      </option>
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
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {selectedModel === "gpt-4o-mini" &&
                      "⚡ Snabb grundläggande analys för översikt - Perfekt för de flesta användningsfall"}
                    {selectedModel === "gpt-4o" &&
                      "💎 Premium kvalitet med balanserad hastighet - Bästa resultatet"}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotateY: -30 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                  >
                    <Card3D intensity={18} className="w-full">
                      <motion.button
                        onClick={() => setMode("audit")}
                        className="group relative p-8 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded-3xl hover:border-blue-400/60 transition-all duration-300 w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </motion.button>
                    </Card3D>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 30 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  >
                    <Card3D intensity={18} className="w-full">
                      <motion.button
                        onClick={() => setMode("questions")}
                        className="group relative p-8 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-400/30 rounded-3xl hover:border-purple-400/60 transition-all duration-300 w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 3,
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
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
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
                          let value = e.target.value.trim();
                          // Auto-add https:// if missing
                          if (value && !value.match(/^https?:\/\//i)) {
                            value = `https://${value}`;
                          }
                          setUrl(value);
                        }}
                        onBlur={(e) => {
                          let value = e.target.value.trim();
                          // Validate and normalize URL
                          if (value && !value.match(/^https?:\/\//i)) {
                            value = `https://${value}`;
                            setUrl(value);
                          }
                        }}
                        placeholder="https://exempel.se"
                        className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40"
                        required
                        disabled={isLoading}
                        pattern="https?://.+"
                        title="Ange en giltig URL (t.ex. https://exempel.se)"
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
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
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
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${
                            ((currentQuestion + 1) / questions.length) * 100
                          }%`,
                        }}
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
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white"
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
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl focus:border-white/40 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-white/40 resize-none"
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
                                  className={`p-4 rounded-xl border transition-all ${
                                    answers[
                                      currentQ.id as keyof QuestionAnswers
                                    ] === option
                                      ? "bg-white/20 border-white/40 text-white"
                                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                                  }`}
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
                                  className={`p-4 rounded-xl border transition-all ${
                                    isChecked
                                      ? "bg-white/20 border-white/40 text-white"
                                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                                  }`}
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
                      onClick={() => {
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(currentQuestion + 1);
                        } else {
                          handleQuestionSubmit();
                        }
                      }}
                      disabled={
                        isLoading ||
                        (currentQ.id === "industry"
                          ? !answers.industry || !answers.industryDescription
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 1, delay: 0.2, type: "spring" }}
                      className="mb-12 relative"
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-3xl" />

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
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 4,
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
