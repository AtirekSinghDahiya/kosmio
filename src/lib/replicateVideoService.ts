/**
 * Replicate Video Generation Service
 * Uses Replicate API with various video models
 * Documentation: https://replicate.com/docs
 */

export interface ReplicateVideoParams {
  prompt: string;
  model?: 'hailuo' | 'kling' | 'veo3' | 'wan';
  duration?: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  resolution?: '480p' | '720p' | '1080p';
}

const MODEL_ENDPOINTS: Record<string, string> = {
  'hailuo': 'minimax/video-01',
  'kling': 'kling-ai/kling-v1-5-standard',
  'veo3': 'google-deepmind/veo-2',
  'wan': 'w-ai/wan-2-2'
};

const ASPECT_RATIO_MAP: Record<string, string> = {
  'landscape': '16:9',
  'portrait': '9:16',
  'square': '1:1'
};

/**
 * Generate videos using Replicate's video models
 */
export async function generateWithReplicateVideo(
  params: ReplicateVideoParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

    if (!API_KEY || API_KEY.includes('your-')) {
      throw new Error('Replicate API key not configured. Please add VITE_REPLICATE_API_KEY to your .env file.');
    }

    const model = params.model || 'hailuo';
    const modelEndpoint = MODEL_ENDPOINTS[model];

    onProgress?.(`Initializing ${model} video generation...`);

    const aspectRatio = ASPECT_RATIO_MAP[params.aspectRatio || 'landscape'];
    const duration = Math.min(params.duration || 5, 10);

    const requestBody: any = {
      prompt: params.prompt,
      aspect_ratio: aspectRatio,
      duration: duration,
    };

    if (params.resolution) {
      requestBody.quality = params.resolution === '1080p' ? 'high' : 'standard';
    }

    onProgress?.('Submitting video generation request...');

    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelEndpoint,
        input: requestBody
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      console.error('Replicate video API error:', createResponse.status, errorData);
      throw new Error(`Video generation error: ${createResponse.status} - ${errorData.detail || errorData.error || createResponse.statusText}`);
    }

    const prediction = await createResponse.json();

    if (!prediction.id) {
      throw new Error('No prediction ID received from Replicate');
    }

    onProgress?.('Generating video... This may take a few minutes.');

    const maxAttempts = 120;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const status = await statusResponse.json();

      if (status.status === 'succeeded') {
        onProgress?.('Video generated successfully!');

        if (status.output) {
          return Array.isArray(status.output) ? status.output[0] : status.output;
        }

        throw new Error('No video URL in response');
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Video generation failed');
      } else if (status.status === 'canceled') {
        throw new Error('Video generation was canceled');
      }

      const progress = status.logs ? `Processing... ${Math.round((attempts / maxAttempts) * 100)}%` : 'Processing...';
      onProgress?.(progress);
      attempts++;
    }

    throw new Error('Video generation timed out');

  } catch (error: any) {
    console.error('Replicate video generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Replicate');
  }
}

/**
 * Check if Replicate video is available
 */
export function isReplicateVideoAvailable(): boolean {
  const key = import.meta.env.VITE_REPLICATE_API_KEY;
  return !!key && !key.includes('your-');
}

/**
 * Get available video models
 */
export function getAvailableVideoModels() {
  return [
    {
      id: 'hailuo',
      name: 'Hailuo Video',
      description: 'Fast, high-quality video generation (5-10 seconds)',
      maxDuration: 10
    },
    {
      id: 'kling',
      name: 'Kling AI',
      description: 'Cinematic video with great motion (5-10 seconds)',
      maxDuration: 10
    },
    {
      id: 'veo3',
      name: 'Google Veo 3',
      description: 'Latest Google video model with excellent quality',
      maxDuration: 8
    },
    {
      id: 'wan',
      name: 'Wan 2.2',
      description: 'Open-source video generation model',
      maxDuration: 10
    }
  ];
}
