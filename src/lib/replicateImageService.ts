/**
 * Replicate Image Generation Service
 * Uses Replicate API with FLUX models for high-quality image generation
 * Documentation: https://replicate.com/docs/get-started/nodejs
 */

export interface ReplicateImageParams {
  prompt: string;
  model?: 'flux-schnell' | 'flux-dev' | 'flux-pro';
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
  negativePrompt?: string;
}

const MODEL_ENDPOINTS = {
  'flux-schnell': 'black-forest-labs/flux-schnell',
  'flux-dev': 'black-forest-labs/flux-dev',
  'flux-pro': 'black-forest-labs/flux-1.1-pro'
};

const ASPECT_RATIO_MAP: Record<string, string> = {
  'square': '1:1',
  'landscape': '16:9',
  'portrait': '9:16'
};

/**
 * Generate images using Replicate's FLUX models
 */
export async function generateWithReplicate(
  params: ReplicateImageParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

    if (!API_KEY || API_KEY.includes('your-')) {
      throw new Error('Replicate API key not configured. Please add VITE_REPLICATE_API_KEY to your .env file.');
    }

    const model = params.model || 'flux-schnell';
    const modelEndpoint = MODEL_ENDPOINTS[model];

    onProgress?.(`Initializing ${model} image generation...`);

    const aspectRatio = ASPECT_RATIO_MAP[params.aspectRatio || 'square'];

    const requestBody: any = {
      version: 'latest',
      input: {
        prompt: params.prompt,
        aspect_ratio: aspectRatio,
        num_outputs: params.numberOfImages || 1,
        output_format: 'png',
        output_quality: 90,
      }
    };

    if (params.negativePrompt) {
      requestBody.input.negative_prompt = params.negativePrompt;
    }

    if (model === 'flux-dev') {
      requestBody.input.num_inference_steps = 28;
      requestBody.input.guidance_scale = 3.5;
    } else if (model === 'flux-schnell') {
      requestBody.input.num_inference_steps = 4;
    }

    onProgress?.('Submitting generation request...');

    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        version: modelEndpoint,
        input: requestBody.input
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      console.error('Replicate API error:', createResponse.status, errorData);
      throw new Error(`Image generation error: ${createResponse.status} - ${errorData.detail || errorData.error || createResponse.statusText}`);
    }

    const prediction = await createResponse.json();

    if (!prediction.id) {
      throw new Error('No prediction ID received from Replicate');
    }

    onProgress?.('Generating image...');

    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        onProgress?.('Image generated successfully!');

        if (status.output && status.output.length > 0) {
          return Array.isArray(status.output) ? status.output[0] : status.output;
        }

        throw new Error('No image URL in response');
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Image generation failed');
      } else if (status.status === 'canceled') {
        throw new Error('Image generation was canceled');
      }

      onProgress?.(`Processing... (${status.status})`);
      attempts++;
    }

    throw new Error('Image generation timed out');

  } catch (error: any) {
    console.error('Replicate image generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Replicate');
  }
}

/**
 * Check if Replicate is available
 */
export function isReplicateAvailable(): boolean {
  const key = import.meta.env.VITE_REPLICATE_API_KEY;
  return !!key && !key.includes('your-');
}

/**
 * Get available models
 */
export function getAvailableModels() {
  return [
    {
      id: 'flux-schnell',
      name: 'FLUX Schnell',
      description: 'Fast generation (4 steps, ~10 seconds)',
      speed: 'fast'
    },
    {
      id: 'flux-dev',
      name: 'FLUX Dev',
      description: 'Balanced quality and speed (28 steps, ~30 seconds)',
      speed: 'medium'
    },
    {
      id: 'flux-pro',
      name: 'FLUX Pro',
      description: 'Highest quality (slower, best results)',
      speed: 'slow'
    }
  ];
}
