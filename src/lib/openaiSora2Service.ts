/**
 * OpenAI Sora 2 Video Generation Service
 * Uses AIMLAPI with proper two-step generation pattern
 * Documentation: https://docs.aimlapi.com/api-references/video-models/openai/sora-2-pro-t2v
 */

export interface Sora2Params {
  prompt: string;
  duration?: number; // Up to 20 seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

/**
 * Generate video using OpenAI Sora 2 via AIMLAPI
 */
export async function generateWithSora2(
  params: Sora2Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Initializing Sora 2 video generation...');

    // Map aspect ratios to AIMLAPI format
    const aspectRatioMap: Record<string, string> = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'landscape'];
    const duration = Math.min(params.duration || 10, 20); // Max 20 seconds

    onProgress?.('Creating video generation task...');

    // Step 1: Create video generation task using universal endpoint
    const createResponse = await fetch('https://api.aimlapi.com/v2/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/sora-2-pro-t2v',
        prompt: params.prompt,
        aspect_ratio: aspectRatio,
        duration: duration,
        quality: params.resolution === '1080p' ? 'hd' : 'standard',
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      console.error('Video generation creation error:', createResponse.status, errorData);
      throw new Error(`Video generation error: ${createResponse.status} - ${errorData.error?.message || errorData.message || createResponse.statusText}`);
    }

    const createData = await createResponse.json();

    if (!createData.id) {
      throw new Error('No generation ID received from API');
    }

    const generationId = createData.id;
    onProgress?.('Video generation task created, processing...');

    // Step 2: Poll for completion
    const maxAttempts = 90; // ~9 minutes timeout (6 seconds per attempt)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds

      const statusResponse = await fetch(
        `https://api.aimlapi.com/v2/video/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${AIML_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({}));
        console.error('Status check error:', statusResponse.status, errorData);
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed' || statusData.status === 'succeeded') {
        // Extract video URL from response
        const videoUrl = statusData.video_url || statusData.url || statusData.output?.video_url || statusData.data?.[0]?.url;

        if (!videoUrl) {
          console.error('No video URL in response:', statusData);
          throw new Error('No video URL in response');
        }

        onProgress?.('Video generated successfully!');
        return videoUrl;
      } else if (statusData.status === 'failed' || statusData.status === 'error') {
        throw new Error(statusData.error?.message || statusData.error || 'Video generation failed');
      }

      // Still processing
      const timeElapsed = attempts * 6;
      onProgress?.(`Generating video... (${timeElapsed}s elapsed)`);
      attempts++;
    }

    throw new Error('Video generation timed out after 9 minutes');

  } catch (error: any) {
    console.error('Sora 2 generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Sora 2');
  }
}

/**
 * Check if Sora 2 is available
 */
export function isSora2Available(): boolean {
  const key = import.meta.env.VITE_AIMLAPI_KEY;
  return !!key;
}
