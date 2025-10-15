/**
 * Image Generation Service
 * Uses Hugging Face Inference API for image generation
 */

import { InferenceClient } from '@huggingface/inference';

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface GeneratedImage {
  url: string;
  seed: number;
  prompt: string;
  timestamp: Date;
}

/**
 * Generate image using Stability AI
 */
export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error('Stability AI API key not configured. Add VITE_STABILITY_API_KEY to .env file.');
  }

  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 30,
    guidanceScale = 7.5,
  } = options;

  console.log('🎨 Generating image with prompt:', prompt);

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          ...(negativePrompt ? [{
            text: negativePrompt,
            weight: -1,
          }] : []),
        ],
        cfg_scale: guidanceScale,
        height: height,
        width: width,
        steps: steps,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Stability API error:', errorText);
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error('No image generated');
    }

    const imageBase64 = data.artifacts[0].base64;
    const seed = data.artifacts[0].seed;

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log('✅ Image generated successfully');

    return {
      url: imageUrl,
      seed: seed,
      prompt: prompt,
      timestamp: new Date(),
    };

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
}

/**
 * Check if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  return !!import.meta.env.VITE_STABILITY_API_KEY;
}

/**
 * Generate image using Hugging Face Inference API
 * Uses fal-ai provider with HunyuanImage model
 */
export async function generateImageFree(prompt: string): Promise<GeneratedImage> {
  console.log('🎨 Generating image with Hugging Face:', prompt);

  const hfToken = import.meta.env.VITE_HF_TOKEN;
  const timestamp = Date.now();

  // Fallback to Pollinations.ai if no HF token
  if (!hfToken) {
    console.log('⚠️ No HF token, using Pollinations.ai fallback');
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true&model=flux`;

    return {
      url: imageUrl,
      seed: timestamp,
      prompt: prompt,
      timestamp: new Date(),
    };
  }

  try {
    const client = new InferenceClient(hfToken);

    console.log('🔄 Requesting image from Hugging Face...');

    const blob = await client.textToImage({
      provider: 'fal-ai',
      model: 'tencent/HunyuanImage-3.0',
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    });

    // Convert blob to base64 data URL
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('✅ Image generated successfully');

    return {
      url: base64,
      seed: timestamp,
      prompt: prompt,
      timestamp: new Date(),
    };

  } catch (error: any) {
    console.error('❌ Hugging Face generation failed:', error);
    console.log('⚠️ Falling back to Pollinations.ai');

    // Fallback to Pollinations.ai on error
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true&model=flux`;

    return {
      url: imageUrl,
      seed: timestamp,
      prompt: prompt,
      timestamp: new Date(),
    };
  }
}
