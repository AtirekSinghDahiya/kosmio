/**
 * KIE Veo-3 Text-to-Video Service
 * Integrates with KIE.ai Veo-3 API for AI video generation
 */

interface Veo3VideoRequest {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'veo3_fast' | 'veo3_standard';
  watermark?: string;
  enableTranslation?: boolean;
}

interface Veo3TaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface Veo3StatusResponse {
  code: number;
  msg: string;
  data: {
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    videoUrl?: string;
    error?: string;
  };
}

const KIE_API_BASE = 'https://api.kie.ai/api/v1';

/**
 * Create a video generation task with Veo-3
 */
export async function createVeo3VideoTask(
  request: Veo3VideoRequest,
  apiKey: string
): Promise<string> {
  const requestBody = {
    prompt: request.prompt,
    model: request.model || 'veo3_fast',
    aspectRatio: request.aspectRatio || '16:9',
    watermark: request.watermark || '',
    enableTranslation: request.enableTranslation ?? true,
    generationType: 'TEXT_2_VIDEO',
  };

  console.log('📤 Veo-3 request:', requestBody);

  const response = await fetch(`${KIE_API_BASE}/veo/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('📥 Veo-3 response:', responseText);

  if (!response.ok) {
    console.error('Veo-3 API error:', response.status, responseText);
    throw new Error(`API Error (${response.status}): ${responseText}`);
  }

  const data: Veo3TaskResponse = await response.json();

  if (data.code !== 200) {
    console.error('Veo-3 video generation failed:', data);
    throw new Error(data.msg || 'Failed to create video generation task');
  }

  return data.data.taskId;
}

/**
 * Check the status of a Veo-3 video generation task
 */
export async function checkVeo3TaskStatus(
  taskId: string,
  apiKey: string
): Promise<Veo3StatusResponse['data']> {
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
    console.error('Veo-3 status check error:', response.status, errorText);
    throw new Error(`Status Check Error (${response.status}): ${errorText}`);
  }

  const data: Veo3StatusResponse = await response.json();

  if (data.code !== 200) {
    console.error('Veo-3 status check failed:', data);
    throw new Error(data.msg || 'Failed to check task status');
  }

  return data.data;
}

/**
 * Generate video with Veo-3 and poll for completion
 */
export async function generateAndWaitForVeo3Video(
  request: Veo3VideoRequest,
  apiKey: string,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  const taskId = await createVeo3VideoTask(request, apiKey);
  onProgress?.('Video generation started...', 10);

  const maxAttempts = 120;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = await checkVeo3TaskStatus(taskId, apiKey);
    const progressPercent = 10 + (attempts / maxAttempts) * 80;

    if (status.status === 'SUCCESS' && status.videoUrl) {
      onProgress?.('Video generation complete!', 100);
      return status.videoUrl;
    } else if (status.status === 'FAILED') {
      throw new Error(status.error || 'Video generation failed');
    } else {
      onProgress?.(`Generating video... (${status.status})`, progressPercent);
    }

    attempts++;
  }

  throw new Error('Video generation timed out after 10 minutes');
}
