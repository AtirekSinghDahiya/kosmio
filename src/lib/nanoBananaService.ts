import { fal } from '@fal-ai/client';

const FAL_API_KEY = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY || '288cd86d-c5ff-40dc-a54e-3a0800cafc43:44049e7a693bb817738342bfd37b26e0';

fal.config({
  credentials: FAL_API_KEY
});

export interface NanoBananaRequest {
  prompt: string;
  num_images?: number;
  output_format?: 'jpeg' | 'png' | 'webp';
  aspect_ratio?: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16';
  sync_mode?: boolean;
}

export interface NanoBananaResponse {
  images: Array<{
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  }>;
  description?: string;
}

export const generateNanoBananaImage = async (
  request: NanoBananaRequest,
  onProgress?: (status: string, progress: number) => void
): Promise<string[]> => {
  try {
    console.log('🎨 Starting Nano Banana image generation (FREE for all users)');

    if (onProgress && typeof onProgress === 'function') {
      onProgress('Initializing image generation...', 0);
    }

    const result = await fal.subscribe<NanoBananaResponse>('fal-ai/nano-banana', {
      input: {
        prompt: request.prompt,
        num_images: request.num_images || 1,
        output_format: request.output_format || 'jpeg',
        aspect_ratio: request.aspect_ratio || '1:1'
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          const logs = update.logs?.map((log: any) => log.message).join('\n') || '';
          if (onProgress && typeof onProgress === 'function') {
            onProgress(`Generating image...`, 50);
          }
          console.log('📊 Progress:', logs);
        } else if (update.status === 'COMPLETED') {
          if (onProgress && typeof onProgress === 'function') {
            onProgress('Image generation complete!', 100);
          }
        }
      }
    });

    if (!result.data?.images || result.data.images.length === 0) {
      throw new Error('No images were generated');
    }

    console.log('✅ Image generated successfully:', result.data.images.length, 'image(s)');
    return result.data.images.map(img => img.url);
  } catch (error: any) {
    console.error('❌ Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
};

export const isNanoBananaAvailable = (): boolean => {
  const available = !!FAL_API_KEY && FAL_API_KEY.length > 20;
  console.log('🔍 Nano Banana available:', available);
  return available;
};
