/**
 * Google Imagen Image Generation Service
 * Uses FAL.ai with Flux Pro model for high-quality image generation
 * Documentation: https://fal.ai/models/fal-ai/flux/dev/api
 */

import { fal } from '@fal-ai/client';

export interface ImagenParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  negativePrompt?: string;
  numberOfImages?: number;
}

export interface ImagenResult {
  url: string;
  mimeType: string;
}

/**
 * Generate images using Flux Dev via FAL.ai
 */
export async function generateWithImagen(
  params: ImagenParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const FAL_KEY = import.meta.env.VITE_FAL_KEY;

    if (!FAL_KEY) {
      throw new Error('FAL.ai API key not configured');
    }

    // Configure FAL client
    fal.config({
      credentials: FAL_KEY
    });

    onProgress?.('Initializing image generation...');

    // Map aspect ratios to FAL format
    const aspectRatioMap: Record<string, string> = {
      'square': 'square',
      'landscape': 'landscape_4_3',
      'portrait': 'portrait_4_3'
    };

    const imageSize = aspectRatioMap[params.aspectRatio || 'square'];

    onProgress?.('Generating image with Flux Dev...');

    const result: any = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: params.prompt,
        image_size: imageSize,
        num_inference_steps: 28, // Higher quality for dev model
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
    console.error('Imagen generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Imagen');
  }
}

/**
 * Check if Imagen is available
 */
export function isImagenAvailable(): boolean {
  const key = import.meta.env.VITE_FAL_KEY;
  return !!key;
}
