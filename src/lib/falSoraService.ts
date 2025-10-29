/**
 * Fal.ai Sora 2 Video Generation Service
 * Uses official @fal-ai/client library to access OpenAI Sora 2 text-to-video model
 */

import { fal } from '@fal-ai/client';

const FAL_KEY = import.meta.env.VITE_FAL_KEY || '';

// Configure fal client with API key
if (FAL_KEY && !FAL_KEY.includes('your-')) {
  fal.config({
    credentials: FAL_KEY
  });
}

export interface FalSoraRequest {
  prompt: string;
  resolution?: '720p';
  aspect_ratio?: '9:16' | '16:9';
  duration?: 4 | 8 | 12;
}

export interface FalSoraVideo {
  video: {
    url: string;
    content_type: string;
    file_name?: string;
    file_size?: number;
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
    num_frames?: number;
  };
  video_id: string;
}

function log(level: 'info' | 'success' | 'error', message: string) {
  const emoji = { info: '🎬', success: '✅', error: '❌' }[level];
  console.log(`${emoji} [Fal.ai Sora] ${message}`);
}

/**
 * Check if Fal.ai Sora is available
 */
export function isFalSoraAvailable(): boolean {
  return !!FAL_KEY && !FAL_KEY.includes('your-');
}

/**
 * Generate video using Fal.ai Sora 2 with the subscribe pattern
 * This automatically handles queuing, polling, and returns the final result
 */
export async function generateFalSoraVideo(
  request: FalSoraRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  if (!FAL_KEY || FAL_KEY.includes('your-')) {
    throw new Error('Fal.ai API key is not configured. Please add VITE_FAL_KEY to your .env file.');
  }

  log('info', 'Starting Fal.ai Sora 2 video generation...');
  log('info', `Prompt: ${request.prompt.substring(0, 100)}${request.prompt.length > 100 ? '...' : ''}`);
  log('info', `Settings: ${request.aspect_ratio || '16:9'}, ${request.duration || 4}s, ${request.resolution || '720p'}`);

  try {
    onProgress?.('Submitting video generation request...', 5);

    const result = await fal.subscribe('fal-ai/sora-2/text-to-video', {
      input: {
        prompt: request.prompt,
        resolution: request.resolution || '720p',
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || 4,
      },
      logs: true,
      onQueueUpdate: (update) => {
        // Handle queue status updates
        if (update.status === 'IN_QUEUE') {
          log('info', 'Request queued, waiting for processing...');
          onProgress?.('Waiting in queue...', 10);
        } else if (update.status === 'IN_PROGRESS') {
          log('info', 'Video generation in progress...');
          onProgress?.('Generating video...', 50);

          // Log any progress messages
          if (update.logs && update.logs.length > 0) {
            update.logs.forEach((logEntry) => {
              console.log(`[Fal.ai] ${logEntry.message}`);
            });
          }
        }
      },
    });

    if (!result || !result.data) {
      throw new Error('Invalid response from Fal.ai: no data returned');
    }

    const videoData = result.data as FalSoraVideo;

    if (!videoData.video || !videoData.video.url) {
      throw new Error('Invalid response: no video URL returned');
    }

    log('success', 'Video generation completed!');
    log('info', `Video URL: ${videoData.video.url}`);
    log('info', `Video ID: ${videoData.video_id}`);

    if (videoData.video.duration) {
      log('info', `Duration: ${videoData.video.duration}s`);
    }
    if (videoData.video.width && videoData.video.height) {
      log('info', `Resolution: ${videoData.video.width}x${videoData.video.height}`);
    }

    onProgress?.('Video generation complete!', 100);

    return videoData.video.url;
  } catch (error: any) {
    log('error', `Video generation failed: ${error.message}`);

    // Provide more helpful error messages
    if (error.message.includes('401') || error.message.includes('authentication')) {
      throw new Error('Invalid Fal.ai API key. Please check your VITE_FAL_KEY configuration.');
    } else if (error.message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Video generation timed out. Please try with a shorter duration or simpler prompt.');
    }

    throw error;
  }
}

/**
 * Legacy method name for backwards compatibility
 */
export async function createAndPollFalSoraVideo(
  request: FalSoraRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  return generateFalSoraVideo(request, onProgress);
}

/**
 * Submit a video generation request to the queue (queue pattern)
 * Returns a request ID that can be used to check status later
 */
export async function submitFalSoraRequest(
  request: FalSoraRequest
): Promise<string> {
  if (!FAL_KEY || FAL_KEY.includes('your-')) {
    throw new Error('Fal.ai API key is not configured. Please add VITE_FAL_KEY to your .env file.');
  }

  log('info', 'Submitting request to Fal.ai Sora 2 queue...');

  try {
    const { request_id } = await fal.queue.submit('fal-ai/sora-2/text-to-video', {
      input: {
        prompt: request.prompt,
        resolution: request.resolution || '720p',
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || 4,
      },
    });

    log('success', `Request submitted: ${request_id}`);
    return request_id;
  } catch (error: any) {
    log('error', `Failed to submit request: ${error.message}`);
    throw error;
  }
}

/**
 * Check the status of a queued video generation request
 */
export async function checkFalSoraStatus(requestId: string): Promise<any> {
  if (!FAL_KEY || FAL_KEY.includes('your-')) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const status = await fal.queue.status('fal-ai/sora-2/text-to-video', {
      requestId,
      logs: true,
    });

    return status;
  } catch (error: any) {
    log('error', `Status check failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get the result of a completed video generation
 */
export async function getFalSoraResult(requestId: string): Promise<FalSoraVideo> {
  if (!FAL_KEY || FAL_KEY.includes('your-')) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const result = await fal.queue.result('fal-ai/sora-2/text-to-video', {
      requestId,
    });

    if (!result || !result.data) {
      throw new Error('Invalid response: no data returned');
    }

    const videoData = result.data as FalSoraVideo;

    if (!videoData.video || !videoData.video.url) {
      throw new Error('Invalid response: no video URL returned');
    }

    log('success', 'Video result retrieved!');
    return videoData;
  } catch (error: any) {
    log('error', `Failed to get result: ${error.message}`);
    throw error;
  }
}
