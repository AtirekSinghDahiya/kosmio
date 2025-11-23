/**
 * OpenAI Sora 2 Video Generation Service
 * Uses OpenAI's latest video generation model
 */

export interface Sora2Params {
  prompt: string;
  duration?: number; // Up to 20 seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

/**
 * Generate video using OpenAI Sora 2
 */
export async function generateWithSora2(
  params: Sora2Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

    if (!OPENAI_KEY || OPENAI_KEY.includes('your-')) {
      throw new Error('OpenAI API key not configured');
    }

    onProgress?.('Initializing Sora 2...');

    // Map aspect ratios to dimensions
    const dimensionMap: Record<string, { width: number; height: number }> = {
      'landscape': { width: 1920, height: 1080 },
      'portrait': { width: 1080, height: 1920 },
      'square': { width: 1080, height: 1080 }
    };

    const dimensions = dimensionMap[params.aspectRatio || 'landscape'];
    const duration = Math.min(params.duration || 10, 20); // Max 20 seconds

    // Use AIMLAPI for video generation with Sora
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Generating video with Sora...');

    const response = await fetch('https://api.aimlapi.com/v1/video/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'sora-2',
        prompt: params.prompt,
        duration: duration,
        aspect_ratio: params.aspectRatio || 'landscape',
        quality: params.resolution === '1080p' ? 'hd' : 'standard',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Video generation error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Handle video generation response
    if (data.id) {
      onProgress?.('Video generation in progress...');

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes timeout

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const statusResponse = await fetch(
          `https://api.aimlapi.com/v1/video/generation/${data.id}`,
          {
            headers: {
              'Authorization': `Bearer ${AIML_KEY}`,
            },
          }
        );

        const statusData = await statusResponse.json();

        if (statusData.status === 'succeeded') {
          const videoUrl = statusData.data?.[0]?.url;
          if (!videoUrl) {
            throw new Error('No video URL in response');
          }

          onProgress?.('Video generated successfully!');
          return videoUrl;
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error?.message || 'Video generation failed');
        }

        onProgress?.(`Generating video... (${attempts * 2}s)`);
        attempts++;
      }

      throw new Error('Video generation timed out');
    }

    // Direct response (unlikely for video)
    const videoUrl = data.data?.[0]?.url;
    if (!videoUrl) {
      throw new Error('No video URL in response');
    }

    onProgress?.('Video generated successfully!');
    return videoUrl;

  } catch (error: any) {
    console.error('Sora 2 generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Sora 2');
  }
}

/**
 * Check if Sora 2 is available
 */
export function isSora2Available(): boolean {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return !!key && !key.includes('your-');
}
