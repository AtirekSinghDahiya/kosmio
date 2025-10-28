/**
 * Fal.ai Sora 2 Video Generation Service
 * Uses Fal.ai API to access OpenAI Sora 2 text-to-video model
 */

const FAL_KEY = import.meta.env.VITE_FAL_KEY || '';
const FAL_SORA_ENDPOINT = 'fal-ai/sora-2/text-to-video';

export interface FalSoraRequest {
  prompt: string;
  resolution?: '720p';
  aspect_ratio?: '9:16' | '16:9';
  duration?: 4 | 8 | 12;
  api_key?: string;
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

export interface FalQueueStatus {
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  logs?: Array<{ message: string; timestamp: string }>;
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
 * Create headers for Fal.ai API
 */
function createHeaders(): HeadersInit {
  return {
    'Authorization': `Key ${FAL_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Submit a video generation request to the queue
 */
export async function submitFalSoraRequest(
  request: FalSoraRequest
): Promise<string> {
  if (!FAL_KEY) {
    throw new Error('Fal.ai API key is not configured. Please add VITE_FAL_KEY to your .env file.');
  }

  log('info', `Submitting request to Fal.ai Sora 2`);
  log('info', `Prompt: ${request.prompt.substring(0, 100)}...`);
  log('info', `Settings: ${request.aspect_ratio || '16:9'}, ${request.duration || 4}s`);

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/sora-2/text-to-video', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        prompt: request.prompt,
        resolution: request.resolution || '720p',
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || 4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `HTTP Status: ${response.status}`);
      log('error', `Error Response: ${errorText}`);
      throw new Error(`Fal.ai API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const requestId = data.request_id;

    if (!requestId) {
      throw new Error('No request ID returned from Fal.ai');
    }

    log('success', `Request submitted: ${requestId}`);
    return requestId;
  } catch (error: any) {
    log('error', `Exception: ${error.message}`);
    throw error;
  }
}

/**
 * Check the status of a video generation request
 */
export async function checkFalSoraStatus(requestId: string): Promise<FalQueueStatus> {
  if (!FAL_KEY) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const response = await fetch(
      `https://queue.fal.run/fal-ai/sora-2/text-to-video/requests/${requestId}/status`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      logs: data.logs,
    };
  } catch (error: any) {
    log('error', `Status check failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get the result of a completed video generation
 */
export async function getFalSoraResult(requestId: string): Promise<FalSoraVideo> {
  if (!FAL_KEY) {
    throw new Error('Fal.ai API key is not configured');
  }

  try {
    const response = await fetch(
      `https://queue.fal.run/fal-ai/sora-2/text-to-video/requests/${requestId}`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get result: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.video || !result.video.url) {
      throw new Error('Invalid response: no video URL returned');
    }

    log('success', 'Video generation completed!');
    return result;
  } catch (error: any) {
    log('error', `Failed to get result: ${error.message}`);
    throw error;
  }
}

/**
 * Generate video and poll until completion
 */
export async function createAndPollFalSoraVideo(
  request: FalSoraRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  log('info', 'Starting Fal.ai Sora 2 video generation...');

  // Submit the request
  const requestId = await submitFalSoraRequest(request);
  onProgress?.('Video generation started...', 10);

  const maxAttempts = 120; // 10 minutes max (120 * 5s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    try {
      const status = await checkFalSoraStatus(requestId);

      if (status.status === 'COMPLETED') {
        log('success', 'Video generation completed!');
        onProgress?.('Video generation complete!', 100);

        // Get the final result
        const result = await getFalSoraResult(requestId);
        return result.video.url;
      }

      if (status.status === 'FAILED') {
        log('error', 'Video generation failed');
        throw new Error('Video generation failed');
      }

      // Still in progress
      const progress = 10 + (attempts / maxAttempts) * 80; // Scale to 10-90%
      const statusMessage = status.status === 'IN_PROGRESS'
        ? 'Generating video...'
        : 'Queued...';

      onProgress?.(statusMessage, progress);
      log('info', `Status: ${status.status}, Progress: ${Math.round(progress)}%`);

      // Log any new messages
      if (status.logs && status.logs.length > 0) {
        status.logs.forEach(log => {
          console.log(`[Fal.ai Log] ${log.message}`);
        });
      }

      attempts++;
    } catch (error: any) {
      log('error', `Error during polling: ${error.message}`);
      throw error;
    }
  }

  throw new Error('Video generation timed out after 10 minutes');
}

/**
 * Generate video using the subscribe pattern (blocking until complete)
 */
export async function generateFalSoraVideo(
  request: FalSoraRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  // This uses the same polling approach as createAndPollFalSoraVideo
  // but with a cleaner API name
  return createAndPollFalSoraVideo(request, onProgress);
}
