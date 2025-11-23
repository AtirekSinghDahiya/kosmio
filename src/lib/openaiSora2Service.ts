/**
 * OpenAI Sora 2 Video Generation Service
 * Uses AIMLAPI for video generation
 */

import { generateAndWaitForAimlapiVideo } from './aimlapiVideoService';

export interface Sora2Params {
  prompt: string;
  duration?: number;
  resolution?: '720p' | '1080p';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

/**
 * Generate video using AIMLAPI
 */
export async function generateWithSora2(
  params: Sora2Params,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_AIMLAPI_KEY;

    if (!apiKey || apiKey.includes('your-')) {
      throw new Error('AIMLAPI key not configured. Add VITE_AIMLAPI_KEY to .env file.');
    }

    onProgress?.('Initializing video generation...');

    // Map aspect ratio to AIMLAPI format
    let aspectRatioMapping: '16:9' | '9:16' | '1:1' = '16:9';
    if (params.aspectRatio === 'portrait') {
      aspectRatioMapping = '9:16';
    } else if (params.aspectRatio === 'square') {
      aspectRatioMapping = '1:1';
    }

    // Map duration (max 10 seconds, AIMLAPI supports 4 or 8)
    const duration = (params.duration && params.duration >= 8) ? 8 : 4;

    const videoUrl = await generateAndWaitForAimlapiVideo(
      {
        prompt: params.prompt,
        aspectRatio: aspectRatioMapping,
        duration: duration as 4 | 8,
      },
      apiKey,
      (status, percent) => {
        onProgress?.(`${status} (${percent}%)`);
      }
    );

    return videoUrl;

  } catch (error: any) {
    console.error('Sora 2 generation error:', error);
    throw new Error(error.message || 'Failed to generate video');
  }
}

/**
 * Check if Sora 2 is available
 */
export function isSora2Available(): boolean {
  const apiKey = import.meta.env.VITE_AIMLAPI_KEY;
  return !!(apiKey && !apiKey.includes('your-'));
}
