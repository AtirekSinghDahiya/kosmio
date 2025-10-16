// Test HeyGen API directly
const HEYGEN_API_KEY = 'MmQwMmFiMzI2YzgzNDgyZmEyMjMzYjMzMTFiMjFjMmQtMTc2MDU2OTQ5Mw==';
const HEYGEN_API_BASE = 'https://api.heygen.com/v2';

async function testHeyGen() {
  console.log('🧪 Testing HeyGen API...');

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: 'Angela-inblackskirt-20220820',
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: 'Hello, this is a test video.',
          voice_id: '1bd001e7e50f421d891986aad5158bc8',
        }
      }
    ],
    dimension: {
      width: 1920,
      height: 1080
    },
    test: true // Use test mode to avoid consuming credits
  };

  try {
    console.log('📤 Sending request to:', `${HEYGEN_API_BASE}/video/generate`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${HEYGEN_API_BASE}/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response:', responseText);

    if (!response.ok) {
      console.error('❌ API Error:', responseText);
      return;
    }

    const data = JSON.parse(responseText);
    console.log('✅ Success! Video ID:', data.data?.video_id);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHeyGen();
