/**
 * AI Proxy Edge Function
 *
 * SECURITY: This function acts as a secure proxy for all AI API calls.
 * API keys are stored server-side only and never exposed to the frontend.
 *
 * Supports: OpenRouter, Claude, OpenAI, Gemini
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Get API keys from environment (server-side only)
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

interface AIRequest {
  provider: 'openrouter' | 'claude' | 'openai' | 'gemini';
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | any;
  }>;
  max_tokens?: number;
  temperature?: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request (Firebase auth verification handled on client side)
    const body: AIRequest = await req.json();
    const { provider, model, messages, max_tokens, temperature } = body;

    console.log(`🤖 AI Proxy: ${provider} - ${model}`);

    let response: Response;
    let apiKey: string;
    let url: string;

    switch (provider) {
      case 'openrouter':
        apiKey = OPENROUTER_API_KEY;
        url = 'https://openrouter.ai/api/v1/chat/completions';

        if (!apiKey) {
          throw new Error('OpenRouter API key not configured');
        }

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://kroniq.ai',
            'X-Title': 'KroniQ AI Platform',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature: temperature || 0.7,
          }),
        });
        break;

      case 'claude':
        apiKey = CLAUDE_API_KEY;
        url = 'https://api.anthropic.com/v1/messages';

        if (!apiKey) {
          throw new Error('Claude API key not configured');
        }

        // Convert messages format for Claude
        const claudeMessages = messages.filter(m => m.role !== 'system');
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: claudeMessages,
            system: systemMessage,
            max_tokens: max_tokens || 4096,
            temperature: temperature || 0.7,
          }),
        });
        break;

      case 'openai':
        apiKey = OPENAI_API_KEY;
        url = 'https://api.openai.com/v1/chat/completions';

        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature: temperature || 0.7,
          }),
        });
        break;

      case 'gemini':
        apiKey = GEMINI_API_KEY;
        const geminiModel = model.replace('gemini-', '');
        url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        if (!apiKey) {
          throw new Error('Gemini API key not configured');
        }

        // Convert messages format for Gemini
        const geminiContents = messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
          }));

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              maxOutputTokens: max_tokens || 2048,
              temperature: temperature || 0.7,
            }
          }),
        });
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${provider} API error:`, errorText);
      throw new Error(`${provider} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ ${provider} response received`);

    // Normalize response format
    let normalizedResponse: any;

    if (provider === 'openrouter' || provider === 'openai') {
      normalizedResponse = data;
    } else if (provider === 'claude') {
      // Convert Claude format to OpenAI format
      normalizedResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: data.content[0]?.text || ''
          }
        }],
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };
    } else if (provider === 'gemini') {
      // Convert Gemini format to OpenAI format
      normalizedResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        }],
        usage: {
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    }

    return new Response(JSON.stringify(normalizedResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('❌ AI Proxy error:', error);

    return new Response(JSON.stringify({
      error: error.message || 'AI proxy error',
      details: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
