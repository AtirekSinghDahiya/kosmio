import { fal } from '@fal-ai/client';
import { supabase } from './supabaseClient';

const FAL_API_KEY = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_VEO3_API_KEY || '706e64d2-2ccc-4b42-b6e7-adf2585c8c6c:bb97d6a4b403a9b35e75e5ee82525ad7';

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
  userId?: string;
}

export interface Veo3Response {
  video: {
    url: string;
    content_type?: string;
  };
}

// Check if user can use Veo3 (premium users unlimited, free users 1 video)
export const canUseVeo3 = async (userId: string): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('paid_tokens_balance, is_premium')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { allowed: false, reason: 'User not found' };
    }

    // Premium users have unlimited access
    if (profile.paid_tokens_balance > 0 || profile.is_premium) {
      console.log('✅ Veo3: Premium user - unlimited access');
      return { allowed: true };
    }

    // Free users: Check usage count
    const { count } = await supabase
      .from('usage_limits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_type', 'veo3_video');

    const usageCount = count || 0;

    if (usageCount < 1) {
      console.log('✅ Veo3: Free user - first video allowed');
      return { allowed: true };
    }

    console.log('❌ Veo3: Free user limit reached');
    return { allowed: false, reason: 'Free users can only generate 1 Veo3 video. Upgrade to premium for unlimited access.' };
  } catch (error) {
    console.error('Error checking Veo3 usage:', error);
    return { allowed: false, reason: 'Error checking usage limits' };
  }
};

// Track Veo3 usage for free users
const trackVeo3Usage = async (userId: string) => {
  try {
    await supabase.from('usage_limits').insert({
      user_id: userId,
      feature_type: 'veo3_video',
      usage_count: 1
    });
  } catch (error) {
    console.error('Error tracking Veo3 usage:', error);
  }
};

export const generateVeo3VideoNew = async (
  request: Veo3Request,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    console.log('🎬 Starting Veo 3 video generation');

    // Check access if userId provided
    if (request.userId) {
      const access = await canUseVeo3(request.userId);
      if (!access.allowed) {
        throw new Error(access.reason || 'Access denied');
      }
    }

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
          onProgress?.(`Generating video...`, 50);
          console.log('📊 Progress:', logs);
        } else if (update.status === 'COMPLETED') {
          onProgress?.('Video generation complete!', 100);
        }
      }
    });

    if (!result.data?.video?.url) {
      throw new Error('No video URL in response');
    }

    // Track usage for free users
    if (request.userId) {
      await trackVeo3Usage(request.userId);
    }

    console.log('✅ Veo3 video generated successfully');
    return result.data.video.url;
  } catch (error: any) {
    console.error('❌ Veo 3 generation error:', error);
    throw new Error(error.message || 'Failed to generate video');
  }
};

export const isVeo3NewAvailable = (): boolean => {
  const available = !!FAL_API_KEY && FAL_API_KEY.length > 20;
  console.log('🔍 Veo3 available:', available);
  return available;
};
