/**
 * Kie.ai Sora 2 Text-to-Video Service
 * Official API integration for Sora 2 video generation
 */

const KIE_API_KEY = '8241daa7e6b6271fc75b5a2ecc85e428';
const KIE_API_BASE = 'https://api.kie.ai/api/v1/jobs';

export interface SoraVideoRequest {
  prompt: string;
  aspect_ratio?: 'landscape' | 'portrait';
  n_frames?: '10' | '15';
  remove_watermark?: boolean;
  callBackUrl?: string;
}

interface SoraTaskResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

interface SoraStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'pending' | 'processing' | 'success' | 'fail';
    createTime: number;
    updateTime: number;
    completeTime?: number;
    resultJson?: string;
    failMsg?: string;
    consumeCredits?: number;
    remainedCredits?: number;
  };
}

/**
 * Create a video generation task
 */
export async function createSoraVideoTask(
  request: SoraVideoRequest
): Promise<string> {
  console.log('🎬 [Kie Sora] Creating video task...');
  console.log('📝 Prompt:', request.prompt.substring(0, 100) + '...');

  const requestBody = {
    model: 'sora-2-text-to-video',
    callBackUrl: request.callBackUrl,
    input: {
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio || 'landscape',
      n_frames: request.n_frames || '10',
      remove_watermark: request.remove_watermark ?? true,
    },
  };

  const response = await fetch(`${KIE_API_BASE}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('❌ [Kie Sora] API error:', response.status, errorText);
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const data: SoraTaskResponse = await response.json();

  if (data.code !== 200) {
    console.error('❌ Sora video generation failed:', data);
    throw new Error(data.message || 'Failed to create video generation task');
  }

  console.log('✅ [Kie Sora] Task created:', data.data.taskId);
  return data.data.taskId;
}

/**
 * Check the status of a video generation task
 */
export async function checkSoraTaskStatus(
  taskId: string
): Promise<SoraStatusResponse['data']> {
  const response = await fetch(`${KIE_API_BASE}/queryTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_API_KEY}`,
    },
    body: JSON.stringify({ taskId }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error('❌ Sora status check error:', response.status, errorText);
    throw new Error(`Status Check Error (${response.status}): ${errorText}`);
  }

  const data: SoraStatusResponse = await response.json();

  if (data.code !== 200 && data.code !== 501) {
    console.error('❌ Sora status check failed:', data);
    throw new Error(data.msg || 'Failed to check task status');
  }

  return data.data;
}

/**
 * Generate video and poll for completion
 */
export async function generateAndWaitForSoraVideo(
  request: SoraVideoRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  const taskId = await createSoraVideoTask(request);
  onProgress?.('Video generation started...', 10);

  const maxAttempts = 60; // 5 minutes max (60 * 5s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const status = await checkSoraTaskStatus(taskId);
    const progressPercent = 10 + (attempts / maxAttempts) * 80;

    console.log(`🔄 [Kie Sora] Attempt ${attempts + 1}/${maxAttempts} - Status: ${status.state}`);

    if (status.state === 'success' && status.resultJson) {
      try {
        const result = JSON.parse(status.resultJson);
        const videoUrl = result.resultUrls?.[0];

        if (videoUrl) {
          onProgress?.('Video generation complete!', 100);
          console.log('✅ [Kie Sora] Video URL:', videoUrl);
          console.log('💰 Credits used:', status.consumeCredits);
          console.log('💳 Credits remaining:', status.remainedCredits);
          return videoUrl;
        }
      } catch (e) {
        console.error('❌ Error parsing result JSON:', e);
      }
      throw new Error('Video generation completed but no URL found');
    } else if (status.state === 'fail') {
      throw new Error(status.failMsg || 'Video generation failed');
    } else {
      onProgress?.(`Generating video... (${status.state})`, progressPercent);
    }

    attempts++;
  }

  throw new Error('Video generation timed out after 5 minutes');
}
