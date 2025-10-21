/**
 * AIMLAPI Veo-3 Text-to-Video Service
 * Integrates with AIMLAPI for Google Veo-3 video generation
 */

interface AimlapiVideoRequest {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: 4 | 8;
  seed?: number;
}

interface AimlapiVideoResponse {
  id: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

const AIMLAPI_BASE = 'https://api.aimlapi.com/v2/generate/video/google';

/**
 * Generate video with AIMLAPI Veo-3
 */
export async function generateAimlapiVideo(
  request: AimlapiVideoRequest,
  apiKey: string
): Promise<AimlapiVideoResponse> {
  const requestBody = {
    model: 'google/veo-3.1-t2v-fast',
    prompt: request.prompt,
    aspect_ratio: request.aspectRatio || '16:9',
    duration: request.duration || 4,
    seed: request.seed || Math.floor(Math.random() * 1000000),
  };

  console.log('📤 AIMLAPI Veo-3 request:', requestBody);

  const response = await fetch(`${AIMLAPI_BASE}/generation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('📥 AIMLAPI response:', responseText);

  if (!response.ok) {
    console.error('AIMLAPI error:', response.status, responseText);
    throw new Error(`API Error (${response.status}): ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return data;
}

/**
 * Check the status of an AIMLAPI video generation
 */
export async function checkAimlapiVideoStatus(
  generationId: string,
  apiKey: string
): Promise<AimlapiVideoResponse> {
  const response = await fetch(`${AIMLAPI_BASE}/generation/${generationId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('AIMLAPI status check error:', response.status, errorText);
    throw new Error(`Status Check Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Generate video with AIMLAPI and poll for completion
 */
export async function generateAndWaitForAimlapiVideo(
  request: AimlapiVideoRequest,
  apiKey: string,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  const result = await generateAimlapiVideo(request, apiKey);
  onProgress?.('Video generation started...', 10);

  const maxAttempts = 120;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = await checkAimlapiVideoStatus(result.id, apiKey);
    const progressPercent = 10 + (attempts / maxAttempts) * 80;

    if (status.status === 'completed' && status.video_url) {
      onProgress?.('Video generation complete!', 100);
      return status.video_url;
    } else if (status.status === 'failed') {
      throw new Error(status.error || 'Video generation failed');
    } else {
      onProgress?.(`Generating video... (${status.status})`, progressPercent);
    }

    attempts++;
  }

  throw new Error('Video generation timed out after 10 minutes');
}

/**
 * Check if AIMLAPI is available
 */
export function isAimlapiAvailable(): boolean {
  return Boolean(import.meta.env.VITE_AIMLAPI_KEY);
}
