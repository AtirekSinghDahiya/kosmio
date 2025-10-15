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

// Import debug helper
import { addDebugLog } from '../components/Debug/DebugPanel';

const activeRequests = new Map<string, Promise<any>>();

const callEdgeFunction = async (action: 'generate' | 'status', params: any) => {
  const requestKey = `${action}-${JSON.stringify(params)}`;

  if (activeRequests.has(requestKey)) {
    console.log('\ud83d\udeab Duplicate request detected, reusing existing request:', requestKey);
    addDebugLog('warning', '\u26a0\ufe0f Duplicate request blocked - reusing existing');
    return activeRequests.get(requestKey)!;
  }

  console.log('\u2705 New request started:', requestKey);

  const requestPromise = (async () => {
    try {
      const requestBody = { action, ...params };

      addDebugLog('info', `📤 Calling Edge Function: ${action}`);
      addDebugLog('info', `Payload: ${JSON.stringify(requestBody, null, 2)}`);

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
      addDebugLog('info', `📥 Response Status: ${response.status}`);

      const responseText = await response.text();
      console.log('📥 Edge Function raw response:', responseText);
      addDebugLog('info', `Response: ${responseText.substring(0, 200)}...`);

      if (!response.ok) {
        addDebugLog('error', `Edge function failed: ${responseText}`);
        throw new Error(`Edge function error (${response.status}): ${responseText}`);
      }

      return JSON.parse(responseText);
    } finally {
      activeRequests.delete(requestKey);
      console.log('🧹 Request cleanup complete:', requestKey);
    }
  })();

  activeRequests.set(requestKey, requestPromise);
  return requestPromise;
};

export const generateVideo = async (request: RunwayVideoRequest): Promise<string> => {
  addDebugLog('info', `🎬 Starting video generation...`);
  addDebugLog('info', `Prompt: "${request.prompt}"`);
  addDebugLog('info', `Duration: ${request.duration}s, Ratio: ${request.aspectRatio}`);

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
      if (result.error && result.error.includes('is not available')) {
        throw new Error('Your Runway API key does not have access to video generation models. Please upgrade your Runway account or contact Runway support to enable API access.');
      }

      addDebugLog('warning', `Edge function failed, trying direct API...`);
      console.log('⚠️ Edge function failed, falling back to direct API');

      const { generateVideoWithRunway } = await import('./directAPIService');
      return await generateVideoWithRunway({
        prompt: request.prompt,
        duration: request.duration || 5,
        aspectRatio: request.aspectRatio || '16:9'
      });
    }

    if (!result.taskId) {
      addDebugLog('error', 'No task ID returned');
      throw new Error('No task ID returned from video generation');
    }

    addDebugLog('success', `✅ Task created: ${result.taskId}`);
    return result.taskId;
  } catch (error: any) {
    console.error('💥 Video generation error:', error);

    if (error.message.includes('Runway API key does not have access')) {
      addDebugLog('error', error.message);
      throw error;
    }

    addDebugLog('warning', `Edge function error, trying direct API...`);

    try {
      const { generateVideoWithRunway } = await import('./directAPIService');
      return await generateVideoWithRunway({
        prompt: request.prompt,
        duration: request.duration || 5,
        aspectRatio: request.aspectRatio || '16:9'
      });
    } catch (directError: any) {
      addDebugLog('error', `Both methods failed: ${directError.message}`);

      if (directError.message === 'Failed to fetch') {
        throw new Error('Your Runway API key does not have access to video generation models. Please upgrade your Runway account or contact Runway support to enable API access.');
      }

      throw new Error(`Failed to generate video: ${directError.message}`);
    }
  }
};

export const checkVideoStatus = async (taskId: string): Promise<RunwayVideoResponse> => {
  try {
    const result = await callEdgeFunction('status', { taskId });

    console.log('📊 Status check response:', result);

    if (!result.success) {
      console.log('⚠️ Edge function status check failed, trying direct API');
      const { checkRunwayVideoStatus } = await import('./directAPIService');
      const directResult = await checkRunwayVideoStatus(taskId);
      return {
        id: taskId,
        status: directResult.status,
        videoUrl: directResult.videoUrl,
        progress: directResult.progress || 0,
        error: directResult.error
      };
    }

    if (result.rawData) {
      addDebugLog('info', `Raw API response: ${JSON.stringify(result.rawData).substring(0, 150)}...`);
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

    try {
      const { checkRunwayVideoStatus } = await import('./directAPIService');
      const directResult = await checkRunwayVideoStatus(taskId);
      return {
        id: taskId,
        status: directResult.status,
        videoUrl: directResult.videoUrl,
        progress: directResult.progress || 0,
        error: directResult.error
      };
    } catch (directError: any) {
      addDebugLog('error', `Both status check methods failed: ${directError.message}`);
      throw new Error(`Failed to check video status: ${directError.message}`);
    }
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
  addDebugLog('info', '⏳ Polling for video completion...');

  while (attempts < maxAttempts) {
    try {
      const status = await checkVideoStatus(taskId);

      if (status.status === 'SUCCEEDED' && status.videoUrl) {
        console.log('✅ Video generation complete!', status.videoUrl);
        addDebugLog('success', `✅ Video ready! URL: ${status.videoUrl}`);
        return status.videoUrl;
      }

      if (status.status === 'FAILED') {
        addDebugLog('error', `Video generation failed: ${status.error || 'Unknown error'}`);
        throw new Error(status.error || 'Video generation failed');
      }

      if (status.status === 'THROTTLED') {
        console.warn('⚠️ Request throttled, waiting longer...');
        addDebugLog('warning', '⚠️ Request throttled, waiting...');
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
      addDebugLog('info', `🔄 Status: ${status.status} (${lastProgress}%)`);

      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error: any) {
      console.error('💥 Error while polling:', error);
      addDebugLog('error', `Polling error: ${error.message}`);
      if (attempts > 5) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
  }

  addDebugLog('error', 'Video generation timed out');
  throw new Error('Video generation timed out after 6 minutes');
};
