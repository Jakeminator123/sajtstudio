export interface ModelOption {
  id: string
  label: string
  tier: 'fast' | 'balanced' | 'premium' | 'expert'
  description: string
  approxCostSek: number
  recommended?: boolean
  supportsWebSearch: boolean
  capabilities: string[]
  speed: 'snabb' | 'medium' | 'långsam'
  reasoning: 'minimal' | 'standard' | 'avancerad' | 'djup'
}

/**
 * Simplified model options based on  documentation.
 *
 * According to the docs:
 * - GPT-5 family: gpt-5, gpt-5-mini, gpt-5-nano (best for complex reasoning)
 * - GPT-4o family: gpt-4o, gpt-4o-mini (reliable, fast, definitely available)
 * - GPT-4.1 family: gpt-4.1, gpt-4.1-mini (upgrade from 4o)
 *
 * We keep it simple with 4 clear tiers based on use case.
 */
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gpt-4o-mini',
    label: '⚡ Snabb',
    tier: 'fast',
    description: 'Snabbast och billigast. Perfekt för enklare analyser.',
    approxCostSek: 0.2,
    supportsWebSearch: true,
    capabilities: ['Snabb respons', 'Låg kostnad', 'Grundläggande analys'],
    speed: 'snabb',
    reasoning: 'minimal',
  },
  {
    id: 'gpt-4o',
    label: '✨ Standard',
    tier: 'balanced',
    description: 'Bästa balans mellan kvalitet och kostnad. Rekommenderas.',
    approxCostSek: 2.5,
    recommended: true,
    supportsWebSearch: true,
    capabilities: ['Hög kvalitet', 'Detaljerad analys', 'Pålitlig'],
    speed: 'medium',
    reasoning: 'standard',
  },
  {
    id: 'gpt-5-mini',
    label: '🚀 Premium',
    tier: 'premium',
    description: 'Avancerad analys med bättre resonemang och djupare insikter.',
    approxCostSek: 4.0,
    supportsWebSearch: true,
    capabilities: ['Avancerad reasoning', 'Djupare insikter', 'Kodexpertis'],
    speed: 'medium',
    reasoning: 'avancerad',
  },
  {
    id: 'gpt-5',
    label: '🧠 Expert',
    tier: 'expert',
    description: 'Maximal kvalitet för komplexa analyser. Tar längre tid.',
    approxCostSek: 8.0,
    supportsWebSearch: true,
    capabilities: ['Djup reasoning', 'Komplex problemlösning', 'Bäst kvalitet'],
    speed: 'långsam',
    reasoning: 'djup',
  },
]

// Fallback chain: If a model doesn't exist, try the next one
export const MODEL_FALLBACK_CHAIN: Record<string, string> = {
  'gpt-5': 'gpt-4o',
  'gpt-5-mini': 'gpt-4o',
  'gpt-4.1': 'gpt-4o',
  'gpt-4.1-mini': 'gpt-4o-mini',
}

// Default model: Use gpt-4o which definitely exists and supports web_search
export const DEFAULT_MODEL = 'gpt-4o'
export const ALLOWED_MODEL_IDS = MODEL_OPTIONS.map((option) => option.id)

// Helper to get fallback model
export function getFallbackModel(model: string): string {
  return MODEL_FALLBACK_CHAIN[model] || 'gpt-4o'
}
