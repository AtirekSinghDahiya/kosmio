# OpenRouter API Configuration

## Setup Instructions

1. **Get Your API Key**
   - Visit: https://openrouter.ai/settings/keys
   - Create a new API key
   - Copy the key (starts with `sk-or-v1-...`)

2. **Add to Environment Files**
   
   Update `.env`:
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```
   
   Update `.env.production`:
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```

3. **Verify Configuration**
   ```bash
   npm run build
   ```

## API Endpoint

The application uses OpenRouter's official endpoint:
- **Base URL**: `https://openrouter.ai/api/v1`
- **Chat Completions**: `https://openrouter.ai/api/v1/chat/completions`

## Model Configuration

All models are configured in:
- `src/lib/openRouterDirect.ts` - Direct API calls (primary)
- `src/lib/openRouterService.ts` - Edge function proxy (fallback)

### Available Models

The `MODEL_MAP` maps friendly names to OpenRouter model IDs:

```typescript
{
  'gpt-5-chat': 'openai/gpt-5-chat',
  'deepseek-v3.2': 'deepseek/deepseek-v3.2-exp',
  'claude-sonnet': 'anthropic/claude-sonnet-4.5',
  'grok-4-fast': 'x-ai/grok-4-fast',
  'gemini-flash-image': 'google/gemini-2.5-flash-image',
  'perplexity-sonar': 'perplexity/sonar',
  // ... and many more
}
```

## Usage in Code

### Direct API Call (Recommended)

```typescript
import { getOpenRouterResponseWithUsage } from './lib/openRouterDirect';

const response = await getOpenRouterResponseWithUsage(
  'Your message here',
  conversationHistory,
  systemPrompt,
  'grok-4-fast'  // or any model ID
);

console.log(response.content);
console.log(response.usage); // token usage and cost
```

### Through AI Provider Abstraction

```typescript
import { callAI } from './lib/aiProviders';

const response = await callAI(messages, 'grok-4-fast');
console.log(response.content);
```

## Testing

Test your API key works:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_OPENROUTER_API_KEY" \
  -d '{
    "model": "x-ai/grok-4-fast",
    "messages": [
      {"role": "user", "content": "Say hello!"}
    ]
  }'
```

## Common Issues

### "User not found" Error
This is a known OpenRouter API bug. Solutions:
1. Generate a new API key
2. Wait 5-10 minutes for the key to propagate
3. Contact OpenRouter support

### Missing API Key
Error: `OpenRouter API key not configured`

Solution: Add `VITE_OPENROUTER_API_KEY` to your `.env` file

### Model Not Found
Make sure you're using the correct model ID from the `MODEL_MAP` or a valid OpenRouter model name.

## Security Notes

- API keys are exposed in frontend (VITE_ prefix)
- OpenRouter is designed for frontend usage with rate limiting
- For production, consider using Edge Function proxy instead
- Never commit API keys to version control

## Pricing

Check model pricing at: https://openrouter.ai/models

Token costs are automatically tracked in the `usage` response field.
