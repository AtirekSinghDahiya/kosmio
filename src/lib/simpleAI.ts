/**
 * SIMPLE AI SERVICE - Guaranteed Working Version
 * No complex fallbacks, just direct API calls with clear error handling
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

// Visual debug logger
function log(type: 'info' | 'success' | 'error' | 'warning', message: string) {
  console.log(`[${type}]`, message);
  window.dispatchEvent(new CustomEvent('debugLog', { detail: { type, message } }));
}

/**
 * Call Groq API (Free, Fast, Reliable)
 */
export async function callGroqAPI(messages: Message[]): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  log('info', '🤖 AI SERVICE CALLED');
  log('info', `API Key: ${apiKey ? `Present (${apiKey.length} chars, starts with ${apiKey.substring(0, 7)})` : 'MISSING'}`);
  log('info', `Messages to send: ${messages.length}`);
  log('info', `First message: ${messages[0]?.content?.substring(0, 30)}...`);

  if (!apiKey) {
    log('error', 'NO API KEY FOUND!');
    throw new Error('API key is missing. Please check your .env file for VITE_GROK_API_KEY');
  }

  if (apiKey.includes('your-') || apiKey.length < 20) {
    log('error', 'INVALID API KEY FORMAT!');
    throw new Error('API key appears to be invalid. Please check your .env file.');
  }

  log('success', 'API Key validated ✓');
  log('info', 'Making API request...');

  try {
    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    log('info', `Response received: Status ${response.status}`);
    log('info', `Response OK: ${response.ok}`);

    if (!response.ok) {
      log('error', `API returned error status: ${response.status}`);
      const errorText = await response.text();
      log('error', `Error details: ${errorText.substring(0, 100)}`);

      let errorMessage = `Groq API error (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage += `: ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    log('success', 'Response OK! Parsing data...');
    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      log('error', 'Invalid response structure from API');
      throw new Error('Invalid response structure from Groq API');
    }

    const aiContent = data.choices[0].message.content;
    log('success', `✅ AI RESPONSE RECEIVED! (${aiContent.length} chars)`);
    log('info', `Preview: ${aiContent.substring(0, 50)}...`);

    return {
      content: aiContent,
      provider: 'Groq',
      model: 'llama-3.3-70b-versatile',
    };

  } catch (error: any) {
    log('error', `EXCEPTION: ${error.message}`);
    log('error', `Error type: ${error.constructor?.name}`);

    if (error.message.includes('Failed to fetch')) {
      log('error', 'Network error detected');
      throw new Error('Network error: Cannot reach Groq API. Check your internet connection.');
    }

    throw error;
  }
}

/**
 * Main AI function - Simple wrapper around Groq
 */
export async function getAIResponse(userMessage: string, conversationHistory: Message[] = []): Promise<string> {
  console.log('🚀 getAIResponse called');
  console.log('User message:', userMessage.substring(0, 50));
  console.log('History length:', conversationHistory.length);

  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are Kosmio AI, a helpful and intelligent assistant. Be concise, helpful, and friendly.',
    },
    ...conversationHistory.slice(-10), // Last 10 messages for context
    {
      role: 'user',
      content: userMessage,
    },
  ];

  console.log('Total messages to send:', messages.length);

  const response = await callGroqAPI(messages);

  console.log('✅ AI response received, returning content');
  return response.content;
}
