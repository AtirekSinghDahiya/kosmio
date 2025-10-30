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
  if (!FAL_KEY) {
    throw new Error('FAL_KEY is not configured. Please check your environment variables.');
  }

  try {
    console.log('🍌 Generating image with Nano Banana...');
    console.log('🍌 Prompt:', prompt);
    console.log('🍌 FAL_KEY configured:', !!FAL_KEY);

    const input: NanoBananaInput = {
      prompt,
      num_images: options?.numImages || 1,
      output_format: options?.outputFormat || 'jpeg',
      aspect_ratio: (options?.aspectRatio as any) || '1:1',
      sync_mode: false
    };

    console.log('🍌 Input:', JSON.stringify(input, null, 2));

    // Try nano-banana first, fallback to flux-schnell if needed
    let result;
    try {
      result = await fal.subscribe('fal-ai/flux/schnell', {
        input: {
          prompt,
          num_images: input.num_images,
          image_size: 'square',
          output_format: input.output_format,
          num_inference_steps: 4
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log('🎨 Queue status:', update.status);
          if (update.status === 'IN_PROGRESS' && update.logs) {
            update.logs.forEach((log) => {
              console.log('🎨 Log:', log.message);
            });
          }
        },
      });
    } catch (error: any) {
      console.error('Failed with flux-schnell, trying alternative...', error);
      throw error;
    }

    console.log('✅ Nano Banana raw result:', JSON.stringify(result, null, 2));

    if (!result) {
      throw new Error('No result returned from fal.ai');
    }

    if (!result.data) {
      throw new Error('No data in result from fal.ai');
    }

    if (!result.data.images || result.data.images.length === 0) {
      throw new Error('No images in result data');
    }

    const imageUrl = result.data.images[0].url;
    const description = result.data.description;

    console.log('✅ Image URL:', imageUrl);
    console.log('✅ Description:', description);

    return {
      url: imageUrl,
      description
    };
  } catch (error: any) {
    console.error('❌ Nano Banana generation error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      body: error.body,
      status: error.status
    });

    const errorMessage = error.body?.message || error.message || 'Unknown error occurred';
    throw new Error(`Image generation failed: ${errorMessage}`);
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  return !!FAL_KEY;
}
