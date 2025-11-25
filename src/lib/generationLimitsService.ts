import { supabase } from './supabase';
import { getUserAccessInfo } from './modelAccessControl';

export type GenerationType = 'image' | 'video' | 'song' | 'tts';

export interface GenerationLimitInfo {
  canGenerate: boolean;
  current: number;
  limit: number;
  isPaid: boolean;
  message: string;
}

export async function checkGenerationLimit(
  userId: string,
  generationType: GenerationType
): Promise<GenerationLimitInfo> {
  try {
    const accessInfo = await getUserAccessInfo(userId);
    const userType = accessInfo?.userType || 'free';

    const { data, error } = await supabase.rpc('check_generation_limit', {
      p_user_id: userId,
      p_generation_type: generationType,
      p_user_type: userType
    });

    if (error) {
      console.error('Error checking generation limit:', error);
      return {
        canGenerate: false,
        current: 0,
        limit: 0,
        isPaid: false,
        message: 'Error checking limit'
      };
    }

    return {
      canGenerate: data.can_generate,
      current: data.current,
      limit: data.limit,
      isPaid: data.is_paid,
      message: data.message
    };
  } catch (error) {
    console.error('Exception checking generation limit:', error);
    return {
      canGenerate: false,
      current: 0,
      limit: 0,
      isPaid: false,
      message: 'Error checking limit'
    };
  }
}

export async function incrementGenerationCount(
  userId: string,
  generationType: GenerationType
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_generation', {
      p_user_id: userId,
      p_generation_type: generationType
    });

    if (error) {
      console.error('Error incrementing generation count:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception incrementing generation count:', error);
    return false;
  }
}

export function getGenerationLimitText(type: GenerationType, userType: 'free' | 'paid'): string {
  if (userType === 'paid') {
    return 'Unlimited (token-based)';
  }

  switch (type) {
    case 'image':
      return '5 images per month';
    case 'video':
      return '1 video per month';
    case 'song':
      return '1 song per month';
    case 'tts':
      return '5 TTS per month';
    default:
      return 'Unknown limit';
  }
}
