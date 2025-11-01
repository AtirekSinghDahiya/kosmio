import { fal } from '@fal-ai/client';
import { supabase } from './supabaseClient';

const FAL_API_KEY = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_SORA2_API_KEY || '75d0a2fb-580d-4c8f-9a6d-8d2686ad6b25:a6347de410f07aa6999b04cfd272752a';

fal.config({
  credentials: FAL_API_KEY
});

export interface Sora2Request {
  prompt: string;
  resolution?: '720p';
  aspect_ratio?: '16:9' | '9:16';
  duration?: 4 | 8 | 12;
  userId?: string;
}

export interface Sora2Response {
  video: {
    url: string;
    content_type: string;
  };
  video_id: string;
}

// Check if user can use Sora2 (premium users unlimited, free users 1 video)
export const canUseSora2 = async (userId: string): Promise<{ allowed: boolean; reason?: string }> => {
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
      console.log('✅ Sora2: Premium user - unlimited access');
      return { allowed: true };
    }

    // Free users: Check usage count
    const { count } = await supabase
      .from('usage_limits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_type', 'sora2_video');

    const usageCount = count || 0;

    if (usageCount < 1) {
      console.log('✅ Sora2: Free user - first video allowed');
      return { allowed: true };
    }

    console.log('❌ Sora2: Free user limit reached');
    return { allowed: false, reason: 'Free users can only generate 1 Sora2 video. Upgrade to premium for unlimited access.' };
  } catch (error) {
    console.error('Error checking Sora2 usage:', error);
    return { allowed: false, reason: 'Error checking usage limits' };
  }
};

// Track Sora2 usage for free users
const trackSora2Usage = async (userId: string) => {
  try {
    await supabase.from('usage_limits').insert({
      user_id: userId,
      feature_type: 'sora2_video',
      usage_count: 1
    });
  } catch (error) {
    console.error('Error tracking Sora2 usage:', error);
  }
};

export const generateSora2Video = async (
  request: Sora2Request,
  onProgress?: (status: string, progress: number) => void
): Promise<string> => {
  try {
    console.log('🎬 Starting Sora 2 video generation');

    // Check access if userId provided
    if (request.userId) {
      const access = await canUseSora2(request.userId);
      if (!access.allowed) {
        throw new Error(access.reason || 'Access denied');
      }
    }

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
      await trackSora2Usage(request.userId);
    }

    console.log('✅ Sora2 video generated successfully');
    return result.data.video.url;
  } catch (error: any) {
    console.error('❌ Sora 2 generation error:', error);
    throw new Error(error.message || 'Failed to generate video');
  }
};

export const isSora2Available = (): boolean => {
  const available = !!FAL_API_KEY && FAL_API_KEY.length > 20;
  console.log('🔍 Sora2 available:', available);
  return available;
};
