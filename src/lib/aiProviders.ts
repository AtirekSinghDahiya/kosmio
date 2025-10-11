/**
 * Multi-Provider AI Service
 * Routes requests to correct AI provider based on model selection
 * Includes comprehensive error handling and fallback options
 */

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

/**
 * Main AI call function with automatic fallback
 */
export const callAI = async (
  messages: AIMessage[],
  modelId: string
): Promise<AIResponse> => {
  const modelToProvider: Record<string, { provider: string; model: string; fallback?: string }> = {
    'gpt-4': { provider: 'openai', model: 'gpt-4o', fallback: 'gpt-3.5-turbo' },
    'gpt-4o': { provider: 'openai', model: 'gpt-4o', fallback: 'gpt-3.5-turbo' },
    'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo-preview', fallback: 'gpt-3.5-turbo' },
    'gpt-3.5-turbo': { provider: 'openai', model: 'gpt-3.5-turbo' },
    'claude-3-opus': { provider: 'claude', model: 'claude-3-opus-20240229', fallback: 'claude-3-haiku' },
    'claude-3-sonnet': { provider: 'claude', model: 'claude-3-5-sonnet-20241022', fallback: 'claude-3-haiku' },
    'claude-3-5-sonnet-20241022': { provider: 'claude', model: 'claude-3-5-sonnet-20241022', fallback: 'claude-3-haiku' },
    'claude-3-haiku': { provider: 'claude', model: 'claude-3-haiku-20240307' },
    'gemini-pro': { provider: 'gemini', model: 'gemini-1.5-pro', fallback: 'grok-2' },
    'gemini-flash': { provider: 'gemini', model: 'gemini-1.5-flash-latest', fallback: 'grok-2' },
    'deepseek-chat': { provider: 'deepseek', model: 'deepseek-chat' },
    'deepseek-coder': { provider: 'deepseek', model: 'deepseek-coder' },
    'grok-2': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    'moonshot-v1': { provider: 'kimi', model: 'moonshot-v1-8k' },
    'kimi': { provider: 'kimi', model: 'moonshot-v1-8k' },
  };

  const config = modelToProvider[modelId] || modelToProvider['grok-2'];

  try {
    console.log(`🤖 Calling ${config.provider} with model: ${config.model}`);

    switch (config.provider) {
      case 'openai':
        return await callOpenAI(messages, config.model);
      case 'claude':
        return await callClaude(messages, config.model);
      case 'gemini':
        return await callGemini(messages, config.model);
      case 'deepseek':
        return await callDeepSeek(messages, config.model);
      case 'groq':
        return await callGrok(messages, config.model);
      case 'kimi':
        return await callKimi(messages, config.model);
      default:
        return await callOpenAI(messages, 'gpt-4o');
    }
  } catch (error: any) {
    console.error(`❌ Error with ${config.provider}:`, error.message);

    // If primary fails and it's not already Groq, try Groq as fallback
    if (modelId !== 'grok-2') {
      try {
        console.log(`🔄 Trying Groq fallback...`);
        const result = await callGrok(messages, 'llama-3.3-70b-versatile');
        console.log(`✅ Groq fallback succeeded`);

        return {
          ...result,
          content: result.content + `\n\n_Note: Responded using Groq (${config.provider} unavailable)_`
        };
      } catch (fallbackError: any) {
        console.error(`❌ Groq fallback failed:`, fallbackError.message);
      }
    }

    // All fallbacks failed - return user-friendly error
    const isQuotaError = error.message.includes('quota') ||
                        error.message.includes('exceeded') ||
                        error.message.includes('rate limit');

    if (isQuotaError) {
      throw new Error(`AI service temporarily unavailable. ${config.provider}: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.

Please check:
1. API key is configured in .env
2. API key is valid
3. Check browser console for details

All fallback providers also failed. Please try again later or contact support.`);
    }

    throw new Error(`AI service temporarily unavailable. ${error.message || 'Please try again later.'}`);
  }
};

/**
 * Check if API key is valid
 */
function isValidApiKey(key: string | undefined): boolean {
  return !!key && !key.includes('your-') && !key.includes('YOUR_') && key.length > 10;
}

/**
 * OpenAI API calls
 */
