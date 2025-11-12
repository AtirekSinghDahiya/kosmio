export interface ModelTokenCost {
  id: string;
  name: string;
  provider: string;
  tokensPerMessage: number;
  costPerMessage: number;
  tier: 'free' | 'budget' | 'mid' | 'premium' | 'ultra-premium';
  description: string;
  icon: string;
  logoUrl?: string;
  paidOnly?: boolean;
}

export const MODEL_TOKEN_COSTS: Record<string, ModelTokenCost> = {
  'grok-4-fast': {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    provider: 'X.AI',
    tokensPerMessage: 800,
    costPerMessage: 0.0003,
    tier: 'free',
    description: 'Lightning fast, minimal cost',
    icon: '⚡',
    logoUrl: 'https://pbs.twimg.com/profile_images/1683899100922511378/5lY42eHs_400x400.jpg'
  },
  'gemini-flash-lite-free': {
    id: 'gemini-flash-lite-free',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    tokensPerMessage: 800,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Fast multimodal AI',
    icon: '✨',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'
  },
  'deepseek-v3.1-free': {
    id: 'deepseek-v3.1-free',
    name: 'DeepSeek V3.1 Free',
    provider: 'DeepSeek',
    tokensPerMessage: 800,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Efficient and smart',
    icon: '🧠',
    logoUrl: 'https://github.com/deepseek-ai.png'
  },
  'llama-4-maverick-free': {
    id: 'llama-4-maverick-free',
    name: 'Llama 4 Maverick Free',
    provider: 'Meta',
    tokensPerMessage: 1000,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Latest Llama, free tier',
    icon: '🦙',
    logoUrl: 'https://github.com/meta-llama.png'
  },
  'nemotron-nano-free': {
    id: 'nemotron-nano-free',
    name: 'Nemotron Nano 9B V2',
    provider: 'NVIDIA',
    tokensPerMessage: 700,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Fast nano model',
    icon: '🚀',
    logoUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/02-nvidia-logo-color-blk-500x200-4c25-p@2x.png'
  },
  'qwen-vl-30b-free': {
    id: 'qwen-vl-30b-free',
    name: 'Qwen3 VL 30B Thinking',
    provider: 'Qwen',
    tokensPerMessage: 900,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Visual & thinking model',
    icon: '👁️',
    logoUrl: 'https://avatars.githubusercontent.com/u/135470043'
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    tokensPerMessage: 1200,
    costPerMessage: 0.00068,
    tier: 'free',
    description: 'Fast Claude 3 model',
    icon: '📝',
    logoUrl: 'https://github.com/anthropics.png'
  },
  'perplexity-sonar': {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    provider: 'Perplexity',
    tokensPerMessage: 2000,
    costPerMessage: 0.006,
    tier: 'free',
    description: 'Web search enabled AI',
    icon: '🔍',
    logoUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  'kimi-k2-free': {
    id: 'kimi-k2-free',
    name: 'Kimi K2 Free',
    provider: 'Moonshot',
    tokensPerMessage: 1000,
    costPerMessage: 0.0,
    tier: 'free',
    description: 'Long context support',
    icon: '🌙',
    logoUrl: 'https://github.com/moonshot-ai.png'
  },
  'codex-mini': {
    id: 'codex-mini',
    name: 'Codex Mini',
    provider: 'OpenAI',
    tokensPerMessage: 600,
    costPerMessage: 0.00018,
    tier: 'free',
    description: 'Lightweight coding',
    icon: '💻',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg'
  },
  'lfm2-8b': {
    id: 'lfm2-8b',
    name: 'LiquidAI LFM2-8B',
    provider: 'LiquidAI',
    tokensPerMessage: 500,
    costPerMessage: 0.00009,
    tier: 'free',
    description: 'Efficient model',
    icon: '💧',
    logoUrl: 'https://github.com/liquid-ai.png'
  },
  'granite-4.0': {
    id: 'granite-4.0',
    name: 'Granite 4.0 Micro',
    provider: 'IBM',
    tokensPerMessage: 600,
    costPerMessage: 0.00014,
    tier: 'free',
    description: 'Micro model',
    icon: '🪨',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
  },
  'ernie-4.5': {
    id: 'ernie-4.5',
    name: 'ERNIE 4.5 21B Thinking',
    provider: 'Baidu',
    tokensPerMessage: 850,
    costPerMessage: 0.00022,
    tier: 'free',
    description: 'Thinking model',
    icon: '🧩',
    logoUrl: 'https://github.com/PaddlePaddle.png'
  },
  'kimi-k2': {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot',
    tokensPerMessage: 5000,
    costPerMessage: 0.015,
    tier: 'budget',
    description: 'Long context, paid tier',
    icon: '🌙',
    logoUrl: 'https://github.com/moonshot-ai.png'
  },
  'deepseek-v3.2': {
    id: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek',
    tokensPerMessage: 6000,
    costPerMessage: 0.018,
    tier: 'budget',
    description: 'Advanced DeepSeek',
    icon: '🧠',
    logoUrl: 'https://github.com/deepseek-ai.png'
  },
  'gemini-flash-image': {
    id: 'gemini-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'Google',
    tokensPerMessage: 8000,
    costPerMessage: 0.02,
    tier: 'mid',
    description: 'Image focused',
    icon: '🖼️',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'
  },
  'qwen-vl-32b': {
    id: 'qwen-vl-32b',
    name: 'Qwen3 VL 32B Instruct',
    provider: 'Qwen',
    tokensPerMessage: 10000,
    costPerMessage: 0.025,
    tier: 'mid',
    description: 'Advanced visual model',
    icon: '👁️',
    logoUrl: 'https://avatars.githubusercontent.com/u/135470043'
  },
  'gpt-5-chat': {
    id: 'gpt-5-chat',
    name: 'GPT-5 Chat',
    provider: 'OpenAI',
    tokensPerMessage: 16000,
    costPerMessage: 0.04,
    tier: 'mid',
    description: 'Latest ChatGPT with images',
    icon: '🤖',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg'
  },
  'nemotron-super': {
    id: 'nemotron-super',
    name: 'Nemotron Super 49B',
    provider: 'NVIDIA',
    tokensPerMessage: 14000,
    costPerMessage: 0.035,
    tier: 'mid',
    description: 'Powerful reasoning',
    icon: '🚀',
    logoUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/02-nvidia-logo-color-blk-500x200-4c25-p@2x.png'
  },
  'llama-4-maverick': {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    tokensPerMessage: 15000,
    costPerMessage: 0.038,
    tier: 'mid',
    description: 'Latest Llama, paid tier',
    icon: '🦙',
    logoUrl: 'https://github.com/meta-llama.png'
  },
  'glm-4.6': {
    id: 'glm-4.6',
    name: 'GLM 4.6',
    provider: 'Z.AI',
    tokensPerMessage: 16500,
    costPerMessage: 0.042,
    tier: 'mid',
    description: 'Advanced model',
    icon: '⚙️',
    logoUrl: 'https://avatars.githubusercontent.com/u/48584855'
  },
  'gpt-5-codex': {
    id: 'gpt-5-codex',
    name: 'GPT-5 Codex',
    provider: 'OpenAI',
    tokensPerMessage: 24000,
    costPerMessage: 0.06,
    tier: 'premium',
    description: 'Best for coding',
    icon: '💻',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg'
  },
  'claude-haiku-4.5': {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    tokensPerMessage: 8000,
    costPerMessage: 0.02,
    tier: 'mid',
    description: 'Fast Claude 4.5',
    icon: '📝',
    logoUrl: 'https://github.com/anthropics.png'
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    tokensPerMessage: 120000,
    costPerMessage: 0.30,
    tier: 'premium',
    description: 'Advanced reasoning',
    icon: '🎵',
    logoUrl: 'https://github.com/anthropics.png'
  },
  'kimi-k2-0905': {
    id: 'kimi-k2-0905',
    name: 'Kimi K2 0905',
    provider: 'MoonshotAI',
    tokensPerMessage: 7000,
    costPerMessage: 0.018,
    tier: 'budget',
    description: 'Latest Kimi model',
    icon: '🌙',
    logoUrl: 'https://github.com/moonshot-ai.png'
  },
  'perplexity-sonar-pro': {
    id: 'perplexity-sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'Perplexity',
    tokensPerMessage: 18000,
    costPerMessage: 0.045,
    tier: 'mid',
    description: 'Pro web search with vision',
    icon: '🔍',
    logoUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  'perplexity-sonar-reasoning': {
    id: 'perplexity-sonar-reasoning',
    name: 'Perplexity Sonar Reasoning Pro',
    provider: 'Perplexity',
    tokensPerMessage: 32000,
    costPerMessage: 0.08,
    tier: 'premium',
    description: 'Advanced reasoning with search',
    icon: '🧠',
    logoUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  'perplexity-sonar-deep': {
    id: 'perplexity-sonar-deep',
    name: 'Perplexity Sonar Deep Research',
    provider: 'Perplexity',
    tokensPerMessage: 60000,
    costPerMessage: 0.15,
    tier: 'premium',
    description: 'Deep research capabilities',
    icon: '🔬',
    logoUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
  },
  'claude-opus-4': {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    tokensPerMessage: 200000,
    costPerMessage: 0.50,
    tier: 'ultra-premium',
    description: 'Powerful Opus model',
    icon: '👑',
    logoUrl: 'https://github.com/anthropics.png'
  },
  'claude-opus-4.1': {
    id: 'claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    tokensPerMessage: 220000,
    costPerMessage: 0.55,
    tier: 'ultra-premium',
    description: 'Ultimate AI model',
    icon: '👑',
    logoUrl: 'https://github.com/anthropics.png'
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    tokensPerMessage: 32000,
    costPerMessage: 0.08,
    tier: 'premium',
    description: 'High quality images',
    icon: '🎨',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg'
  },
  'stable-diffusion-xl': {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    tokensPerMessage: 20000,
    costPerMessage: 0.05,
    tier: 'mid',
    description: 'Open source image gen',
    icon: '🎨',
    logoUrl: 'https://github.com/Stability-AI.png'
  },
  'firefly': {
    id: 'firefly',
    name: 'Firefly',
    provider: 'Adobe',
    tokensPerMessage: 28000,
    costPerMessage: 0.07,
    tier: 'premium',
    description: 'Commercial safe images',
    icon: '🔥',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg'
  },
  'sora': {
    id: 'sora',
    name: 'Sora 2',
    provider: 'OpenAI',
    tokensPerMessage: 600000,
    costPerMessage: 0.45,
    tier: 'ultra-premium',
    description: 'Premium text to video (Paid users only)',
    icon: '🎬',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    paidOnly: true
  },
  'veo3': {
    id: 'veo3',
    name: 'Veo 3 Fast',
    provider: 'Google',
    tokensPerMessage: 150000,
    costPerMessage: 0.075,
    tier: 'premium',
    description: 'Google\'s fast video generation',
    icon: '🎥',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'
  },
  'eleven-labs': {
    id: 'eleven-labs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    tokensPerMessage: 12000,
    costPerMessage: 0.03,
    tier: 'mid',
    description: 'Natural voice synthesis',
    icon: '🎙️',
    logoUrl: 'https://github.com/elevenlabs.png'
  }
};

export function getModelCost(modelId: string): ModelTokenCost {
  return MODEL_TOKEN_COSTS[modelId] || {
    id: modelId,
    name: modelId,
    provider: 'Unknown',
    tokensPerMessage: 1000,
    costPerMessage: 0.01,
    tier: 'mid',
    description: 'Unknown model',
    icon: '❓',
  };
}

export function getTierBadgeColor(tier: ModelTokenCost['tier']): string {
  const colors = {
    'free': 'bg-green-500/20 text-green-300 border-green-500/30',
    'budget': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'mid': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'premium': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'ultra-premium': 'bg-red-500/20 text-red-300 border-red-500/30'
  };
  return colors[tier] || colors.mid;
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

export function isModelFree(modelId: string): boolean {
  const model = MODEL_TOKEN_COSTS[modelId];
  return model?.tier === 'free';
}

export function isModelPaidOnly(modelId: string): boolean {
  const model = MODEL_TOKEN_COSTS[modelId];
  return model?.paidOnly === true;
}

export function estimateMixedUsage(chatMessages: number, imageGenerations: number, videoSeconds: number): number {
  const chatTokens = chatMessages * 1000;
  const imageTokens = imageGenerations * 10000;
  const videoTokens = videoSeconds * 1000;
  return chatTokens + imageTokens + videoTokens;
}

export function calculateTokensForMessage(message: string, modelId: string): number {
  const model = getModelCost(modelId);
  const baseTokens = Math.ceil(message.length / 4);
  return baseTokens + (model.tokensPerMessage * 0.1);
}
