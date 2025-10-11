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

/**
 * Call Groq API (Free, Fast, Reliable)
 */
export async function callGroqAPI(messages: Message[]): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  console.log('=================================');
  console.log('🤖 SIMPLE AI SERVICE CALLED');
  console.log('=================================');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with:', apiKey?.substring(0, 10) || 'MISSING');
  console.log('Messages to send:', messages.length);
  console.log('First message:', messages[0]?.content?.substring(0, 50));

  if (!apiKey) {
    console.error('❌ NO API KEY!');
    throw new Error('API key is missing. Please check your .env file for VITE_GROK_API_KEY');
  }

  if (apiKey.includes('your-') || apiKey.length < 20) {
    console.error('❌ INVALID API KEY!');
    throw new Error('API key appears to be invalid. Please check your .env file.');
  }

  console.log('✅ API Key validated');
  console.log('📡 Making API request...');

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

    console.log('📥 Response received!');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('OK:', response.ok);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ Response NOT OK!');
      const errorText = await response.text();
      console.error('Error body:', errorText);

      let errorMessage = `Groq API error (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage += `: ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    console.log('✅ Response OK! Parsing JSON...');
    const data = await response.json();
    console.log('Raw response data:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure!');
      console.error('Data:', data);
      throw new Error('Invalid response structure from Groq API');
    }

    const aiContent = data.choices[0].message.content;
    console.log('✅ AI RESPONSE RECEIVED!');
    console.log('Length:', aiContent.length);
    console.log('First 100 chars:', aiContent.substring(0, 100));
    console.log('=================================');

    return {
      content: aiContent,
      provider: 'Groq',
      model: 'llama-3.3-70b-versatile',
    };

  } catch (error: any) {
    console.error('=================================');
    console.error('❌ ERROR IN GROQ API CALL');
    console.error('=================================');
    console.error('Error type:', error.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.message.includes('Failed to fetch')) {
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
