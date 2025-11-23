/**
 * Google Imagen Image Generation Service
 * Uses Replicate API with Flux Pro model for high-quality image generation
 * Documentation: https://replicate.com/docs
 */

import { generateWithReplicate, isReplicateAvailable, type ReplicateImageParams } from './replicateImageService';

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
 * Generate images using Flux Pro via Replicate (high quality)
 */
export async function generateWithImagen(
  params: ImagenParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Imagen high-quality generation...');

    const replicateParams: ReplicateImageParams = {
      prompt: params.prompt,
      model: 'flux-pro',
      aspectRatio: params.aspectRatio || 'square',
      numberOfImages: params.numberOfImages || 1,
      negativePrompt: params.negativePrompt
    };

    const imageUrl = await generateWithReplicate(replicateParams, (status) => {
      onProgress?.(`Imagen: ${status}`);
    });

    return imageUrl;

  } catch (error: any) {
    console.error('Imagen generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Imagen');
  }
}

/**
 * Check if Imagen is available
 */
export function isImagenAvailable(): boolean {
  return isReplicateAvailable();
}
