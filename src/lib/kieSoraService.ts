/**
 * KIE Sora 2 Text-to-Video Service
 * Integrates with KIE.ai API for AI video generation using Sora 2 Pro
 */

interface SoraVideoRequest {
  prompt: string;
  aspect_ratio?: 'landscape' | 'portrait';
  n_frames?: '10' | '15';
  size?: 'standard' | 'high';
  remove_watermark?: boolean;
}

interface SoraTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface SoraStatusResponse {
  code: number;
  msg: string;
  data: {
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    resultUrls?: string[];
    error?: string;
  };
}

const KIE_API_BASE = 'https://api.kie.ai/api/v1';

/**
 * Create a video generation task
 */
export async function createSoraVideoTask(
  request: SoraVideoRequest,
  apiKey: string
): Promise<string> {
  const requestBody = {
    model: 'sora-2-pro-text-to-video',
    input: {
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio || 'landscape',
      n_frames: request.n_frames || '10',
      size: request.size || 'high',
      remove_watermark: request.remove_watermark ?? true,
    },
  };

  const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('KIE Sora API error:', response.status, errorText);
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const data: SoraTaskResponse = await response.json();

  if (data.code !== 200) {
    console.error('Sora video generation failed:', data);
    throw new Error(data.msg || 'Failed to create video generation task');
  }

  return data.data.taskId;
}

/**
 * Check the status of a video generation task
 */
export async function checkSoraTaskStatus(
  taskId: string,
  apiKey: string
): Promise<SoraStatusResponse['data']> {
  const response = await fetch(
    `${KIE_API_BASE}/jobs/getTask?taskId=${taskId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('Sora status check error:', response.status, errorText);
    throw new Error(`Status Check Error (${response.status}): ${errorText}`);
  }

  const data: SoraStatusResponse = await response.json();

  if (data.code !== 200) {
    console.error('Sora status check failed:', data);
    throw new Error(data.msg || 'Failed to check task status');
  }

  return data.data;
}

/**
 * Generate video and poll for completion
 */
export async function generateAndWaitForSoraVideo(
  request: SoraVideoRequest,
  apiKey: string,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  const taskId = await createSoraVideoTask(request, apiKey);
  onProgress?.('Video generation started...', 10);

  const maxAttempts = 120;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = await checkSoraTaskStatus(taskId, apiKey);
    const progressPercent = 10 + (attempts / maxAttempts) * 80;

    if (status.status === 'SUCCESS' && status.resultUrls && status.resultUrls.length > 0) {
      onProgress?.('Video generation complete!', 100);
      return status.resultUrls[0];
    } else if (status.status === 'FAILED') {
      throw new Error(status.error || 'Video generation failed');
    } else {
      onProgress?.(`Generating video... (${status.status})`, progressPercent);
    }

    attempts++;
  }

  throw new Error('Video generation timed out after 10 minutes');
}
