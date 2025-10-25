export interface ModelTokenCost {
  id: string;
  name: string;
  provider: string;
  tokensPerMessage: number;
  costPerMessage: number;
  tier: 'free' | 'budget' | 'mid' | 'premium' | 'ultra-premium';
  description: string;
  icon: string;
}

export const MODEL_TOKEN_COSTS: Record<string, ModelTokenCost> = {
  'grok-4-fast': {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    provider: 'X.AI',
    tokensPerMessage: 20,
    costPerMessage: 0.0002,
    tier: 'free',
    description: 'Lightning fast, minimal cost',
    icon: '⚡'
  },
  'gemini-flash-lite-free': {
    id: 'gemini-flash-lite-free',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    tokensPerMessage: 25,
    costPerMessage: 0.00025,
    tier: 'free',
    description: 'Fast multimodal AI',
    icon: '✨'
  },
  'deepseek-v3.1-free': {
    id: 'deepseek-v3.1-free',
    name: 'DeepSeek V3.1 Free',
    provider: 'DeepSeek',
    tokensPerMessage: 15,
    costPerMessage: 0.00015,
    tier: 'free',
    description: 'Efficient and smart',
    icon: '🧠'
  },
  'llama-4-maverick-free': {
    id: 'llama-4-maverick-free',
    name: 'Llama 4 Maverick Free',
    provider: 'Meta',
    tokensPerMessage: 30,
    costPerMessage: 0.0003,
    tier: 'free',
    description: 'Latest Llama, free tier',
    icon: '🦙'
  },
  'nemotron-nano-free': {
    id: 'nemotron-nano-free',
    name: 'Nemotron Nano 9B V2',
    provider: 'NVIDIA',
    tokensPerMessage: 28,
    costPerMessage: 0.00028,
    tier: 'free',
    description: 'Fast nano model',
    icon: '🚀'
  },
  'qwen-vl-30b-free': {
    id: 'qwen-vl-30b-free',
    name: 'Qwen3 VL 30B Thinking',
    provider: 'Qwen',
    tokensPerMessage: 35,
    costPerMessage: 0.00035,
    tier: 'free',
    description: 'Visual & thinking model',
    icon: '👁️'
  },
  'claude-haiku-free': {
    id: 'claude-haiku-free',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    tokensPerMessage: 40,
    costPerMessage: 0.0004,
    tier: 'free',
    description: 'Fast Claude model',
    icon: '📝'
  },
  'kimi-k2-free': {
    id: 'kimi-k2-free',
    name: 'Kimi K2 Free',
    provider: 'Moonshot',
    tokensPerMessage: 32,
    costPerMessage: 0.00032,
    tier: 'free',
    description: 'Long context support',
    icon: '🌙'
  },
  'codex-mini': {
    id: 'codex-mini',
    name: 'Codex Mini',
    provider: 'OpenAI',
    tokensPerMessage: 38,
    costPerMessage: 0.00038,
    tier: 'free',
    description: 'Lightweight coding',
    icon: '💻'
  },
  'lfm2-8b': {
    id: 'lfm2-8b',
    name: 'LiquidAI LFM2-8B',
    provider: 'LiquidAI',
    tokensPerMessage: 42,
    costPerMessage: 0.00042,
    tier: 'free',
    description: 'Efficient model',
    icon: '💧'
  },
  'granite-4.0': {
    id: 'granite-4.0',
    name: 'Granite 4.0 Micro',
    provider: 'IBM',
    tokensPerMessage: 45,
    costPerMessage: 0.00045,
    tier: 'free',
    description: 'Micro model',
    icon: '🪨'
  },
  'ernie-4.5': {
    id: 'ernie-4.5',
    name: 'ERNIE 4.5 21B Thinking',
    provider: 'Baidu',
    tokensPerMessage: 48,
    costPerMessage: 0.00048,
    tier: 'free',
    description: 'Thinking model',
    icon: '🧩'
  },
  'kimi-k2': {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot',
    tokensPerMessage: 150,
    costPerMessage: 0.015,
    tier: 'budget',
    description: 'Long context, paid tier',
    icon: '🌙'
  },
  'deepseek-v3.2': {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek',
    tokensPerMessage: 180,
    costPerMessage: 0.018,
    tier: 'budget',
    description: 'Advanced DeepSeek',
    icon: '🧠'
  },
  'gemini-flash-image': {
    id: 'gemini-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'Google',
    tokensPerMessage: 200,
    costPerMessage: 0.02,
    tier: 'mid',
    description: 'Image focused',
    icon: '🖼️'
  },
  'qwen-vl-32b': {
    id: 'qwen-vl-32b',
    name: 'Qwen3 VL 32B Instruct',
    provider: 'Qwen',
    tokensPerMessage: 250,
    costPerMessage: 0.025,
    tier: 'mid',
    description: 'Advanced visual model',
    icon: '👁️'
  },
  'gpt-5-chat': {
    id: 'gpt-5-chat',
    name: 'GPT-5 Chat',
    provider: 'OpenAI',
    tokensPerMessage: 400,
    costPerMessage: 0.04,
    tier: 'mid',
    description: 'Latest ChatGPT with images',
    icon: '🤖'
  },
  'nemotron-super': {
    id: 'nemotron-super',
    name: 'Nemotron Super 49B',
    provider: 'NVIDIA',
    tokensPerMessage: 350,
    costPerMessage: 0.035,
    tier: 'mid',
    description: 'Powerful reasoning',
    icon: '🚀'
  },
  'llama-4-maverick': {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    tokensPerMessage: 380,
    costPerMessage: 0.038,
    tier: 'mid',
    description: 'Latest Llama, paid tier',
    icon: '🦙'
  },
  'glm-4.6': {
    id: 'glm-4.6',
    name: 'GLM 4.6',
    provider: 'Z.AI',
    tokensPerMessage: 420,
    costPerMessage: 0.042,
    tier: 'mid',
    description: 'Advanced model',
    icon: '⚙️'
  },
  'gpt-5-codex': {
    id: 'gpt-5-codex',
    name: 'GPT-5 Codex',
    provider: 'OpenAI',
    tokensPerMessage: 600,
    costPerMessage: 0.06,
    tier: 'premium',
    description: 'Best for coding',
    icon: '💻'
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    tokensPerMessage: 3000,
    costPerMessage: 0.30,
    tier: 'premium',
    description: 'Advanced reasoning',
    icon: '🎵'
  },
  'claude-opus': {
    id: 'claude-opus',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    tokensPerMessage: 5500,
    costPerMessage: 0.55,
    tier: 'ultra-premium',
    description: 'Ultimate AI model',
    icon: '👑'
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    tokensPerMessage: 800,
    costPerMessage: 0.08,
    tier: 'premium',
    description: 'High quality images',
    icon: '🎨'
  },
  'stable-diffusion-xl': {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    tokensPerMessage: 500,
    costPerMessage: 0.05,
    tier: 'mid',
    description: 'Open source image gen',
    icon: '🎨'
  },
  'firefly': {
    id: 'firefly',
    name: 'Firefly',
    provider: 'Adobe',
    tokensPerMessage: 700,
    costPerMessage: 0.07,
    tier: 'premium',
    description: 'Commercial safe images',
    icon: '🔥'
  },
  'sora': {
    id: 'sora',
    name: 'Sora',
    provider: 'OpenAI',
    tokensPerMessage: 5000,
    costPerMessage: 0.50,
    tier: 'ultra-premium',
    description: 'Text to video',
    icon: '🎬'
  },
  'eleven-labs': {
    id: 'eleven-labs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    tokensPerMessage: 300,
    costPerMessage: 0.03,
    tier: 'mid',
    description: 'Natural voice synthesis',
    icon: '🎙️'
  }
};

