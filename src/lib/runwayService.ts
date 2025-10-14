const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

const callEdgeFunction = async (action: 'generate' | 'status', params: any) => {
  const requestBody = { action, ...params };

  console.log('📤 Sending to Edge Function:', {
    url: `${SUPABASE_URL}/functions/v1/generate-video`,
    body: requestBody
  });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📥 Edge Function response status:', response.status);

  const responseText = await response.text();
  console.log('📥 Edge Function raw response:', responseText);

  if (!response.ok) {
    throw new Error(`Edge function error (${response.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
};

export const generateVideo = async (request: RunwayVideoRequest): Promise<string> => {
  console.log('🎬 Generating video with Runway ML via Edge Function:', {
    prompt: request.prompt,
    duration: request.duration,
    aspectRatio: request.aspectRatio
  });

  try {
    const result = await callEdgeFunction('generate', {
      prompt: request.prompt,
      duration: request.duration || 5,
      aspectRatio: request.aspectRatio || '16:9'
    });

    console.log('✅ Edge function response:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate video');
    }

    if (!result.taskId) {
      throw new Error('No task ID returned from video generation');
    }

    return result.taskId;
  } catch (error: any) {
    console.error('💥 Video generation error:', error);
    throw new Error(`Failed to generate video: ${error.message}`);
  }
};

export const checkVideoStatus = async (taskId: string): Promise<RunwayVideoResponse> => {
  try {
    const result = await callEdgeFunction('status', { taskId });

    console.log('📊 Status check response:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to check video status');
    }

    return {
      id: taskId,
      status: result.status,
      videoUrl: result.videoUrl,
      progress: result.progress || 0,
      error: result.error
    };
  } catch (error: any) {
    console.error('💥 Status check error:', error);
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
