const RUNWAY_API_KEY = import.meta.env.VITE_RUNWAY_API_KEY;
const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';

export interface RunwayVideoRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'gen3a_turbo';
}

export interface RunwayVideoResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'THROTTLED';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export const generateVideo = async (request: RunwayVideoRequest): Promise<string> => {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway ML API key not configured. Please add VITE_RUNWAY_API_KEY to your .env file.');
  }

  console.log('🎬 Generating video with Runway ML:', {
    prompt: request.prompt,
    duration: request.duration,
    aspectRatio: request.aspectRatio
  });

  try {
    const payload = {
      promptText: request.prompt,
      model: request.model || 'gen3a_turbo',
      duration: request.duration || 5,
      ratio: request.aspectRatio || '16:9',
      watermark: false
    };

    console.log('📤 Request payload:', payload);

    const response = await fetch(`${RUNWAY_API_BASE}/image-to-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Runway API error (${response.status}): ${errorText}`);
      }

      throw new Error(errorData.message || errorData.error || `Runway API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Task created:', data);

    if (!data.id) {
      throw new Error('No task ID returned from Runway API');
    }

    return data.id;
  } catch (error: any) {
    console.error('💥 Runway video generation error:', error);
    throw new Error(`Failed to generate video: ${error.message}`);
  }
};

export const checkVideoStatus = async (taskId: string): Promise<RunwayVideoResponse> => {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway ML API key not configured');
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Status check error:', errorText);
      throw new Error(`Failed to check video status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Task status:', data);

    let videoUrl = null;
    if (data.status === 'SUCCEEDED') {
      videoUrl = data.output?.[0] || data.artifacts?.[0]?.url || data.output?.url || data.video?.url;
    }

    return {
      id: data.id,
      status: data.status,
      videoUrl,
      progress: data.progress || (data.status === 'RUNNING' ? 50 : 0),
      error: data.failure || data.failureReason || data.error
    };
  } catch (error: any) {
    console.error('💥 Runway status check error:', error);
    throw new Error(`Failed to check video status: ${error.message}`);
  }
};

export const pollVideoStatus = async (
  taskId: string,
  onProgress?: (progress: number) => void,
  maxAttempts = 120,
  interval = 3000
): Promise<string> => {
  let attempts = 0;
  let lastProgress = 0;

  console.log('⏳ Starting to poll for video completion...');

  while (attempts < maxAttempts) {
    try {
      const status = await checkVideoStatus(taskId);

      if (status.status === 'SUCCEEDED' && status.videoUrl) {
        console.log('✅ Video generation complete!', status.videoUrl);
        return status.videoUrl;
      }

      if (status.status === 'FAILED') {
        throw new Error(status.error || 'Video generation failed');
      }

      if (status.status === 'THROTTLED') {
        console.warn('⚠️ Request throttled, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }

      if (status.status === 'RUNNING' || status.status === 'PENDING') {
        lastProgress = Math.min(lastProgress + 2, 95);
        if (onProgress) {
          onProgress(lastProgress);
        }
      }

      console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts} - Status: ${status.status} - Progress: ${lastProgress}%`);

      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error: any) {
      console.error('💥 Error while polling:', error);
      if (attempts > 5) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
  }

  throw new Error('Video generation timed out after 6 minutes');
};
