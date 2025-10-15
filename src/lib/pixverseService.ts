const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-video`;
const PIXVERSE_API_KEY = import.meta.env.VITE_PIXVERSE_API_KEY;
const PIXVERSE_API_BASE = "https://app-api.pixverse.ai/openapi/v2";

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
    const traceId = crypto.randomUUID();
    const payload = {
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio || '16:9',
      duration: request.duration || 5,
      model: 'v4.5',
      motion_mode: 'normal',
      quality: '540p',
      seed: Math.floor(Math.random() * 1000000),
      water_mark: false
    };

    const response = await fetch(`${PIXVERSE_API_BASE}/video/text/generate`, {
      method: 'POST',
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Ai-trace-id': traceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Raw Pixverse response:', responseText);

    if (!response.ok) {
      throw new Error(`Pixverse API error (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('✅ Pixverse generation started:', data);

    let videoId = null;
    if (data.Resp && data.Resp.video_id) {
      videoId = data.Resp.video_id;
    } else if (data.video_id) {
      videoId = data.video_id;
    } else if (data.id) {
      videoId = data.id;
    }

    if (!videoId && data.ErrCode !== 0) {
      throw new Error(data.ErrMsg || `Pixverse API error: ${data.ErrCode}`);
    }

    if (!videoId) {
      throw new Error(`No video_id in response. Full response: ${responseText}`);
    }

    return {
      id: videoId,
      status: 'processing',
    };
  } catch (error: any) {
    console.error('❌ Pixverse generation error:', error);
    throw new Error(error.message || 'Failed to generate video with Pixverse');
  }
}

export async function pollPixverseStatus(taskId: string): Promise<PixverseVideoResponse> {
  try {
    const response = await fetch(`${PIXVERSE_API_BASE}/video/result/${taskId}`, {
      method: 'GET',
      headers: {
        'API-KEY': PIXVERSE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Raw Pixverse status response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to check status (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('📊 Pixverse status:', data);

    let videoUrl = null;
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    let statusCode = data.status || data.code || (data.Resp && data.Resp.status);

    if (statusCode === 1 || data.Resp?.status === 1) {
      status = 'completed';
      videoUrl = data.url || data.video_url || data.Resp?.url || data.Resp?.video_url;
    } else if (statusCode === 5 || data.Resp?.status === 5) {
      status = 'processing';
    } else if (statusCode === 7 || statusCode === 8 || data.Resp?.status === 7 || data.Resp?.status === 8) {
      status = 'failed';
    }

    return {
      id: taskId,
      status,
      video_url: videoUrl,
      error: statusCode === 7 ? 'Content moderation failure' : statusCode === 8 ? 'Generation failed' : undefined,
    };
  } catch (error: any) {
    console.error('❌ Pixverse status check error:', error);
    throw new Error(error.message || 'Failed to check video status');
  }
}

export function isPixverseAvailable(): boolean {
  return Boolean(PIXVERSE_API_KEY);
}
