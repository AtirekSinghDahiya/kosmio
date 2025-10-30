/**
 * Nano Banana Image Generation Service
 * Uses fal.ai nano-banana model for image generation
 */

import { fal } from '@fal-ai/client';

// Configure fal client
const FAL_KEY = import.meta.env.VITE_FAL_KEY;

if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY
  });
}

export interface NanoBananaInput {
  prompt: string;
  num_images?: number;
  output_format?: 'jpeg' | 'png' | 'webp';
  aspect_ratio?: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16';
  sync_mode?: boolean;
}

export interface NanoBananaImage {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
}

export interface NanoBananaOutput {
  images: NanoBananaImage[];
  description?: string;
}

/**
 * Generate an image using Nano Banana
 */
export async function generateNanoBananaImage(
  prompt: string,
  options?: {
    aspectRatio?: string;
    numImages?: number;
    outputFormat?: 'jpeg' | 'png' | 'webp';
  }
): Promise<{ url: string; description?: string }> {
  try {
    console.log('🍌 Generating image with Nano Banana...');
    console.log('🍌 Prompt:', prompt);

    const input: NanoBananaInput = {
      prompt,
      num_images: options?.numImages || 1,
      output_format: options?.outputFormat || 'jpeg',
      aspect_ratio: (options?.aspectRatio as any) || '1:1',
      sync_mode: false
    };

    const result = await fal.subscribe('fal-ai/nano-banana', {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach((msg) => {
            console.log('🍌', msg);
          });
        }
      },
    });

    console.log('✅ Nano Banana result:', result.data);

    if (!result.data || !result.data.images || result.data.images.length === 0) {
      throw new Error('No images generated');
    }

    const imageUrl = result.data.images[0].url;
    const description = result.data.description;

    console.log('✅ Image generated successfully:', imageUrl);

    return {
      url: imageUrl,
      description
    };
  } catch (error: any) {
    console.error('❌ Nano Banana generation error:', error);
    throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  return !!FAL_KEY;
}
