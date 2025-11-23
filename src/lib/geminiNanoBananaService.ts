/**
 * Nano Banana Fast Image Generation
 * Uses Replicate API with Flux Schnell model for fast image generation
 * Documentation: https://replicate.com/docs
 */

import { generateWithReplicate, isReplicateAvailable, type ReplicateImageParams } from './replicateImageService';

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Flux Schnell via Replicate (fast generation)
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Nano Banana fast generation...');

    const replicateParams: ReplicateImageParams = {
      prompt: params.prompt,
      model: 'flux-schnell',
      aspectRatio: params.aspectRatio || 'square',
      numberOfImages: params.numberOfImages || 1
    };

    const imageUrl = await generateWithReplicate(replicateParams, (status) => {
      onProgress?.(`Nano Banana: ${status}`);
    });

    return imageUrl;

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  return isReplicateAvailable();
}
