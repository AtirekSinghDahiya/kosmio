/**
 * Kie AI Sora 2 Service
 * Complete implementation matching Kie AI API documentation
 */

const KIE_API_KEY = import.meta.env.VITE_KIE_API_KEY || '862c447ed6c7380e8b26df05c475ec0c';
const KIE_API_BASE = 'https://api.kie.ai/api/v1';

export interface Sora2GenerateParams {
  prompt: string;
  aspect_ratio?: 'landscape' | 'portrait';
  n_frames?: '10' | '15';
  remove_watermark?: boolean;
}

export interface Sora2TaskResponse {
  code: number;
  message?: string;
  msg?: string;
  data: {
    taskId: string;
    state?: 'success' | 'fail' | 'processing';
    resultJson?: string;
    failMsg?: string;
    resultUrls?: string[];
  };
}

/**
 * Create Sora 2 video generation task
 */
export async function createSora2Task(params: Sora2GenerateParams): Promise<string> {
  const requestBody = {
    model: 'sora-2-text-to-video',
    input: {
      prompt: params.prompt,
      aspect_ratio: params.aspect_ratio || 'landscape',
      n_frames: params.n_frames || '10',
      remove_watermark: params.remove_watermark !== false,
    },
  };

  try {
    const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: Sora2TaskResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || data.msg || 'Task creation failed');
    }

    return data.data.taskId;
  } catch (error) {
    console.error('Error creating Sora 2 task:', error);
    throw error;
  }
}

/**
 * Check Sora 2 task status
 */
export async function checkSora2TaskStatus(taskId: string): Promise<Sora2TaskResponse> {
  try {
    const response = await fetch(`${KIE_API_BASE}/jobs/queryTask/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: Sora2TaskResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking Sora 2 task status:', error);
    throw error;
  }
}

/**
 * Generate Sora 2 video with polling
 */
export async function generateSora2Video(
  params: Sora2GenerateParams,
  onProgress?: (status: string) => void
): Promise<string[]> {
  onProgress?.('Creating Sora 2 task...');
  const taskId = await createSora2Task(params);

  onProgress?.('Processing video...');

  const maxAttempts = 180; // 3 minutes max
  const pollInterval = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const status = await checkSora2TaskStatus(taskId);

    if (status.data.state === 'success') {
      if (status.data.resultJson) {
        const result = JSON.parse(status.data.resultJson);
        if (result.resultUrls && result.resultUrls.length > 0) {
          onProgress?.('Video generated successfully!');
          return result.resultUrls;
        }
      }
      if (status.data.resultUrls && status.data.resultUrls.length > 0) {
        onProgress?.('Video generated successfully!');
        return status.data.resultUrls;
      }
    }

    if (status.data.state === 'fail') {
      throw new Error(status.data.failMsg || 'Video generation failed');
    }

    onProgress?.(`Processing... (${attempt + 1}/${maxAttempts})`);
  }

  throw new Error('Video generation timed out');
}

export function isSora2Available(): boolean {
  return !!KIE_API_KEY;
}
