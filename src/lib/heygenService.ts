const HEYGEN_API_KEY = import.meta.env.VITE_HEYGEN_API_KEY;
const HEYGEN_API_BASE = 'https://api.heygen.com/v2';

export interface HeyGenVideoRequest {
  script: string;
  avatarId?: string;
  voiceId?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface HeyGenVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export async function generateHeyGenVideo(request: HeyGenVideoRequest): Promise<HeyGenVideoResponse> {
  console.log('🎬 Generating AI avatar video with HeyGen:', request);

  if (!HEYGEN_API_KEY) {
    throw new Error('HeyGen API key not configured');
  }

  try {
    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: request.avatarId || 'Angela-inblackskirt-20220820',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: request.script,
            voice_id: request.voiceId || '1bd001e7e50f421d891986aad5158bc8',
          }
        }
      ],
      dimension: {
        width: request.aspectRatio === '9:16' ? 720 : request.aspectRatio === '1:1' ? 1080 : 1920,
        height: request.aspectRatio === '9:16' ? 1280 : request.aspectRatio === '1:1' ? 1080 : 1080
      },
      test: false
    };

    console.log('📤 HeyGen payload:', payload);

    const response = await fetch(`${HEYGEN_API_BASE}/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('📥 HeyGen raw response:', responseText);

    if (!response.ok) {
      throw new Error(`HeyGen API error (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (data.error) {
      throw new Error(data.error.message || 'HeyGen API error');
    }

    const videoId = data.data?.video_id;
    if (!videoId) {
      throw new Error('No video ID returned from HeyGen API');
    }

    console.log('✅ HeyGen video generation started:', videoId);

    return {
      id: videoId,
      status: 'processing',
    };
  } catch (error: any) {
    console.error('❌ HeyGen generation error:', error);
    throw new Error(error.message || 'Failed to generate video with HeyGen');
  }
}

export async function pollHeyGenStatus(videoId: string): Promise<HeyGenVideoResponse> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HeyGen API key not configured');
  }

  try {
    const response = await fetch(`${HEYGEN_API_BASE}/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    });

    const responseText = await response.text();
    console.log('📊 HeyGen status response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to check status (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (data.error) {
      throw new Error(data.error.message || 'Failed to check video status');
    }

    const videoData = data.data;
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    let videoUrl = null;

    if (videoData.status === 'completed') {
      status = 'completed';
      videoUrl = videoData.video_url;
    } else if (videoData.status === 'failed') {
      status = 'failed';
    } else if (videoData.status === 'pending') {
      status = 'pending';
    }

    return {
      id: videoId,
      status,
      video_url: videoUrl,
      thumbnail_url: videoData.thumbnail_url,
      error: videoData.error,
    };
  } catch (error: any) {
    console.error('❌ HeyGen status check error:', error);
    throw new Error(error.message || 'Failed to check video status');
  }
}

export function isHeyGenAvailable(): boolean {
  return Boolean(HEYGEN_API_KEY);
}
