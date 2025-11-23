/**
 * Simple Video Generation Service using FAL.ai
 * Reliable video generation with multiple models
 */

export type VideoModel = 'veo-3' | 'sora-2' | 'veo-3-legacy';

export interface VideoParams {
  prompt: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  duration?: 4 | 6 | 8;
}

/**
 * Generate video using FAL.ai
 */
export async function generateVideoSimple(
  params: VideoParams,
  model: VideoModel = 'veo-3',
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const FAL_KEY = import.meta.env.VITE_FAL_KEY;

    if (!FAL_KEY || FAL_KEY.includes('your-')) {
      throw new Error('FAL.ai API key not configured. Please add VITE_FAL_KEY to your .env file.');
    }

    onProgress?.('Initializing video generation...');

    // Map to FAL.ai model IDs
    const modelMap: Record<VideoModel, string> = {
      'veo-3': 'fal-ai/veo-3',
      'sora-2': 'fal-ai/sora',
      'veo-3-legacy': 'fal-ai/veo'
    };

    const falModel = modelMap[model];

    // Map aspect ratio
    const aspectRatioMap: Record<string, string> = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    // Direct FAL API call
    const response = await fetch(`https://queue.fal.run/${falModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        aspect_ratio: aspectRatioMap[params.aspectRatio || 'landscape'],
        duration: params.duration || 8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API Error:', errorText);
      throw new Error(`FAL API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Handle queue response
    if (data.request_id) {
      onProgress?.('In queue, waiting...');

      // Poll for result
      const resultUrl = `https://queue.fal.run/${falModel}/requests/${data.request_id}`;
      let attempts = 0;
      const maxAttempts = 180; // 3 minutes timeout for video

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds

        const statusResponse = await fetch(resultUrl, {
          headers: {
            'Authorization': `Key ${FAL_KEY}`,
          },
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'COMPLETED') {
          const videoUrl = statusData.video?.url;
          if (!videoUrl) {
            throw new Error('No video URL in completed response');
          }
          onProgress?.('Video generated successfully!');
          return videoUrl;
        } else if (statusData.status === 'FAILED') {
          throw new Error(statusData.error || 'Video generation failed');
        }

        const progress = statusData.logs?.[statusData.logs.length - 1]?.message || 'Generating...';
        onProgress?.(`${progress} (${Math.floor(attempts * 2)}s)`);
        attempts++;
      }

      throw new Error('Video generation timed out');
    }

    // Direct response (no queue)
    const videoUrl = data.video?.url;
    if (!videoUrl) {
      throw new Error('No video URL in response');
    }

    onProgress?.('Video generated successfully!');
    return videoUrl;

  } catch (error: any) {
    console.error('Video generation error:', error);
    throw new Error(error.message || 'Failed to generate video');
  }
}

/**
 * Check if video generation is available
 */
export function isVideoGenerationAvailable(): boolean {
  const key = import.meta.env.VITE_FAL_KEY;
  return !!key && !key.includes('your-');
}
