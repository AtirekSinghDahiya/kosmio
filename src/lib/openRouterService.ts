/**
 * OpenRouter AI Service
 * All models via OpenRouter with free/paid tier routing
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost?: number;
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Validate API key on module load
if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
  console.error('❌ [OpenRouter] Invalid or missing API key. Please set VITE_OPENAI_API_KEY in .env file');
}

// Model mappings: free tier vs paid tier
const MODEL_MAP: Record<string, { free: string; paid: string }> = {
  'claude-sonnet': {
    free: 'anthropic/claude-haiku-4.5',
    paid: 'anthropic/claude-sonnet-4.5'
  },
  'claude-3.5-sonnet': {
    free: 'anthropic/claude-haiku-4.5',
    paid: 'anthropic/claude-sonnet-4.5'
  },
  'gpt-5': {
    free: 'openai/codex-mini',
    paid: 'openai/gpt-5-chat'
  },
  'gpt-5-chat': {
    free: 'openai/codex-mini',
    paid: 'openai/gpt-5-chat'
  },
  'gpt-5-codex': {
    free: 'openai/codex-mini',
    paid: 'openai/gpt-5-codex'
  },
  'chatgpt': {
    free: 'openai/codex-mini',
    paid: 'openai/gpt-5-chat'
  },
  'grok-2': {
    free: 'x-ai/grok-4-fast',
    paid: 'x-ai/grok-4-fast'
  },
  'grok-4': {
    free: 'x-ai/grok-4-fast',
    paid: 'x-ai/grok-4-fast'
  },
  'grok': {
    free: 'x-ai/grok-4-fast',
    paid: 'x-ai/grok-4-fast'
  },
  'deepseek': {
    free: 'deepseek/deepseek-chat-v3.1:free',
    paid: 'deepseek/deepseek-v3.2-exp'
  },
  'deepseek-v3': {
    free: 'deepseek/deepseek-chat-v3.1:free',
    paid: 'deepseek/deepseek-v3.2-exp'
  },
  'gemini': {
    free: 'google/gemini-2.5-flash-lite-preview-09-2025',
    paid: 'google/gemini-2.5-flash-image'
  },
  'gemini-flash': {
    free: 'google/gemini-2.5-flash-lite-preview-09-2025',
    paid: 'google/gemini-2.5-flash-image'
  },
  'kimi': {
    free: 'moonshotai/kimi-k2:free',
    paid: 'moonshotai/kimi-k2-0905:exacto'
  },
  'kimi-k2': {
    free: 'moonshotai/kimi-k2:free',
    paid: 'moonshotai/kimi-k2-0905:exacto'
  },
  'nemotron': {
    free: 'nvidia/nemotron-nano-9b-v2:free',
    paid: 'nvidia/llama-3.3-nemotron-super-49b-v1.5'
  },
  'nemotron-super': {
    free: 'nvidia/nemotron-nano-9b-v2:free',
    paid: 'nvidia/llama-3.3-nemotron-super-49b-v1.5'
  },
  'qwen': {
    free: 'qwen/qwen3-vl-30b-a3b-thinking',
    paid: 'qwen/qwen3-vl-32b-instruct'
  },
  'qwen-thinking': {
    free: 'qwen/qwen3-vl-30b-a3b-thinking',
    paid: 'qwen/qwen3-vl-32b-instruct'
  },
  'llama': {
    free: 'meta-llama/llama-4-maverick:free',
    paid: 'meta-llama/llama-4-maverick'
  },
  'llama-4': {
    free: 'meta-llama/llama-4-maverick:free',
    paid: 'meta-llama/llama-4-maverick'
  },
  'liquid': {
    free: 'liquid/lfm2-8b-a1b',
    paid: 'liquid/lfm2-8b-a1b'
  },
  'granite': {
    free: 'ibm-granite/granite-4.0-h-micro',
    paid: 'ibm-granite/granite-4.0-h-micro'
  },
  'ernie': {
    free: 'baidu/ernie-4.5-21b-a3b-thinking',
    paid: 'baidu/ernie-4.5-21b-a3b-thinking'
  },
  'glm': {
    free: 'z-ai/glm-4.6',
    paid: 'z-ai/glm-4.6'
  },
};

function log(level: 'info' | 'success' | 'error', message: string) {
  const emoji = { info: '🔵', success: '✅', error: '❌' }[level];
  console.log(`${emoji} [OpenRouter] ${message}`);
}

/**
 * Get the appropriate model based on user's payment status
 */
function getModelForUser(modelId: string, isPaidUser: boolean): string {
  const modelMapping = MODEL_MAP[modelId] || MODEL_MAP['grok-2'];
  const selectedModel = isPaidUser ? modelMapping.paid : modelMapping.free;

  log('info', `User tier: ${isPaidUser ? 'PAID' : 'FREE'}`);
  log('info', `Selected model: ${selectedModel} (requested: ${modelId})`);

  return selectedModel;
}

