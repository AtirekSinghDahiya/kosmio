/**
 * Shared Fal.ai Client Configuration
 * Single source of truth for Fal.ai API configuration with service-specific keys
 */

import { fal } from '@fal-ai/client';

// Service-specific FAL keys
export const FAL_KEYS = {
  sora: import.meta.env.VITE_FAL_KEY_SORA || '',
  veo: import.meta.env.VITE_FAL_KEY_VEO || '',
  image: import.meta.env.VITE_FAL_KEY_IMAGE || '',
  vace: import.meta.env.VITE_FAL_KEY_VACE || '',
  default: import.meta.env.VITE_FAL_KEY || ''
};

// Configure default FAL client with image generation key
const DEFAULT_KEY = FAL_KEYS.image || FAL_KEYS.default;

if (DEFAULT_KEY && !DEFAULT_KEY.includes('your-')) {
  fal.config({
    credentials: DEFAULT_KEY
  });
  console.log('✅ Fal.ai client configured with default key');
} else {
  console.warn('⚠️ Fal.ai API key not configured');
}

/**
 * Get FAL client configured for specific service
 */
export function getFalClient(service: 'sora' | 'veo' | 'image' | 'vace' = 'image') {
  const key = FAL_KEYS[service] || DEFAULT_KEY;

  if (!key || key.includes('your-')) {
    console.error(`❌ FAL key for ${service} not configured`);
    return null;
  }

  const client = fal;
  client.config({ credentials: key });
  return client;
}

export { fal };
export const isFalConfigured = (service?: 'sora' | 'veo' | 'image' | 'vace') => {
  if (service) {
    const key = FAL_KEYS[service];
    return !!key && !key.includes('your-');
  }
  return !!DEFAULT_KEY && !DEFAULT_KEY.includes('your-');
};
