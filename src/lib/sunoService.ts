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

const SUNO_API_BASE = 'https://api.aimlapi.com/v1/audio';

/**
 * Generate music using Suno AI
 */
export async function generateSunoMusic(
  request: SunoGenerationRequest,
  apiKey: string
): Promise<string> {
  const requestBody: any = {
    prompt: request.prompt,
    style: request.style,
    title: request.title,
    customMode: request.customMode ?? true,
    instrumental: request.instrumental ?? false,
    model: request.model ?? 'V3_5',
    callBackUrl: request.callBackUrl || 'https://example.com/callback',
  };

  if (request.negativeTags) {
    requestBody.negativeTags = request.negativeTags;
  }

  const response = await fetch(`${SUNO_API_BASE}/music/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: request.prompt,
      duration: 'short',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('Suno API error:', response.status, errorText);

    // Try to parse error message
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) {
        throw new Error(`Suno API Error: ${errorData.message}`);
      }
    } catch (e) {
      // Not JSON, use raw text
    }

    throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
  }

  const data: any = await response.json();

  if (!data.id) {
    console.error('Music generation failed:', data);
    const errorMsg = data.error?.message || 'Failed to generate music';
    throw new Error(`Music Error: ${errorMsg}`);
  }

  return data.id;
}

/**
 * Check the status of a music generation task
 */
export async function checkSunoStatus(
  taskId: string,
  apiKey: string
): Promise<SunoStatusResponse['data']> {
  const response = await fetch(
    `${SUNO_API_BASE}/music/generations/${taskId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('Suno status check error:', response.status, errorText);
    throw new Error(`Status Check Error (${response.status}): ${errorText}`);
  }

  const data: any = await response.json();

  if (data.error) {
    console.error('Music status check failed:', data);
    throw new Error(data.error.message || 'Failed to check status');
  }

  return {
    status: data.status === 'succeeded' ? 'SUCCESS' : data.status === 'failed' ? 'FAILED' : 'PROCESSING',
    response: data.status === 'succeeded' ? {
      sunoData: [{
        audioUrl: data.audio_url || data.url,
        title: data.title || 'Generated Music',
        tags: '',
        duration: data.duration || 0,
      }]
    } : undefined,
  };
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