/**
 * Call OpenRouter API with the selected model
 */
export async function callOpenRouter(
  messages: Message[],
  modelId: string,
  isPaidUser: boolean = false
): Promise<AIResponse> {
  const openRouterModel = getModelForUser(modelId, isPaidUser);

  log('info', `Calling model: ${openRouterModel}`);
  log('info', `API Key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://kroniq.ai',
        'X-Title': 'KroniQ AI Platform',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    log('info', `Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `API error: ${errorText.substring(0, 200)}`);

      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {}

      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;

      // Provide helpful error messages for common issues
      if (response.status === 401 || errorMessage.includes('User not found')) {
        throw new Error('OpenRouter: Invalid API key. Please check VITE_OPENAI_API_KEY in your .env file.');
      } else if (response.status === 429) {
        throw new Error('OpenRouter: Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 402) {
        throw new Error('OpenRouter: Insufficient credits. Please add credits to your OpenRouter account.');
      }

      throw new Error(`OpenRouter: ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      log('error', 'Invalid response structure');
      throw new Error('Invalid response from OpenRouter');
    }

    const content = data.choices[0].message.content;
    log('success', `Response received (${content.length} chars)`);

    const providerName = openRouterModel.split('/')[0];
    const displayName = {
      'anthropic': 'Claude',
      'openai': 'ChatGPT',
      'x-ai': 'Grok',
      'deepseek': 'DeepSeek',
      'google': 'Gemini',
      'moonshotai': 'Kimi',
      'nvidia': 'NVIDIA',
      'qwen': 'Qwen',
      'meta-llama': 'Llama',
      'liquid': 'LiquidAI',
      'ibm-granite': 'IBM Granite',
      'baidu': 'ERNIE',
      'z-ai': 'GLM',
    }[providerName] || providerName;

    const usage = data.usage ? {
      prompt_tokens: data.usage.prompt_tokens || 0,
      completion_tokens: data.usage.completion_tokens || 0,
      total_tokens: data.usage.total_tokens || 0,
    } : undefined;

    const cost = data.usage?.cost || 0;

    return {
      content,
      provider: displayName,
      model: openRouterModel,
      usage,
      cost,
    };
  } catch (error: any) {
    log('error', `Exception: ${error.message}`);

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot reach OpenRouter API. Check your internet connection.');
    }

    throw error;
  }
}

/**
 * Main function to get AI response
 */
export async function getOpenRouterResponse(
  userMessage: string,
  conversationHistory: Message[] = [],
  systemPrompt?: string,
  selectedModel: string = 'grok-2',
  isPaidUser: boolean = false
): Promise<AIResponse> {
  log('info', `Getting response for model: ${selectedModel}`);
  log('info', `User tier: ${isPaidUser ? 'PAID' : 'FREE'}`);
  log('info', `History length: ${conversationHistory.length}`);

  const messages: Message[] = [
    {
      role: 'system',
      content: systemPrompt || 'You are KroniQ AI, a friendly and intelligent assistant. Be helpful, conversational, and provide accurate information.',
    },
    ...conversationHistory.slice(-10),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const response = await callOpenRouter(messages, selectedModel, isPaidUser);
  return response;
}

/**
 * Check if a model supports image generation
 */
export function supportsImageGeneration(modelId: string): boolean {
  const imageGenModels = ['gpt-5-image', 'chatgpt-image', 'gemini', 'gemini-flash'];
  return imageGenModels.some(m => modelId.includes(m));
}

/**
 * Check if a model supports images
 */
export function supportsImages(modelId: string): boolean {
  const imageModels = ['claude-sonnet', 'gpt-5-image', 'chatgpt-image', 'grok', 'gemini', 'qwen', 'llama'];
  return imageModels.some(m => modelId.includes(m));
}

/**
 * Generate image using AI models that support image generation
 */
export async function generateImageWithAI(
  prompt: string,
  modelId: string = 'gpt-5-image',
  isPaidUser: boolean = false
): Promise<{ url: string; model: string }> {
  log('info', `Generating image with model: ${modelId}`);

  const openRouterModel = getModelForUser(modelId, isPaidUser);

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://kroniq.ai',
        'X-Title': 'KroniQ AI Platform',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are an AI image generator. When given a prompt, generate a detailed, high-quality image. Respond with a description of the generated image.',
          },
          {
            role: 'user',
            content: `Generate an image: ${prompt}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    log('success', `Image generated with ${modelId}`);

    return {
      url: content,
      model: openRouterModel,
    };
  } catch (error: any) {
    log('error', `Image generation failed: ${error.message}`);
    throw error;
  }
}
