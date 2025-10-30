import { fal } from '@fal-ai/client';

const FAL_API_KEY = import.meta.env.VITE_VEO3_API_KEY || '706e64d2-2ccc-4b42-b6e7-adf2585c8c6c:bb97d6a4b403a9b35e75e5ee82525ad7';

fal.config({
  credentials: FAL_API_KEY
});

export interface Veo3Request {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  duration?: '4s' | '6s' | '8s';
  negative_prompt?: string;
  enhance_prompt?: boolean;
  seed?: number;
  auto_fix?: boolean;
  resolution?: '720p' | '1080p';
  generate_audio?: boolean;
}

export interface Veo3Response {
  video: {
    url: string;
    content_type?: string;
  };
}

export const generateVeo3VideoNew = async (
  request: Veo3Request,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    onProgress?.('Initializing Veo 3 generation...', 0);

    const result = await fal.subscribe<Veo3Response>('fal-ai/veo3/fast', {
      input: {
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || '16:9',
        duration: request.duration || '8s',
        negative_prompt: request.negative_prompt,
        enhance_prompt: request.enhance_prompt !== false,
        seed: request.seed,
        auto_fix: request.auto_fix !== false,
        resolution: request.resolution || '720p',
        generate_audio: request.generate_audio !== false
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
    console.error('Veo 3 generation error:', error);
    throw new Error(`Veo 3 Error: ${error.message || 'Failed to generate video'}`);
  }
};

export const isVeo3NewAvailable = (): boolean => {
  return !!FAL_API_KEY && FAL_API_KEY.length > 20;
};
