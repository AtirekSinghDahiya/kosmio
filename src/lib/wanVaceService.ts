import { fal } from '@fal-ai/client';

const FAL_API_KEY = import.meta.env.VITE_WAN_VACE_API_KEY || '8d8d3ce8-dfd5-4297-9934-f554561f25e9:6586c254b094c2a1b1ea5c7ae6e0a205';

fal.config({
  credentials: FAL_API_KEY
});

export interface WanVaceRequest {
  prompt: string;
  video_url: string;
  video_type?: 'auto' | 'general' | 'human';
  image_urls?: string[];
  resolution?: 'auto' | '240p' | '360p' | '480p' | '580p' | '720p';
  acceleration?: 'none' | 'low' | 'regular';
  enable_auto_downsample?: boolean;
  aspect_ratio?: 'auto' | '16:9' | '9:16' | '1:1';
  auto_downsample_min_fps?: number;
  enable_safety_checker?: boolean;
}

export interface WanVaceResponse {
  video: {
    url: string;
    content_type?: string;
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
  };
}

export const editVideoWithWanVace = async (
  request: WanVaceRequest,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    onProgress?.('Initializing video editing with Wan VACE...', 0);

    const result = await fal.subscribe<WanVaceResponse>('fal-ai/wan-vace-apps/video-edit', {
      input: {
        prompt: request.prompt,
        video_url: request.video_url,
        video_type: request.video_type || 'auto',
        image_urls: request.image_urls || [],
        resolution: request.resolution || 'auto',
        acceleration: request.acceleration || 'regular',
        enable_auto_downsample: request.enable_auto_downsample !== false,
        aspect_ratio: request.aspect_ratio || 'auto',
        auto_downsample_min_fps: request.auto_downsample_min_fps || 15,
        enable_safety_checker: request.enable_safety_checker !== false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          const logs = update.logs?.map((log: any) => log.message).join('\n') || '';
          onProgress?.(`Editing video: ${logs}`, 50);
        } else if (update.status === 'COMPLETED') {
          onProgress?.('Video editing complete!', 100);
        }
      }
    });

    if (!result.data?.video?.url) {
      throw new Error('No video URL in response');
    }

    return result.data.video.url;
  } catch (error: any) {
    console.error('Wan VACE editing error:', error);
    throw new Error(`Wan VACE Error: ${error.message || 'Failed to edit video'}`);
  }
};

export const isWanVaceAvailable = (): boolean => {
  return !!FAL_API_KEY && FAL_API_KEY.length > 20;
};
