/**
 * Suno AI Music Generation Service
 * Alternative music generation using Suno API
 */

export interface SunoParams {
  prompt: string;
  duration?: number;
  makeInstrumental?: boolean;
  style?: string;
  title?: string;
  model?: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5';
}

const SUNO_API_BASE = 'https://api.sunoapi.org/api/v1';

/**
 * Generate music using Suno API
 */
export async function generateWithSuno(
  params: SunoParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const SUNO_KEY = import.meta.env.VITE_SUNO_API_KEY;

    if (!SUNO_KEY || SUNO_KEY.includes('your-')) {
      throw new Error('Suno API key not configured');
    }

    onProgress?.('Initializing Suno music generation...');

    const requestBody: any = {
      prompt: params.prompt,
      customMode: true,
      instrumental: params.makeInstrumental || false,
      model: params.model || 'V3_5',
      style: params.style || 'Folk Pop',
      title: params.title || params.prompt.substring(0, 80),
      callBackUrl: 'https://example.com/callback'
    };

    console.log('🎵 Suno API request:', requestBody);

    // Start generation
    const response = await fetch(`${SUNO_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno API Error:', response.status, errorText);
      throw new Error(`Suno API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Suno response:', data);

    if (data.code !== 200 || !data.data?.taskId) {
      throw new Error(data.msg || 'No task ID in response');
    }

    const taskId = data.data.taskId;
    onProgress?.('Music generation in progress...');

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max (10 seconds per check)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await fetch(
        `${SUNO_API_BASE}/generate/record-info?taskId=${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${SUNO_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error('❌ Status check failed:', statusResponse.status);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`📈 Status check ${attempts + 1}:`, statusData);

      if (statusData.code === 200 && statusData.data) {
        const status = statusData.data.status;

        if (status === 'SUCCESS' && statusData.data.response?.data) {
          const audioUrl = statusData.data.response.data[0]?.audio_url;
          if (audioUrl) {
            onProgress?.('Music generated successfully!');
            console.log('✅ Music ready:', audioUrl);
            return audioUrl;
          }
        } else if (status === 'FAILED') {
          throw new Error('Music generation failed');
        }

        onProgress?.(`Generating music... (${(attempts + 1) * 10}s)`);
      }

      attempts++;
    }

    throw new Error('Music generation timed out after 10 minutes');

  } catch (error: any) {
    console.error('Suno generation error:', error);
    throw new Error(error.message || 'Failed to generate music with Suno');
  }
}

/**
 * Check if Suno is available
 */
export function isSunoAvailable(): boolean {
  const key = import.meta.env.VITE_SUNO_API_KEY;
  return !!key && !key.includes('your-');
}

/**
 * Simple wrapper for generating music from just a prompt
 */
export async function generateSunoMusic(prompt: string): Promise<{ audioUrl: string; title: string }> {
  const audioUrl = await generateWithSuno({
    prompt,
    makeInstrumental: false,
    model: 'V3_5',
  });

  return {
    audioUrl,
    title: prompt.substring(0, 50),
  };
}
