/**
 * OpenAI Sora 2 Video Generation Service
 * Official OpenAI Sora 2 API integration
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface SoraVideoRequest {
  prompt: string;
  model?: 'sora-2' | 'sora-2-pro';
  size?: '1920x1080' | '1280x720' | '1080x1920' | '720x1280' | '1024x1024';
  seconds?: '4' | '8' | '16';
  inputReference?: File; // Optional image reference
}

export interface SoraVideo {
  id: string;
  object: string;
  created_at: number;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  model: string;
  progress?: number;
  seconds: string;
  size: string;
  error?: string;
}

function log(level: 'info' | 'success' | 'error', message: string) {
  const emoji = { info: '🎬', success: '✅', error: '❌' }[level];
  console.log(`${emoji} [Sora] ${message}`);
}

/**
 * Create a video generation job
 */
export async function createSoraVideo(
  request: SoraVideoRequest
): Promise<SoraVideo> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  log('info', `Creating video with model: ${request.model || 'sora-2'}`);
  log('info', `Prompt: ${request.prompt.substring(0, 100)}...`);
  log('info', `Settings: ${request.size || '1280x720'}, ${request.seconds || '8'}s`);

  try {
    const formData = new FormData();
    formData.append('model', request.model || 'sora-2');
    formData.append('prompt', request.prompt);
    formData.append('size', request.size || '1280x720');
    formData.append('seconds', request.seconds || '8');

    if (request.inputReference) {
      formData.append('input_reference', request.inputReference);
    }

    const response = await fetch(`${OPENAI_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `HTTP Status: ${response.status}`);
      log('error', `Error Response: ${errorText}`);
      throw new Error(`OpenAI Sora API Error: ${response.status} - ${errorText}`);
    }

    const video: SoraVideo = await response.json();
    log('success', `Video job created: ${video.id}`);
    log('info', `Initial status: ${video.status}`);

    return video;
  } catch (error: any) {
    log('error', `Exception: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieve video status
 */
export async function retrieveSoraVideo(videoId: string): Promise<SoraVideo> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to retrieve video: ${response.status} - ${errorText}`);
    }

    const video: SoraVideo = await response.json();
    return video;
  } catch (error: any) {
    log('error', `Failed to retrieve video: ${error.message}`);
    throw error;
  }
}

/**
 * Download video content
 */
export async function downloadSoraVideoContent(videoId: string): Promise<Blob> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  log('info', `Downloading video content: ${videoId}`);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/videos/${videoId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download video: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    log('success', `Video downloaded: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    return blob;
  } catch (error: any) {
    log('error', `Failed to download video: ${error.message}`);
    throw error;
  }
}

/**
 * Create video and poll until completion
 */
export async function createAndPollSoraVideo(
  request: SoraVideoRequest,
  onProgress?: (status: string, percent: number) => void
): Promise<string> {
  log('info', 'Starting video generation with polling...');

  // Create the video job
  const video = await createSoraVideo(request);
  onProgress?.('Video generation started...', 10);

  let currentVideo = video;
  const maxAttempts = 120; // 10 minutes max (120 * 5s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (currentVideo.status === 'completed') {
      log('success', 'Video generation completed!');
      onProgress?.('Video generation complete!', 100);

      // Download the video content
      const blob = await downloadSoraVideoContent(currentVideo.id);
      const url = URL.createObjectURL(blob);
      return url;
    }

    if (currentVideo.status === 'failed') {
      const errorMsg = currentVideo.error || 'Video generation failed';
      log('error', errorMsg);
      throw new Error(errorMsg);
    }

    // Still in progress
    const progress = currentVideo.progress || 0;
    const calculatedProgress = 10 + (progress * 0.8); // Scale to 10-90%
    onProgress?.(
      `Generating video... (${currentVideo.status}: ${progress}%)`,
      calculatedProgress
    );

    log('info', `Status: ${currentVideo.status}, Progress: ${progress}%`);

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Retrieve updated status
    currentVideo = await retrieveSoraVideo(currentVideo.id);
    attempts++;
  }

  throw new Error('Video generation timed out after 10 minutes');
}

/**
 * Remix an existing video
 */
export async function remixSoraVideo(
  videoId: string,
  prompt: string
): Promise<SoraVideo> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  log('info', `Remixing video: ${videoId}`);
  log('info', `Remix prompt: ${prompt.substring(0, 100)}...`);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/videos/${videoId}/remix`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remix video: ${response.status} - ${errorText}`);
    }

    const video: SoraVideo = await response.json();
    log('success', `Remix job created: ${video.id}`);
    return video;
  } catch (error: any) {
    log('error', `Failed to remix video: ${error.message}`);
    throw error;
  }
}

/**
 * List all videos
 */
export async function listSoraVideos(limit: number = 20): Promise<SoraVideo[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/videos?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list videos: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    log('error', `Failed to list videos: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a video
 */
export async function deleteSoraVideo(videoId: string): Promise<void> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  log('info', `Deleting video: ${videoId}`);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete video: ${response.status} - ${errorText}`);
    }

    log('success', `Video deleted: ${videoId}`);
  } catch (error: any) {
    log('error', `Failed to delete video: ${error.message}`);
    throw error;
  }
}

/**
 * Check if Sora is available
 */
export function isSoraAvailable(): boolean {
  return !!OPENAI_API_KEY;
}
