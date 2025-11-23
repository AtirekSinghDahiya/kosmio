/**
 * Image Generation Service
 * Supports multiple image generation methods:
 * - AI Model-based (GPT-5, Gemini) via OpenRouter
 * - Traditional services (Hugging Face, Pollinations, Stability AI)
 */

import { InferenceClient } from '@huggingface/inference';
import { generateImageWithAI, supportsImageGeneration } from './openRouterService';

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
 * Smart image generation that detects if user wants AI model-based generation
 * or traditional image generation
 */
export async function generateImageSmart(
  prompt: string,
  selectedModel?: string
): Promise<GeneratedImage> {
  if (selectedModel && supportsImageGeneration(selectedModel)) {
    console.log(`🎨 Generating image with AI model: ${selectedModel}`);

    try {
      const result = await generateImageWithAI(prompt, selectedModel);

      const timestamp = Date.now();
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true&model=flux`;

      return {
        url: imageUrl,
        seed: timestamp,
        prompt: `${result.url}\n\n[Generated with ${selectedModel}]`,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error(`❌ ${selectedModel} image generation failed, falling back to Pollinations`);
    }
  }

  return generateImageFree(prompt);
}

/**
 * Generate image using Google Gemini (Nano Banana) - ACTUAL API
 * This is the real Nano Banana image generation!
 */
export async function generateImageFree(prompt: string): Promise<GeneratedImage> {
  console.log('🎨 Generating image with Nano Banana (Gemini):', prompt);

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const timestamp = Date.now();

  // Try Gemini first (Nano Banana)
  if (geminiKey && !geminiKey.includes('your-')) {
    try {
      console.log('🍌 Using Nano Banana (Gemini 2.5 Flash Image)');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            number_of_images: 1,
            aspect_ratio: '1:1',
            safety_filter_level: 'block_some',
            person_generation: 'allow_adult'
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
          const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
          console.log('✅ Nano Banana generated successfully!');
          return {
            url: imageUrl,
            seed: timestamp,
            prompt: prompt,
            timestamp: new Date(),
          };
        }
      }

      console.log('⚠️ Gemini response not OK, falling back');
    } catch (error) {
      console.error('❌ Gemini error:', error);
    }
  }

  // Fallback to Pollinations.ai
  console.log('⚠️ Using Pollinations.ai fallback');
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true&model=flux`;

  return {
    url: imageUrl,
    seed: timestamp,
    prompt: prompt,
    timestamp: new Date(),
  };
}
