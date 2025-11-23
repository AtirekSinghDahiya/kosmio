/**
 * Google Veo 3 Video Generation Service
 * Uses AIMLAPI with proper two-step generation pattern
 * Documentation: https://docs.aimlapi.com/api-references/video-models/google/veo-3-1-text-to-video
 */

export interface Veo3Params {
  prompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  resolution?: '720p' | '1080p';
}

/**
 * Generate video using Google Veo 3 via AIMLAPI
 */
export async function generateWithVeo3(
  params: Veo3Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Initializing Veo 3 video generation...');

    // Map aspect ratios to AIMLAPI format
    const aspectRatioMap: Record<string, string> = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'landscape'];
    const duration = params.duration || 8;

    onProgress?.('Creating video generation task...');

    // Step 1: Create video generation task using universal endpoint
    const createResponse = await fetch('https://api.aimlapi.com/v2/video/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/veo-3-1-text-to-video',
        prompt: params.prompt,
        aspect_ratio: aspectRatio,
        duration: duration,
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
        const videoUrl = statusData.video_url || statusData.url || statusData.output?.video_url;

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
    console.error('Veo 3 generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Veo 3');
  }
}

/**
 * Check if Veo 3 is available
 */
export function isVeo3Available(): boolean {
  const key = import.meta.env.VITE_AIMLAPI_KEY;
  return !!key;
}
