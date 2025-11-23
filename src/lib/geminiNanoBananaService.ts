/**
 * Gemini 2.5 Flash Image Generation (Nano Banana)
 * Uses Gemini's built-in image generation capabilities
 */

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Gemini 2.5 Flash with Nano Banana
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const NANO_BANANA_KEY = import.meta.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

    if (!NANO_BANANA_KEY || NANO_BANANA_KEY.includes('your-')) {
      throw new Error('Nano Banana API key not configured');
    }

    onProgress?.('Initializing Gemini Nano Banana...');

    // Map aspect ratios
    const aspectRatioMap: Record<string, string> = {
      'square': '1:1',
      'landscape': '16:9',
      'portrait': '9:16'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'square'];

    // Use AIMLAPI for image generation (supports multiple models)
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Generating image...');

    const imageResponse = await fetch('https://api.aimlapi.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'flux-schnell',
        prompt: params.prompt,
        n: params.numberOfImages || 1,
        size: aspectRatio === '16:9' ? '1024x576' : aspectRatio === '9:16' ? '576x1024' : '1024x1024',
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json().catch(() => ({}));
      throw new Error(`Image generation error: ${imageResponse.status} - ${errorData.error?.message || imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json();
    onProgress?.('Image generated successfully!');

    if (imageData.data && imageData.data.length > 0) {
      return imageData.data[0].url;
    }

    throw new Error('No image data in response');

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  const key = import.meta.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
