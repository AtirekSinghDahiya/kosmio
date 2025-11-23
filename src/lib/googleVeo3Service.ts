/**
 * Google Veo 3 Video Generation Service
 * Uses Replicate API with Google Veo 2/3 model
 * Documentation: https://replicate.com/docs
 */

import { generateWithReplicateVideo, isReplicateVideoAvailable, type ReplicateVideoParams } from './replicateVideoService';

export interface Veo3Params {
  prompt: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  resolution?: '720p' | '1080p';
}

/**
 * Generate video using Google Veo 3 via Replicate
 */
export async function generateWithVeo3(
  params: Veo3Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Veo 3 video generation...');

    const replicateParams: ReplicateVideoParams = {
      prompt: params.prompt,
      model: 'veo3',
      duration: params.duration || 8,
      aspectRatio: params.aspectRatio || 'landscape',
      resolution: params.resolution || '720p'
    };

    const videoUrl = await generateWithReplicateVideo(replicateParams, (status) => {
      onProgress?.(`Veo 3: ${status}`);
    });

    return videoUrl;

  } catch (error: any) {
    console.error('Veo 3 generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Veo 3');
  }
}

/**
 * Check if Veo 3 is available
 */
export function isVeo3Available(): boolean {
  return isReplicateVideoAvailable();
}
