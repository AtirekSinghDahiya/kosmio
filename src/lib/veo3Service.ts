/**
 * Fal.ai Veo3 Video Generation Service
 * Uses official @fal-ai/client library to access Google's Veo 3 Fast model
 */

import { fal, isFalConfigured } from './falClient';

export interface Veo3Request {
  prompt: string;
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  duration?: '4s' | '6s' | '8s';
  negative_prompt?: string;
  enhance_prompt?: boolean;
  seed?: number;
  auto_fix?: boolean;
  resolution?: '720p' | '1080p';
  generate_audio?: boolean;
}

export interface Veo3Video {
  video: {
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
}

function log(level: 'info' | 'success' | 'error', message: string) {
  const emoji = { info: '🎥', success: '✅', error: '❌' }[level];
  console.log(`${emoji} [Veo3] ${message}`);
}

/**
 * Check if Veo3 is available
 */
export function isVeo3Available(): boolean {
  return isFalConfigured();
}

/**
 * Generate video using Google Veo 3 Fast with the subscribe pattern
 * This automatically handles queuing, polling, and returns the final result
 */
export async function generateVeo3Video(
  request: Veo3Request,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  if (!isFalConfigured()) {
    throw new Error('Fal.ai API key is not configured. Please add VITE_FAL_KEY to your .env file.');
  }

  log('info', 'Starting Google Veo 3 Fast video generation...');
  log('info', `Prompt: ${request.prompt.substring(0, 100)}${request.prompt.length > 100 ? '...' : ''}`);
  log('info', `Settings: ${request.aspect_ratio || '16:9'}, ${request.duration || '8s'}, ${request.resolution || '720p'}`);

  if (request.generate_audio !== undefined) {
    log('info', `Audio: ${request.generate_audio ? 'enabled' : 'disabled (33% discount)'}`);
  }

  try {
    onProgress?.('Submitting video generation request...', 5);

    const result = await fal.subscribe('fal-ai/veo3/fast', {
      input: {
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || '8s',
        negative_prompt: request.negative_prompt,
        enhance_prompt: request.enhance_prompt !== undefined ? request.enhance_prompt : true,
        seed: request.seed,
        auto_fix: request.auto_fix !== undefined ? request.auto_fix : true,
        resolution: request.resolution || '720p',
        generate_audio: request.generate_audio !== undefined ? request.generate_audio : true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_QUEUE') {
          log('info', 'Request queued, waiting for processing...');
          onProgress?.('Waiting in queue...', 10);
        } else if (update.status === 'IN_PROGRESS') {
          log('info', 'Video generation in progress...');
          onProgress?.('Generating video with Veo 3...', 50);

          if (update.logs && update.logs.length > 0) {
            update.logs.forEach((logEntry) => {
              console.log(`[Veo3] ${logEntry.message}`);
            });
          }
        }
      },
    });

    if (!result || !result.data) {
      throw new Error('Invalid response from Veo3: no data returned');
    }

    const videoData = result.data as Veo3Video;

    if (!videoData.video || !videoData.video.url) {
      throw new Error('Invalid response: no video URL returned');
    }

    log('success', 'Video generation completed!');
    log('info', `Video URL: ${videoData.video.url}`);

    if (videoData.video.file_size) {
      const sizeMB = (videoData.video.file_size / (1024 * 1024)).toFixed(2);
      log('info', `File size: ${sizeMB} MB`);
    }

    onProgress?.('Video generation complete!', 100);

    return videoData.video.url;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorBody = error?.body ? JSON.stringify(error.body) : '';
    const statusCode = error?.status || error?.statusCode;

    log('error', `Video generation failed: ${errorMessage}`);
    if (errorBody) {
      log('error', `Error details: ${errorBody}`);
    }
    if (statusCode) {
      log('error', `HTTP Status: ${statusCode}`);
    }

    console.error('Full Veo3 error:', error);

    if (statusCode === 401 || errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      throw new Error('Invalid Fal.ai API key. Please verify your API key is correct and active.');
    } else if (statusCode === 402 || errorMessage.includes('402') || errorMessage.includes('payment') || errorMessage.includes('credits')) {
      throw new Error('Insufficient Fal.ai credits. Please add credits to your Fal.ai account.');
    } else if (statusCode === 403 || errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      throw new Error('Access denied. Your Fal.ai account may not have access to Veo3 model.');
    } else if (statusCode === 404 || errorMessage.includes('404') || errorMessage.includes('not found')) {
      throw new Error('Veo3 model not found. The model may not be available yet or the endpoint has changed.');
    } else if (statusCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    } else if (errorMessage.includes('timeout')) {
      throw new Error('Video generation timed out. Please try with a shorter duration or simpler prompt.');
    } else if (errorMessage.includes('content policy') || errorMessage.includes('safety')) {
      throw new Error('Prompt violates content policy. Please try a different prompt.');
    } else if (errorMessage.includes('ApiError')) {
      throw new Error(`Fal.ai API Error: ${errorMessage}. Please check your Fal.ai account status and API key.`);
    }

    throw new Error(`Veo3 generation failed: ${errorMessage}`);
  }
}

/**
 * Submit a video generation request to the queue (queue pattern)
 * Returns a request ID that can be used to check status later
 */
export async function submitVeo3Request(
  request: Veo3Request
): Promise<string> {
  if (!isFalConfigured()) {
    throw new Error('Fal.ai API key is not configured. Please add VITE_FAL_KEY to your .env file.');
  }

  log('info', 'Submitting request to Veo3 queue...');

  try {
    const { request_id } = await fal.queue.submit('fal-ai/veo3/fast', {
      input: {
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || '8s',
        negative_prompt: request.negative_prompt,
        enhance_prompt: request.enhance_prompt !== undefined ? request.enhance_prompt : true,
        seed: request.seed,
        auto_fix: request.auto_fix !== undefined ? request.auto_fix : true,
        resolution: request.resolution || '720p',
        generate_audio: request.generate_audio !== undefined ? request.generate_audio : true,
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
export async function checkVeo3Status(requestId: string): Promise<any> {
  if (!isFalConfigured()) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const status = await fal.queue.status('fal-ai/veo3/fast', {
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
export async function getVeo3Result(requestId: string): Promise<Veo3Video> {
  if (!isFalConfigured()) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const result = await fal.queue.result('fal-ai/veo3/fast', {
      requestId,
    });

    if (!result || !result.data) {
      throw new Error('Invalid response: no data returned');
    }

    const videoData = result.data as Veo3Video;

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

/**
 * Legacy method names for backwards compatibility
 */
export async function generateAndWaitForVeo3Video(
  request: Veo3Request,
  apiKey: string,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  return generateVeo3Video(request, onProgress);
}
