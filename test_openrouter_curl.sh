#!/bin/bash

# Test OpenRouter API Key with curl
API_KEY="$1"

if [ -z "$API_KEY" ]; then
  echo "Usage: bash test_openrouter_curl.sh YOUR_API_KEY"
  exit 1
fi

echo "Testing OpenRouter API Key with curl..."
echo "Key: ${API_KEY:0:25}..."
echo ""

echo "=== Test 1: Auth Key Validation ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $API_KEY" \
  https://openrouter.ai/api/v1/auth/key

echo ""
echo ""
echo "=== Test 2: Models List ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $API_KEY" \
  https://openrouter.ai/api/v1/models | head -100

echo ""
echo ""
echo "=== Test 3: Chat Completion (Free Model) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://kroniq.ai" \
  -H "X-Title: KroniQ AI Platform" \
  -d '{
    "model": "google/gemini-2.0-flash-exp:free",
    "messages": [{"role": "user", "content": "Say hello"}]
  }' \
  https://openrouter.ai/api/v1/chat/completions
