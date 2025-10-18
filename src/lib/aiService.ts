/**
 * AI Service - Simple and reliable AI API integration
 * No complex network monitoring - just clean API calls
 */

interface AIPreferences {
  personality: string;
  creativityLevel: number;
  responseLength: string;
}

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const getSystemPrompt = (preferences: AIPreferences): string => {
  const personalityMap: Record<string, string> = {
    creative: 'Be highly imaginative, artistic, and think outside the box. Use creative metaphors and provide innovative solutions.',
    professional: 'Be formal, business-oriented, and precise. Use professional language and focus on best practices.',
    funny: 'Be humorous, light-hearted, and entertaining. Use jokes and witty remarks when appropriate.',
    balanced: 'Be well-rounded, versatile, and adaptable. Balance creativity with practicality.',
    technical: 'Be highly detailed, precise, and technical. Focus on specifications and technical accuracy.',
    casual: 'Be friendly, conversational, and approachable. Use simple language and be relatable.',
  };

  const creativityMap: Record<number, string> = {
    1: 'Be very conservative and stick to proven, standard solutions.',
    2: 'Prefer established patterns with minor variations.',
    3: 'Use mostly conventional approaches with occasional alternatives.',
    4: 'Balance between conventional and creative solutions.',
    5: 'Mix standard approaches with creative alternatives equally.',
    6: 'Lean towards creative solutions while keeping practicality in mind.',
    7: 'Favor innovative approaches with creative problem-solving.',
    8: 'Be highly creative and suggest novel solutions.',
    9: 'Be very experimental and push boundaries.',
    10: 'Be extremely innovative and suggest cutting-edge, experimental solutions.',
  };

  const lengthMap: Record<string, string> = {
    short: 'Keep responses concise and to the point. Use 2-3 sentences or a brief paragraph.',
    medium: 'Provide balanced responses with adequate detail. Use 1-2 paragraphs.',
    long: 'Give comprehensive, detailed responses with thorough explanations. Use multiple paragraphs.',
  };

  const personality = personalityMap[preferences.personality] || personalityMap.balanced;
  const creativity = creativityMap[preferences.creativityLevel] || creativityMap[5];
  const length = lengthMap[preferences.responseLength] || lengthMap.medium;

  return `You are KroniQ AI, a helpful coding and design assistant.

Personality: ${personality}

Creativity Level: ${creativity}

Response Length: ${length}

Always provide helpful, accurate information while maintaining the specified personality and style.`;
};

export const callClaude = async (
  messages: AIMessage[],
  preferences: AIPreferences
): Promise<string> => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('Claude API key not configured');
  }

  const systemPrompt = getSystemPrompt(preferences);
  const temperature = preferences.creativityLevel / 10;
  const maxTokens = preferences.responseLength === 'short' ? 150 :
                   preferences.responseLength === 'medium' ? 500 : 1000;

  console.log('🟣 Calling Claude API...');
  console.log('   API Key present:', apiKey ? 'Yes' : 'No');
  console.log('   Messages count:', messages.length);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system'),
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Claude API error:', response.status, errorData);
      throw new Error(errorData.error?.message || `Claude API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Claude response received');
    return data.content[0].text;
  } catch (error: any) {
    console.error('❌ Claude fetch error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('CORS error: Direct browser calls to Claude API are blocked. Consider using a backend proxy.');
    }
    throw error;
  }
};

export const callGemini = async (
  messages: AIMessage[],
  preferences: AIPreferences
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = getSystemPrompt(preferences);
  const temperature = preferences.creativityLevel / 10;

  console.log('🔴 Calling Gemini API...');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          ...messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: preferences.responseLength === 'short' ? 150 :
                         preferences.responseLength === 'medium' ? 500 : 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Gemini response received');
  return data.candidates[0].content.parts[0].text;
};

export const callGroq = async (
  messages: AIMessage[],
  preferences: AIPreferences
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('Groq API key not configured');
  }

  const systemPrompt = getSystemPrompt(preferences);
  const temperature = preferences.creativityLevel / 10;
  const maxTokens = preferences.responseLength === 'short' ? 150 :
                   preferences.responseLength === 'medium' ? 500 : 1000;

  console.log('🟢 Calling Groq API...');
  console.log('   API Key present:', apiKey ? 'Yes' : 'No');
  console.log('   Messages count:', messages.length);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {}
      throw new Error(errorData.error?.message || `Groq API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Groq response received:', data.choices[0].message.content.substring(0, 50) + '...');
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('❌ Groq fetch error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Could not reach Groq API. Check your internet connection.');
    }
    throw error;
  }
};

export const callOpenAI = async (
  messages: AIMessage[],
  preferences: AIPreferences
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = getSystemPrompt(preferences);
  const temperature = preferences.creativityLevel / 10;
  const maxTokens = preferences.responseLength === 'short' ? 150 :
                   preferences.responseLength === 'medium' ? 500 : 1000;

  console.log('🔵 Calling OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ OpenAI response received');
  return data.choices[0].message.content;
};