async function callOpenAI(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  console.log('🔵 OpenAI API Key present:', !!apiKey);
  console.log('🔵 OpenAI API Key length:', apiKey?.length || 0);

  if (!isValidApiKey(apiKey)) {
    throw new Error('OpenAI API key not configured. Please add your API key in .env file.');
  }

  console.log('🔵 Calling OpenAI API with model:', model);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log('🔵 OpenAI Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔵 OpenAI Error response:', errorText);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {}
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      throw new Error(`OpenAI: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('🔵 OpenAI Success! Response length:', data.choices[0].message.content.length);

    return {
      content: data.choices[0].message.content,
      provider: 'OpenAI',
      model,
    };
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('OpenAI: Network error - could not reach API. Check your internet connection.');
    }
    throw error;
  }
}

/**
 * Claude API calls
 */
async function callClaude(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error('Claude API key not configured. Please add your API key in .env file.');
  }

  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: nonSystemMessages,
      system: systemMessage?.content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error: ${response.status}`;
    throw new Error(`Claude ${errorMessage}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'Anthropic',
    model,
  };
}

/**
 * Gemini API calls
 */
async function callGemini(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error('Gemini API key not configured. Please add your API key in .env file.');
  }

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  // Fix model name - remove 'models/' prefix if present
  const cleanModel = model.replace('models/', '');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error: ${response.status}`;
    throw new Error(`Gemini ${errorMessage}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Gemini returned invalid response format');
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    provider: 'Google',
    model,
  };
}

/**
 * DeepSeek API calls
 */
async function callDeepSeek(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error('DeepSeek API key not configured. Please add your API key in .env file.');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error: ${response.status}`;
    throw new Error(`DeepSeek ${errorMessage}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'DeepSeek',
    model,
  };
}

/**
 * Grok API calls (via Groq API - they use similar format)
 */
async function callGrok(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error('Grok API key not configured. Please add your API key in .env file.');
  }

  // Groq uses their own endpoint (not x.ai)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Use Groq's model instead
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error: ${response.status}`;
    throw new Error(`Groq ${errorMessage}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'Groq',
    model: 'llama-3.3-70b',
  };
}

/**
 * Kimi API calls
 */
async function callKimi(messages: AIMessage[], model: string): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_KIMI_API_KEY;

  if (!isValidApiKey(apiKey)) {
    throw new Error('Kimi API key not configured. Please add your API key in .env file.');
  }

  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error: ${response.status}`;
    throw new Error(`Kimi ${errorMessage}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'Moonshot',
    model,
  };
}

/**
 * Context-aware prompt enhancement
 * Enhances prompts based on detected intent (code, design, video, voice)
 */
export const enhancePrompt = async (
  prompt: string,
  context: 'general' | 'code' | 'design' | 'video' | 'voice',
  modelId: string = 'grok-2'
): Promise<string> => {
  const contextInstructions: Record<string, string> = {
    general: 'Make this prompt more clear, detailed, and effective.',
    code: 'Enhance this coding prompt by adding: specific technologies/languages, expected features, code structure preferences, and any constraints. Make it developer-friendly.',
    design: 'Enhance this design prompt by adding: visual style (modern/minimalist/etc), color preferences, target audience, dimensions/format, and specific design elements desired.',
    video: 'Enhance this video prompt by adding: video length, format (MP4/MOV), resolution, style (cinematic/documentary), transitions needed, and any specific effects.',
    voice: 'Enhance this voice prompt by adding: voice characteristics (tone, gender, age), speech pace, emotion/mood, language/accent, and intended use case.',
  };

  const instruction = contextInstructions[context] || contextInstructions.general;

  try {
    // Use Groq for fast enhancement
    const response = await callGrok([
      {
        role: 'system',
        content: 'You are an expert prompt engineer. Your task is to enhance user prompts to make them more effective for AI processing. Return ONLY the enhanced prompt without quotes or explanations.',
      },
      {
        role: 'user',
        content: `${instruction}\n\nOriginal prompt: "${prompt}"\n\nReturn ONLY the enhanced prompt, no explanations or quotes.`,
      },
    ], 'llama-3.3-70b-versatile');

    const enhanced = response.content.trim().replace(/^["']|["']$/g, '');
    return enhanced || prompt;
  } catch (error: any) {
    console.error('Enhancement failed:', error);
    // Return original prompt if enhancement fails
    return prompt;
  }
};
