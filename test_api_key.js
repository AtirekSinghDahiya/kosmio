// Test OpenRouter API Key
const apiKey = process.argv[2] || process.env.VITE_OPENROUTER_API_KEY;

if (!apiKey) {
  console.log('❌ No API key provided');
  console.log('Usage: node test_api_key.js YOUR_API_KEY');
  console.log('Or set VITE_OPENROUTER_API_KEY in .env and run: node test_api_key.js');
  process.exit(1);
}

console.log('🔑 Testing API key:', apiKey.substring(0, 25) + '...');
console.log('');

async function testKey() {
  // Test 1: Check key validity
  console.log('📝 Test 1: Checking key validity endpoint...');
  try {
    const res1 = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data1 = await res1.json();

    if (data1.error) {
      console.log('❌ Key validation FAILED:', data1.error.message);
      console.log('   Error code:', data1.error.code);
      console.log('   This means the API key is NOT valid');
    } else {
      console.log('✅ Key validation PASSED!');
      console.log('   Key data:', JSON.stringify(data1, null, 2));
    }
  } catch (err) {
    console.log('❌ Request error:', err.message);
  }

  console.log('');

  // Test 2: Try actual API call with free model
  console.log('📝 Test 2: Testing actual API call with FREE model...');
  try {
    const res2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kroniq.ai',
        'X-Title': 'KroniQ AI Test'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'user', content: 'Say "Hello!" in one word' }
        ]
      })
    });

    const data2 = await res2.json();

    if (data2.error) {
      console.log('❌ API call FAILED:', data2.error.message);
      if (data2.error.code) {
        console.log('   Error code:', data2.error.code);
      }
    } else {
      console.log('✅ API call SUCCESSFUL!');
      console.log('   AI Response:', data2.choices[0].message.content);
      console.log('   Model used:', data2.model);
    }
  } catch (err) {
    console.log('❌ Request error:', err.message);
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('');
  console.log('📊 Summary:');
  console.log('   If both tests passed ✅ - Your API key works!');
  console.log('   If test 1 failed ❌ - Get a new key from OpenRouter');
  console.log('   If test 1 passed but test 2 failed - Check credits');
  console.log('');
}

testKey();
