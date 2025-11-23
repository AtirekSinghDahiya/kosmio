/**
 * Google Veo 3.1 Video Generation Service
 * Uses Google's latest video generation model
 */

export interface Veo3Params {
  prompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  resolution?: '720p' | '1080p';
}

/**
 * Generate video using Google Veo 3.1
 */
export async function generateWithVeo3(
  params: Veo3Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_KEY || GEMINI_KEY.includes('your-')) {
      throw new Error('Google Gemini API key not configured');
    }

    onProgress?.('Initializing Veo 3.1...');

    // Map aspect ratios
    const aspectRatioMap: Record<string, string> = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'landscape'];
    const duration = params.duration || 8;
    const resolution = params.resolution || '1080p';

    // Use AIMLAPI for video generation
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Generating video...');

    const response = await fetch('https://api.aimlapi.com/v1/video/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'veo-3',
        prompt: params.prompt,
        duration: duration,
        aspect_ratio: aspectRatio,
        resolution: resolution,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Video generation error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    onProgress?.('Video generation in progress...');

    // Poll for completion if we get a job ID
    if (data.id) {
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const statusResponse = await fetch(`https://api.aimlapi.com/v1/video/generation/${data.id}`, {
          headers: {
            'Authorization': `Bearer ${AIML_KEY}`,
          },
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          onProgress?.('Video generated successfully!');
          return statusData.video_url || statusData.url;
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Video generation failed');
        }

        onProgress?.(`Generating video... (${attempts * 3}s)`);
        attempts++;
      }

      throw new Error('Video generation timed out');
    }

    // Direct response (unlikely for video)
    const videoUrl = data.generatedVideos?.[0]?.uri;
    if (!videoUrl) {
      throw new Error('No video URL in response');
    }

    onProgress?.('Video generated successfully!');
    return videoUrl;

  } catch (error: any) {
    console.error('Veo 3.1 generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Veo 3.1');
  }
}

/**
 * Check if Veo 3.1 is available
 */
export function isVeo3Available(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
