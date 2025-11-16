/**
 * Kie AI Veo 3 Service
 * Complete implementation matching Kie AI API documentation
 */

const KIE_API_KEY = '8241daa7e6b6271fc75b5a2ecc85e428';
const KIE_API_BASE = 'https://api.kie.ai/api/v1';

export interface Veo3GenerateParams {
  prompt: string;
  imageUrls?: string[];
  model?: 'veo3_fast' | 'veo3';
  watermark?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  seeds?: number;
  enableFallback?: boolean;
  enableTranslation?: boolean;
  generationType?: 'TEXT_2_VIDEO' | 'IMAGE_2_VIDEO' | 'REFERENCE_2_VIDEO';
}

export interface Veo3TaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

/**
 * Generate Veo 3 video
 */
export async function generateVeo3Video(
  params: Veo3GenerateParams,
  onProgress?: (status: string) => void
): Promise<string> {
  const requestBody = {
    prompt: params.prompt,
    imageUrls: params.imageUrls || [],
    model: params.model || 'veo3_fast',
    aspectRatio: params.aspectRatio || '16:9',
    seeds: params.seeds,
    enableFallback: params.enableFallback !== false,
    enableTranslation: params.enableTranslation !== false,
    generationType: params.generationType || 'TEXT_2_VIDEO',
  };

  if (params.watermark) {
    (requestBody as any).watermark = params.watermark;
  }

  try {
    onProgress?.('Creating Veo 3 task...');

    const response = await fetch(`${KIE_API_BASE}/veo/generate`, {
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

    const data = await response.json();
    const taskId = data.task_id || data.taskId;

    if (!taskId) {
      throw new Error('No task ID returned');
    }

    onProgress?.('Processing video...');

    // Poll for completion
    const maxAttempts = 180;
    const pollInterval = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`${KIE_API_BASE}/veo/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed' && statusData.video_url) {
        onProgress?.('Video generated successfully!');
        return statusData.video_url;
      }

      if (statusData.status === 'failed') {
        throw new Error(statusData.error || 'Video generation failed');
      }

      onProgress?.(`Processing... (${attempt + 1}/${maxAttempts})`);
    }

    throw new Error('Video generation timed out');
  } catch (error) {
    console.error('Error generating Veo 3 video:', error);
    throw error;
  }
}

export function isVeo3Available(): boolean {
  return !!KIE_API_KEY;
}