export function getModelCost(modelId: string): ModelTokenCost {
  return MODEL_TOKEN_COSTS[modelId] || MODEL_TOKEN_COSTS['grok-4-fast'];
}

export function calculateTokensForMessage(
  modelId: string,
  messageLength: number = 200
): number {
  const model = getModelCost(modelId);
  const lengthMultiplier = Math.max(1, messageLength / 200);
  return Math.ceil(model.tokensPerMessage * lengthMultiplier);
}

export function isModelFree(modelId: string): boolean {
  const model = getModelCost(modelId);
  return model.tier === 'free';
}

export function getModelsByTier(tier: ModelTokenCost['tier']): ModelTokenCost[] {
  return Object.values(MODEL_TOKEN_COSTS).filter(m => m.tier === tier);
}

export function getTierColor(tier: ModelTokenCost['tier']): string {
  switch (tier) {
    case 'free': return 'text-green-400';
    case 'budget': return 'text-blue-400';
    case 'mid': return 'text-yellow-400';
    case 'premium': return 'text-orange-400';
    case 'ultra-premium': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getTierBadgeColor(tier: ModelTokenCost['tier']): string {
  switch (tier) {
    case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'budget': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'mid': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'premium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'ultra-premium': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function formatTokenDisplay(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function calculateMessagesFromTokens(tokens: number, modelId: string): number {
  const model = getModelCost(modelId);
  return Math.floor(tokens / model.tokensPerMessage);
}

export function estimateMixedUsage(tokens: number): {
  model: string;
  messages: number;
}[] {
  return [
    { model: 'Grok 4 Fast', messages: Math.floor(tokens / 20) },
    { model: 'GPT-5 Chat', messages: Math.floor(tokens / 400) },
    { model: 'Claude Sonnet', messages: Math.floor(tokens / 3000) },
    { model: 'Claude Opus', messages: Math.floor(tokens / 5500) }
  ];
}
