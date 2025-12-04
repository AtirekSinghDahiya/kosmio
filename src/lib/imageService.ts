/**
 * Image Generation Service
 * Routes to Kie AI or Puter.js based on model
 */

import { generateKieImage, KIE_MODELS } from './kieAIService';
import { generateImageWithPuter, isPuterModel } from './puterService';

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  model?: string;
}

export interface GeneratedImage {
  url: string;
  seed: number;
  prompt: string;
  timestamp: Date;
}

/**
 * Generate image using appropriate service (Kie AI or Puter.js)
 */
export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const {
    prompt,
    model = 'flux-kontext',
    negativePrompt,
    width,
    height,
    steps
  } = options;

  console.log('🎨 Generating image:', { model, prompt: prompt.substring(0, 50) });

  try {
    let imageUrl: string;
    const seed = Date.now();

    // Check if it's a free Puter.js model
    if (isPuterModel(model)) {
      console.log('🆓 Using free Puter.js model:', model);
      const result = await generateImageWithPuter(prompt, model, {
        negative_prompt: negativePrompt,
        width,
        height,
        steps,
        seed
      });
      imageUrl = result.url;
    } else {
      // Use Kie AI for paid models
      console.log('💎 Using Kie AI model:', model);
      imageUrl = await generateKieImage(prompt, model);
    }

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
  return true;
}

/**
 * Smart image generation using Kie AI
 */
export async function generateImageSmart(
  prompt: string,
  selectedModel?: string
): Promise<GeneratedImage> {
  const model = selectedModel || 'flux-pro';
  console.log(`🎨 Generating image with Kie AI model: ${model}`);

  try {
    return await generateImage({ prompt, model });
  } catch (error: any) {
    console.error(`❌ Image generation failed:`, error);
    throw error;
  }
}

/**
 * Generate image using Kie AI (default method)
 */
export async function generateImageFree(prompt: string, model: string = 'flux-pro'): Promise<GeneratedImage> {
  console.log('🎨 Generating image with Kie AI:', prompt);

  try {
    return await generateImage({ prompt, model });
  } catch (error: any) {
    console.error('❌ Image generation failed:', error);
    throw error;
  }
}

/**
 * Get available image models from Kie AI
 */
export function getAvailableImageModels() {
  return KIE_MODELS.image;
}
