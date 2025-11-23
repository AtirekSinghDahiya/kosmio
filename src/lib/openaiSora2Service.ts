/**
 * Hailuo Video Generation Service (Replaces Sora 2)
 * Uses Replicate API with Hailuo model for high-quality video generation
 * Documentation: https://replicate.com/docs
 */

import { generateWithReplicateVideo, isReplicateVideoAvailable, type ReplicateVideoParams } from './replicateVideoService';

export interface Sora2Params {
  prompt: string;
  duration?: number; // Up to 10 seconds
  resolution?: '720p' | '1080p';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

/**
 * Generate video using Hailuo via Replicate (replaces Sora 2)
 */
export async function generateWithSora2(
  params: Sora2Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Hailuo video generation...');

    const duration = Math.min(params.duration || 5, 10); // Max 10 seconds

    const replicateParams: ReplicateVideoParams = {
      prompt: params.prompt,
      model: 'hailuo',
      duration,
      aspectRatio: params.aspectRatio || 'landscape',
      resolution: params.resolution || '720p'
    };

    const videoUrl = await generateWithReplicateVideo(replicateParams, (status) => {
      onProgress?.(`Hailuo: ${status}`);
    });

    return videoUrl;

  } catch (error: any) {
    console.error('Hailuo (Sora 2 replacement) generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Hailuo');
  }
}

/**
 * Check if Sora 2 (Hailuo) is available
 */
export function isSora2Available(): boolean {
  return isReplicateVideoAvailable();
}
