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

const MODEL_MAP: Record<string, string> = {
  'claude-sonnet': 'anthropic/claude-sonnet-4.5',
  'claude-3.5-sonnet': 'anthropic/claude-sonnet-4.5',
  'gpt-5': 'openai/gpt-5-chat',
  'gpt-5-chat': 'openai/gpt-5-chat',
  'chatgpt': 'openai/gpt-5-chat',
  'gpt-5-image': 'openai/gpt-5-image-mini',
  'chatgpt-image': 'openai/gpt-5-image-mini',
  'grok-2': 'x-ai/grok-4-fast',
  'grok-4': 'x-ai/grok-4-fast',
  'grok': 'x-ai/grok-4-fast',
  'deepseek': 'deepseek/deepseek-v3.2-exp',
  'deepseek-v3': 'deepseek/deepseek-v3.2-exp',
  'gemini': 'google/gemini-2.5-flash-image',
  'gemini-flash': 'google/gemini-2.5-flash-image',
  'kimi': 'moonshotai/kimi-k2-0905',
  'kimi-k2': 'moonshotai/kimi-k2-0905',
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
  const openRouterModel = MODEL_MAP[modelId] || MODEL_MAP['grok-2'];

  log('info', `Calling model: ${openRouterModel} (requested: ${modelId})`);
  log('info', `API Key: ${OPENROUTER_API_KEY.substring(0, 15)}...`);

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
  selectedModel: string = 'grok-2'
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
 * Check if a model supports images
 */
export function supportsImages(modelId: string): boolean {
  const imageModels = ['claude-sonnet', 'gpt-5-image', 'chatgpt-image', 'grok', 'gemini'];
  return imageModels.some(m => modelId.includes(m));
}
