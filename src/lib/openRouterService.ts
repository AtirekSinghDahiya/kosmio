/**
 * OpenRouter AI Service
 * All models (Claude, GPT, Grok, DeepSeek, Gemini, Kimi) via OpenRouter
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const SITE_URL = 'https://kroniq.ai';
const SITE_NAME = 'KroniQ AI Platform';

const MODEL_MAP: Record<string, string> = {
  'gpt-5-chat': 'openai/gpt-5-chat',
  'gpt-5-codex': 'openai/gpt-5-codex',
  'codex-mini': 'openai/codex-mini',
  'deepseek-v3.2': 'deepseek/deepseek-v3.2-exp',
  'deepseek-v3.1-free': 'deepseek/deepseek-chat-v3.1:free',
  'nemotron-super': 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
  'nemotron-nano-free': 'nvidia/nemotron-nano-9b-v2:free',
  'qwen-vl-32b': 'qwen/qwen3-vl-32b-instruct',
  'qwen-vl-30b-free': 'qwen/qwen3-vl-30b-a3b-thinking',
  'claude-haiku-free': 'anthropic/claude-haiku-4.5',
  'claude-sonnet': 'anthropic/claude-sonnet-4.5',
  'gemini-flash-image': 'google/gemini-2.5-flash-image',
  'gemini-flash-lite-free': 'google/gemini-2.5-flash-lite-preview-09-2025',
  'kimi-k2': 'moonshotai/kimi-k2-0905:exacto',
  'kimi-k2-free': 'moonshotai/kimi-k2:free',
  'llama-4-maverick': 'meta-llama/llama-4-maverick',
  'llama-4-maverick-free': 'meta-llama/llama-4-maverick:free',
  'grok-4-fast': 'x-ai/grok-4-fast',
  'lfm2-8b': 'liquid/lfm2-8b-a1b',
  'granite-4.0': 'ibm-granite/granite-4.0-h-micro',
  'ernie-4.5': 'baidu/ernie-4.5-21b-a3b-thinking',
  'glm-4.6': 'z-ai/glm-4.6',
};

function log(level: 'info' | 'success' | 'error', message: string) {
  const emoji = { info: '🔵', success: '✅', error: '❌' }[level];
  console.log(`${emoji} [OpenRouter] ${message}`);
}

/**
 * Call OpenRouter API with the selected model
 */
export async function callOpenRouter(
  messages: Message[],
  modelId: string
): Promise<AIResponse> {
  const openRouterModel = MODEL_MAP[modelId] || MODEL_MAP['grok-4-fast'] || 'x-ai/grok-4-fast';

  log('info', `Calling model: ${openRouterModel} (requested: ${modelId})`);
  log('info', `API Key length: ${OPENROUTER_API_KEY.length}`);
  log('info', `API Key prefix: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  log('info', `API Base URL: ${OPENROUTER_BASE_URL}`);

  try {
    const requestBody = {
      model: openRouterModel,
      messages: messages,
    };

    log('info', `Request body: ${JSON.stringify(requestBody).substring(0, 200)}`);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    log('info', `Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `HTTP Status: ${response.status}`);
      log('error', `Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      log('error', `Error Response Body: ${errorText}`);

      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
        log('error', `Parsed error data: ${JSON.stringify(errorData)}`);
      } catch (e) {
        log('error', `Could not parse error response as JSON`);
      }

      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${errorText.substring(0, 100)}`;

      // Add more context to the error
      if (response.status === 401 || response.status === 403) {
        throw new Error(`OpenRouter Authentication Error: ${errorMessage}. Please check your API key.`);
      }

      throw new Error(`OpenRouter API Error: ${errorMessage}`);
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
      'openai': 'OpenAI',
      'x-ai': 'Grok',
      'deepseek': 'DeepSeek',
      'google': 'Gemini',
      'moonshotai': 'Kimi',
      'nvidia': 'NVIDIA',
      'qwen': 'Qwen',
      'meta-llama': 'Meta',
      'liquid': 'LiquidAI',
      'ibm-granite': 'IBM',
      'baidu': 'Baidu',
      'z-ai': 'Z.AI',
    }[providerName] || providerName;

    return {
      content,
      provider: displayName,
      model: openRouterModel,
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
  selectedModel: string = 'grok-4-fast'
): Promise<string> {
  log('info', `Getting response for model: ${selectedModel}`);
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

  const response = await callOpenRouter(messages, selectedModel);
  return response.content;
}

/**
 * Get AI response with usage data
 */
export async function getOpenRouterResponseWithUsage(
  userMessage: string,
  conversationHistory: Message[] = [],
  systemPrompt?: string,
  selectedModel: string = 'grok-4-fast'
): Promise<AIResponse> {
  log('info', `Getting response for model: ${selectedModel}`);
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

  return await callOpenRouter(messages, selectedModel);
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
  const imageModels = ['claude-sonnet', 'gpt-5-image', 'chatgpt-image', 'grok', 'gemini'];
  return imageModels.some(m => modelId.includes(m));
}

/**
 * Generate image using AI models that support image generation (GPT-5, Gemini)
 */
export async function generateImageWithAI(
  prompt: string,
  modelId: string = 'gpt-5-image'
): Promise<{ url: string; model: string }> {
  log('info', `Generating image with model: ${modelId}`);

  const openRouterModel = MODEL_MAP[modelId] || MODEL_MAP['gpt-5-image'];

  try {
    const requestBody = {
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
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
