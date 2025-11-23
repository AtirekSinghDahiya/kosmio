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

    // Call Google Veo API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1:generateVideo?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          duration: duration,
          aspectRatio: aspectRatio,
          resolution: resolution,
          numberOfVideos: 1,
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE'
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Veo 3.1 API Error:', errorText);
      throw new Error(`Veo 3.1 API Error: ${response.status}`);
    }

    const data = await response.json();

    // Handle operation response (long-running operation)
    if (data.name) {
      onProgress?.('Video generation in progress...');

      // Poll for completion
      const operationName = data.name;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes timeout

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_KEY}`
        );

        const statusData = await statusResponse.json();

        if (statusData.done) {
          if (statusData.error) {
            throw new Error(statusData.error.message || 'Video generation failed');
          }

          const videoUrl = statusData.response?.generatedVideos?.[0]?.uri;
          if (!videoUrl) {
            throw new Error('No video URL in response');
          }

          onProgress?.('Video generated successfully!');
          return videoUrl;
        }

        onProgress?.(`Generating video... (${attempts * 2}s)`);
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
