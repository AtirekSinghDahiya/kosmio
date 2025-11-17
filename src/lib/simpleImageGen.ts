/**
 * Simple Image Generation Service using FAL.ai
 * Reliable image generation with Flux model
 */

import { fal } from './falClient';

export interface ImageResult {
  url: string;
  seed?: number;
}

/**
 * Generate image using FAL.ai Flux model
 */
export async function generateImageSimple(
  prompt: string,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing image generation...');

    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt,
        image_size: 'square_hd',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.('Generating your image...');
        } else if (update.status === 'IN_QUEUE') {
          onProgress?.('Waiting in queue...');
        }
      },
    });

    const output = result.data as any;

    if (!output?.images?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    onProgress?.('Image generated successfully!');
    return output.images[0].url;

  } catch (error: any) {
    console.error('Image generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
}

/**
 * Check if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  return !!import.meta.env.VITE_FAL_KEY;
}
