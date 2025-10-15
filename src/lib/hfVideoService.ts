/**
 * Hugging Face Video Generation Service
 * Uses Hugging Face Inference API with fal-ai provider
 */

import { InferenceClient } from '@huggingface/inference';
import { addDebugLog } from '../components/Debug/DebugPanel';

export interface HFVideoRequest {
  prompt: string;
}

export interface HFVideoResponse {
  videoUrl: string;
  prompt: string;
  timestamp: Date;
}

export const generateVideoWithHF = async (request: HFVideoRequest): Promise<HFVideoResponse> => {
  const hfToken = import.meta.env.VITE_HF_TOKEN;

  if (!hfToken) {
    throw new Error('Hugging Face token not configured. Please add VITE_HF_TOKEN to your .env file.');
  }

  addDebugLog('info', '🎬 Starting Hugging Face video generation...');
  console.log('🎬 Generating video with prompt:', request.prompt);

  try {
    const client = new InferenceClient(hfToken);

    addDebugLog('info', '🔄 Requesting video from Hugging Face fal-ai provider...');

    const videoBlob = await client.textToVideo({
      provider: 'fal-ai',
      model: 'Wan-AI/Wan2.2-T2V-A14B',
      inputs: request.prompt,
    });

    console.log('✅ Video blob received:', videoBlob.size, 'bytes');
    addDebugLog('success', `✅ Video generated (${(videoBlob.size / 1024 / 1024).toFixed(2)} MB)`);

    // Convert blob to base64 data URL
    const base64Video = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(videoBlob);
    });

    console.log('✅ Video converted to base64');

    return {
      videoUrl: base64Video,
      prompt: request.prompt,
      timestamp: new Date(),
    };

  } catch (error: any) {
    console.error('❌ Hugging Face video generation failed:', error);
    addDebugLog('error', `❌ Video generation failed: ${error.message}`);
    throw new Error(`Video generation failed: ${error.message}`);
  }
};

export const isHFVideoAvailable = (): boolean => {
  return !!import.meta.env.VITE_HF_TOKEN;
};
