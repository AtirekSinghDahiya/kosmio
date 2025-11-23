/**
 * Nano Banana Fast Image Generation
 * Uses FAL.ai with Flux Schnell model for fast image generation
 * Documentation: https://fal.ai/models/fal-ai/flux/schnell/api
 */

import { fal } from '@fal-ai/client';

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Flux Schnell via FAL.ai (fast generation)
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const FAL_KEY = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY;

    if (!FAL_KEY) {
      throw new Error('FAL.ai API key not configured');
    }

    // Configure FAL client
    fal.config({
      credentials: FAL_KEY
    });

    onProgress?.('Initializing fast image generation...');

    // Map aspect ratios to FAL format
    const aspectRatioMap: Record<string, string> = {
      'square': 'square',
      'landscape': 'landscape_4_3',
      'portrait': 'portrait_4_3'
    };

    const imageSize = aspectRatioMap[params.aspectRatio || 'square'];

    onProgress?.('Generating image with Flux Schnell...');

    const result: any = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: params.prompt,
        image_size: imageSize,
        num_inference_steps: 4, // Optimal for schnell
        num_images: params.numberOfImages || 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.('Processing...');
        }
      },
    });

    onProgress?.('Image generated successfully!');

    if (result.images && result.images.length > 0) {
      return result.images[0].url;
    }

    throw new Error('No image data in response');

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  const key = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY;
  return !!key;
}
