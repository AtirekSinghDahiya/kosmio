const PIXVERSE_API_KEY = import.meta.env.VITE_PIXVERSE_API_KEY;
const PIXVERSE_API_URL = 'https://api.pixverse.ai/v1';

export interface PixverseVideoRequest {
  prompt: string;
  model?: 'v2' | 'v3';
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  duration?: number;
  motion_strength?: number;
}

export interface PixverseVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export async function generatePixverseVideo(request: PixverseVideoRequest): Promise<PixverseVideoResponse> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('Pixverse API key not configured');
  }

  console.log('🎬 Generating video with Pixverse:', request);

  try {
    const response = await fetch(`${PIXVERSE_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIXVERSE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        model: request.model || 'v3',
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || 5,
        motion_strength: request.motion_strength || 5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Pixverse API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pixverse generation started:', data);

    return {
      id: data.id || data.task_id,
      status: 'processing',
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
    };
  } catch (error: any) {
    console.error('❌ Pixverse generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Pixverse');
  }
}

export async function pollPixverseStatus(taskId: string): Promise<PixverseVideoResponse> {
  if (!PIXVERSE_API_KEY) {
    throw new Error('Pixverse API key not configured');
  }

  try {
    const response = await fetch(`${PIXVERSE_API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PIXVERSE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to check status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Pixverse status:', data);

    return {
      id: taskId,
      status: data.status,
      video_url: data.video_url || data.output?.video_url,
      thumbnail_url: data.thumbnail_url || data.output?.thumbnail_url,
      error: data.error,
    };
  } catch (error: any) {
    console.error('❌ Pixverse status check error:', error);
    throw new Error(error.message || 'Failed to check video status');
  }
}

export function isPixverseAvailable(): boolean {
  return Boolean(PIXVERSE_API_KEY);
}
