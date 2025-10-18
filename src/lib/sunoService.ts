/**
 * Suno Music Generation Service
 * Integrates with KIE.ai API for AI music generation using Suno V3.5
 */

interface SunoGenerationRequest {
  prompt: string;
  style: string;
  title: string;
  customMode?: boolean;
  instrumental?: boolean;
  model?: string;
  callBackUrl?: string;
  negativeTags?: string;
}

interface SunoGenerationResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

interface SunoStatusResponse {
  code: number;
  message: string;
  data: {
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    response?: {
      sunoData: Array<{
        audioUrl: string;
        title: string;
        tags: string;
        duration: number;
      }>;
    };
  };
}

const SUNO_API_BASE = 'https://api.kie.ai/api/v1';

/**
 * Generate music using Suno AI
 */
export async function generateSunoMusic(
  request: SunoGenerationRequest,
  apiKey: string
): Promise<string> {
  const response = await fetch(`${SUNO_API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: request.prompt,
      style: request.style,
      title: request.title,
      customMode: request.customMode ?? true,
      instrumental: request.instrumental ?? false,
      model: request.model ?? 'V3_5',
      callBackUrl: request.callBackUrl ?? '',
      negativeTags: request.negativeTags ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate music: ${response.statusText}`);
  }

  const data: SunoGenerationResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to generate music');
  }

  return data.data.taskId;
}

/**
 * Check the status of a music generation task
 */
export async function checkSunoStatus(
  taskId: string,
  apiKey: string
): Promise<SunoStatusResponse['data']> {
  const response = await fetch(
    `${SUNO_API_BASE}/generate/record-info?taskId=${taskId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check status: ${response.statusText}`);
  }

  const data: SunoStatusResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to check status');
  }

  return data.data;
}

/**
 * Generate music and wait for completion
 */
export async function generateAndWaitForMusic(
  request: SunoGenerationRequest,
  apiKey: string,
  onProgress?: (status: string) => void
): Promise<Array<{ audioUrl: string; title: string }>> {
  // Start generation
  const taskId = await generateSunoMusic(request, apiKey);
  onProgress?.('Music generation started...');

  // Poll for completion
  const maxAttempts = 60; // 10 minutes max (10 seconds per attempt)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    const status = await checkSunoStatus(taskId, apiKey);

    if (status.status === 'SUCCESS' && status.response) {
      onProgress?.('Music generation complete!');
      return status.response.sunoData.map(track => ({
        audioUrl: track.audioUrl,
        title: track.title,
      }));
    } else if (status.status === 'FAILED') {
      throw new Error('Music generation failed');
    } else {
      onProgress?.(`Generating music... (${status.status})`);
    }

    attempts++;
  }

  throw new Error('Music generation timed out');
}
