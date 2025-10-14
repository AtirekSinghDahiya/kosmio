const RUNWAY_API_KEY = import.meta.env.VITE_RUNWAY_API_KEY;
const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1';

export interface RunwayVideoRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: 'gen3a_turbo';
}

export interface RunwayVideoResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export const generateVideo = async (request: RunwayVideoRequest): Promise<string> => {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway ML API key not configured');
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/text-to-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: request.prompt,
        model: request.model || 'gen3a_turbo',
        duration: request.duration || 5,
        ratio: request.aspectRatio || '16:9',
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Runway API error: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error: any) {
    console.error('Runway video generation error:', error);
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
        'X-Runway-Version': '2024-11-06'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check video status: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      status: data.status,
      videoUrl: data.output?.[0] || data.artifacts?.[0]?.url,
      progress: data.progress || 0,
      error: data.failure || data.error
    };
  } catch (error: any) {
    console.error('Runway status check error:', error);
    throw new Error(`Failed to check video status: ${error.message}`);
  }
};

export const pollVideoStatus = async (
  taskId: string,
  onProgress?: (progress: number) => void,
  maxAttempts = 60,
  interval = 5000
): Promise<string> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkVideoStatus(taskId);

    if (status.status === 'SUCCEEDED' && status.videoUrl) {
      return status.videoUrl;
    }

    if (status.status === 'FAILED') {
      throw new Error(status.error || 'Video generation failed');
    }

    if (onProgress && status.progress) {
      onProgress(status.progress);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('Video generation timed out');
};
