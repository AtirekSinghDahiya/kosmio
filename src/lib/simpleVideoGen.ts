/**
 * Simple Video Generation Service using FAL.ai
 * Reliable video generation with multiple models
 */

import { fal } from './falClient';

export type VideoModel = 'veo-3' | 'sora-2' | 'veo-3-legacy';

export interface VideoParams {
  prompt: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  duration?: 4 | 6 | 8;
}

/**
 * Generate video using FAL.ai
 */
export async function generateVideoSimple(
  params: VideoParams,
  model: VideoModel = 'veo-3',
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing video generation...');

    // Map to FAL.ai model IDs
    const modelMap: Record<VideoModel, string> = {
      'veo-3': 'fal-ai/veo-3',
      'sora-2': 'fal-ai/sora',
      'veo-3-legacy': 'fal-ai/veo'
    };

    const falModel = modelMap[model];

    // Map aspect ratio
    const aspectRatioMap: Record<string, string> = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    const result = await fal.subscribe(falModel, {
      input: {
        prompt: params.prompt,
        aspect_ratio: aspectRatioMap[params.aspectRatio || 'landscape'],
        duration: params.duration || 8
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          onProgress?.('Generating your video...');
        } else if (update.status === 'IN_QUEUE') {
          const position = (update as any).queue_position;
          onProgress?.(`Waiting in queue... (position: ${position || '?'})`);
        }
      },
    });

    const output = result.data as any;

    if (!output?.video?.url) {
      throw new Error('No video URL in response');
    }

    onProgress?.('Video generated successfully!');
    return output.video.url;

  } catch (error: any) {
    console.error('Video generation error:', error);
    throw new Error(error.message || 'Failed to generate video');
  }
}

/**
 * Check if video generation is available
 */
export function isVideoGenerationAvailable(): boolean {
  return !!import.meta.env.VITE_FAL_KEY;
}
