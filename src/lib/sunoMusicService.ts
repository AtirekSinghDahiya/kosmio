/**
 * Suno AI Music Generation Service
 * Alternative music generation using Suno API
 */

export interface SunoParams {
  prompt: string;
  duration?: number;
  makeInstrumental?: boolean;
  genre?: string;
  mood?: string;
}

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

    onProgress?.('Initializing Suno...');

    // Build music description
    const description = [
      params.prompt,
      params.genre ? `Genre: ${params.genre}` : '',
      params.mood ? `Mood: ${params.mood}` : '',
      params.makeInstrumental ? 'Instrumental only' : 'With vocals'
    ].filter(Boolean).join('. ');

    // Call Suno API
    const response = await fetch('https://api.sunoaiapi.com/api/v1/gateway/generate/music', {
      method: 'POST',
      headers: {
        'api-key': SUNO_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: params.prompt.substring(0, 100),
        tags: params.genre || 'electronic',
        prompt: description,
        make_instrumental: params.makeInstrumental || false,
        wait_audio: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Suno API Error:', errorText);
      throw new Error(`Suno API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.task_id) {
      throw new Error('No task ID in response');
    }

    const taskId = data.data.task_id;
    onProgress?.('Music generation in progress...');

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes timeout

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `https://api.sunoaiapi.com/api/v1/gateway/query?ids=${taskId}`,
        {
          headers: {
            'api-key': SUNO_KEY,
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.data && statusData.data.length > 0) {
        const track = statusData.data[0];

        if (track.status === 'complete' && track.audio_url) {
          onProgress?.('Music generated successfully!');
          return track.audio_url;
        } else if (track.status === 'error') {
          throw new Error(track.meta?.error_message || 'Music generation failed');
        }
      }

      onProgress?.(`Generating music... (${attempts * 2}s)`);
      attempts++;
    }

    throw new Error('Music generation timed out');

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
