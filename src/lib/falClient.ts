/**
 * Shared Fal.ai Client Configuration
 * Single source of truth for Fal.ai API configuration
 */

import { fal } from '@fal-ai/client';

const FAL_KEY = import.meta.env.VITE_FAL_KEY || '';

if (FAL_KEY && !FAL_KEY.includes('your-')) {
  fal.config({
    credentials: FAL_KEY
  });
  console.log('✅ Fal.ai client configured successfully');
} else {
  console.warn('⚠️ Fal.ai API key not configured');
}

export { fal };
export const isFalConfigured = () => !!FAL_KEY && !FAL_KEY.includes('your-');
