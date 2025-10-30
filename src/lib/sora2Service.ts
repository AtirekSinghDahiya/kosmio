import { fal } from '@fal-ai/client';

const FAL_API_KEY = import.meta.env.VITE_SORA2_API_KEY || '75d0a2fb-580d-4c8f-9a6d-8d2686ad6b25:a6347de410f07aa6999b04cfd272752a';

fal.config({
  credentials: FAL_API_KEY
});

export interface Sora2Request {
  prompt: string;
  resolution?: '720p';
  aspect_ratio?: '16:9' | '9:16';
  duration?: 4 | 8 | 12;
}

export interface Sora2Response {
  video: {
    url: string;
    content_type: string;
  };
  video_id: string;
}

export const generateSora2Video = async (
  request: Sora2Request,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    onProgress?.('Initializing Sora 2 generation...', 0);

    const result = await fal.subscribe<Sora2Response>('fal-ai/sora-2/text-to-video', {
      input: {
        prompt: request.prompt,
        resolution: request.resolution || '720p',
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || 4
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          const logs = update.logs?.map((log: any) => log.message).join('\n') || '';
          onProgress?.(`Generating video: ${logs}`, 50);
        } else if (update.status === 'COMPLETED') {
          onProgress?.('Video generation complete!', 100);
        }
      }
    });

    if (!result.data?.video?.url) {
      throw new Error('No video URL in response');
    }

    return result.data.video.url;
  } catch (error: any) {
    console.error('Sora 2 generation error:', error);
    throw new Error(`Sora 2 Error: ${error.message || 'Failed to generate video'}`);
  }
};

export const isSora2Available = (): boolean => {
  return !!FAL_API_KEY && FAL_API_KEY.length > 20;
};
