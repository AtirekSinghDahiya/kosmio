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
    console.error(`❌ Primary provider (${config.provider}) failed:`, error.message);
    console.log(`🔄 Starting intelligent fallback system...`);

    // UNIVERSAL FALLBACK: Try ALL available providers (ordered by speed & reliability)
    const universalFallbackChain = [
      { provider: 'groq', model: 'llama-3.3-70b-versatile', name: 'Groq (Llama 3.3)', speed: 'ultra-fast' },
      { provider: 'gemini', model: 'gemini-1.5-flash-latest', name: 'Google Gemini Flash', speed: 'fast' },
      { provider: 'deepseek', model: 'deepseek-chat', name: 'DeepSeek Chat', speed: 'fast' },
      { provider: 'claude', model: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', speed: 'fast' },
      { provider: 'gemini', model: 'gemini-1.5-pro', name: 'Google Gemini Pro', speed: 'medium' },
      { provider: 'claude', model: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', speed: 'medium' },
      { provider: 'kimi', model: 'moonshot-v1-8k', name: 'Kimi (Moonshot)', speed: 'medium' },
    ];

    let attemptCount = 0;
    const primaryProviderName = config.provider;

    // Try each fallback provider
    for (const fallback of universalFallbackChain) {
      // Skip if this is the same provider that just failed
      if (fallback.provider === primaryProviderName) {
        console.log(`⏭️ Skipping ${fallback.name} (was primary provider)`);
        continue;
      }

      attemptCount++;

      try {
        console.log(`🔄 Attempt ${attemptCount}: Trying ${fallback.name} (${fallback.speed})...`);

        const result = await callProviderByName(fallback.provider, messages, fallback.model);

        console.log(`✅ SUCCESS! ${fallback.name} responded!`);
        console.log(`📊 Fallback Stats: Primary failed, succeeded on attempt ${attemptCount}/${universalFallbackChain.length}`);

        // Add friendly note to user
        return {
          ...result,
          content: result.content + `\n\n_✨ Responded using ${fallback.name} (${primaryProviderName} was unavailable)_`
        };
      } catch (fallbackError: any) {
        console.warn(`⚠️ ${fallback.name} failed:`, fallbackError.message?.substring(0, 100));
        // Continue to next provider
      }
    }

    // All providers failed - construct helpful error message
    console.error(`❌ COMPLETE FAILURE: All ${attemptCount} fallback providers failed`);

    const isQuotaError = error.message.includes('quota') ||
                        error.message.includes('exceeded') ||
                        error.message.includes('rate limit');

    const isNetworkError = error.message.includes('Failed to fetch') ||
                          error.message.includes('Network') ||
                          error.message.includes('CORS');

    let errorMessage = `⚠️ Unable to get AI response after trying ${attemptCount + 1} providers.\n\n`;

    if (isQuotaError) {
      errorMessage += `**Primary Issue:** ${primaryProviderName} quota/rate limit exceeded\n\n`;
      errorMessage += `**What we tried:**\n`;
      errorMessage += `- Groq (Free)\n`;
      errorMessage += `- Google Gemini\n`;
      errorMessage += `- DeepSeek\n`;
      errorMessage += `- Claude\n`;
      errorMessage += `- Kimi\n\n`;
      errorMessage += `**Next Steps:**\n`;
      errorMessage += `1. Wait 1-2 minutes and try again\n`;
      errorMessage += `2. Check your API keys in .env file\n`;
      errorMessage += `3. Get a free Groq key: console.groq.com\n`;
      errorMessage += `4. Try refreshing the page`;
    } else if (isNetworkError) {
      errorMessage += `**Primary Issue:** Network/connection problem\n\n`;
      errorMessage += `**Please check:**\n`;
      errorMessage += `1. Internet connection is stable\n`;
      errorMessage += `2. No firewall blocking API requests\n`;
      errorMessage += `3. VPN is not causing issues\n`;
      errorMessage += `4. Browser extensions (try disabling)\n`;
      errorMessage += `5. Try incognito/private mode`;
    } else {
      errorMessage += `**Error:** ${error.message}\n\n`;
      errorMessage += `**Tried:** Groq, Gemini, DeepSeek, Claude, Kimi\n\n`;
      errorMessage += `**Check:**\n`;
      errorMessage += `1. Browser console (F12) for detailed errors\n`;
      errorMessage += `2. API keys are valid in .env file\n`;
      errorMessage += `3. Try refreshing the page\n`;
      errorMessage += `4. Contact support if issue persists`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Helper function to call provider by name
 */
async function callProviderByName(
  provider: string,
  messages: AIMessage[],
  model: string
): Promise<AIResponse> {
  switch (provider) {
    case 'openai':
      return await callOpenAI(messages, model);
    case 'claude':
      return await callClaude(messages, model);
    case 'gemini':
      return await callGemini(messages, model);
    case 'deepseek':
      return await callDeepSeek(messages, model);
    case 'groq':
      return await callGrok(messages, model);
    case 'kimi':
      return await callKimi(messages, model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

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

  if (!isValidApiKey(apiKey)) {
    throw new Error('OpenAI: API key not configured');
  }

  console.log('🔵 Calling OpenAI with model:', model);

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

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      try { errorData = JSON.parse(errorText); } catch {}
      const errorMessage = errorData.error?.message || `Status ${response.status}`;
      throw new Error(`OpenAI: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI Success!');

    return {
      content: data.choices[0].message.content,
      provider: 'OpenAI',
      model,
    };
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('OpenAI: Network error');
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
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  console.log('🔵 Groq API Key present:', !!apiKey);
  console.log('🔵 Groq API Key length:', apiKey?.length || 0);
  console.log('🔵 Groq API Key starts with:', apiKey?.substring(0, 7));

  if (!isValidApiKey(apiKey)) {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  console.log('🔵 Calling Groq API with model:', model);
  console.log('🔵 Messages count:', messages.length);

  try {
    // Groq uses their own endpoint (not x.ai)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Use Groq's model
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log('🔵 Groq Response status:', response.status);
    console.log('🔵 Groq Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔵 Groq Error response:', errorText);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {}
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      console.error('🔵 Throwing error:', errorMessage);
      throw new Error(`Groq: ${errorMessage}`);
    }

    console.log('🔵 Groq response OK, parsing JSON...');
    const data = await response.json();
    console.log('🔵 Groq data received:', data);
    console.log('🔵 Groq Success! Response length:', data.choices[0].message.content.length);

    return {
      content: data.choices[0].message.content,
      provider: 'Groq',
      model: 'llama-3.3-70b',
    };
  } catch (error: any) {
    console.error('🔵 Groq CATCH block triggered!');
    console.error('🔵 Error type:', error.constructor.name);
    console.error('🔵 Error message:', error.message);
    console.error('🔵 Full error:', error);

    if (error.message.includes('Failed to fetch')) {
      console.error('🔵 Network error detected');
      throw new Error('Groq: Network error - could not reach API. Check your internet connection.');
    }
    console.error('🔵 Re-throwing error:', error.message);
    throw error;
  }
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
