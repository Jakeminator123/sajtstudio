export interface ModelOption {
  id: string;
  label: string;
  tier: "standard" | "premium" | "reasoning";
  description: string;
  approxCostSek: number;
  recommended?: boolean;
  supportsWebSearch?: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gpt-4o",
    label: "Premium (GPT-4o)",
    tier: "premium",
    description:
      "Toppmodell med utmärkt kvalitet och definitivt stöd för web_search i Responses API.",
    approxCostSek: 3.0,
    recommended: true,
    supportsWebSearch: true,
  },
  {
    id: "gpt-4o-mini",
    label: "Snabb (GPT-4o-mini)",
    tier: "standard",
    description:
      "Kostnadseffektiv modell med definitivt stöd för web_search. Rekommenderad för de flesta användningsfall.",
    approxCostSek: 0.2,
    supportsWebSearch: true,
  },
  {
    id: "gpt-5.1-mini",
    label: "Premium (GPT-5.1-mini) - Experimentell",
    tier: "premium",
    description:
      "Nyare modell med tyngre resonemang. Kan saknas i API:et ännu - fallback till gpt-4o om den inte finns.",
    approxCostSek: 1.2,
    supportsWebSearch: true,
  },
  {
    id: "gpt-5.1",
    label: "Expert (GPT-5.1) - Experimentell",
    tier: "premium",
    description:
      "Maximal kvalitet. Kan saknas i API:et ännu - fallback till gpt-4o om den inte finns.",
    approxCostSek: 6.5,
    supportsWebSearch: true,
  },
  {
    id: "gpt-4.1",
    label: "Avancerad (GPT-4.1) - Experimentell",
    tier: "standard",
    description: "Stabil toppmodell enligt ALLA.txt. Kan saknas i API:et ännu.",
    approxCostSek: 3.0,
    supportsWebSearch: true,
  },
  {
    id: "gpt-4.1-mini",
    label: "Snabb (GPT-4.1-mini) - Experimentell",
    tier: "standard",
    description:
      "Standardval från ALLA.txt. Kan saknas i API:et ännu - fallback till gpt-4o-mini om den inte finns.",
    approxCostSek: 0.2,
    supportsWebSearch: true,
  },
];

// Default model: Use gpt-4o which definitely exists and supports web_search
export const DEFAULT_MODEL = "gpt-4o";
export const ALLOWED_MODEL_IDS = MODEL_OPTIONS.map((option) => option.id);
