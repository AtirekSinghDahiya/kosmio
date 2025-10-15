const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-video`;

export interface PixverseVideoRequest {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  duration?: number;
}

export interface PixverseVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export async function generatePixverseVideo(request: PixverseVideoRequest): Promise<PixverseVideoResponse> {
  console.log('🎬 Generating video with Pixverse:', request);

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate',
        provider: 'pixverse',
        prompt: request.prompt,
        aspectRatio: request.aspect_ratio || '16:9',
        duration: request.duration || 5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Pixverse API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pixverse generation started:', data);

    if (!data.success) {
      console.error('❌ Pixverse API returned error:', data);
      throw new Error(data.error || 'Invalid response from Pixverse API');
    }

    if (!data.taskId) {
      console.error('❌ No taskId in response:', data);
      throw new Error('No video ID returned from Pixverse API');
    }

    return {
      id: data.taskId,
      status: 'processing',
    };
  } catch (error: any) {
    console.error('❌ Pixverse generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Pixverse');
  }
}

export async function pollPixverseStatus(taskId: string): Promise<PixverseVideoResponse> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'status',
        provider: 'pixverse',
        taskId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to check status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Pixverse status:', data);

    if (!data.success) {
      throw new Error(data.error || 'Failed to check video status');
    }

    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    if (data.status === 'completed') status = 'completed';
    else if (data.status === 'failed' || data.status === 'error') status = 'failed';
    else if (data.status === 'pending' || data.status === 'queued') status = 'pending';

    return {
      id: taskId,
      status,
      video_url: data.videoUrl,
      error: data.error,
    };
  } catch (error: any) {
    console.error('❌ Pixverse status check error:', error);
    throw new Error(error.message || 'Failed to check video status');
  }
}

export function isPixverseAvailable(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
