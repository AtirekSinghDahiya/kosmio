/**
 * Nano Banana Fast Image Generation
 * Uses AIMLAPI with Flux Schnell model for fast image generation
 * Documentation: https://docs.aimlapi.com/api-references/image-models
 */

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Flux Schnell via AIMLAPI (fast generation)
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Initializing fast image generation...');

    // Map aspect ratios to dimensions
    const dimensionMap: Record<string, string> = {
      'square': '1024x1024',
      'landscape': '1024x576',
      'portrait': '576x1024'
    };

    const size = dimensionMap[params.aspectRatio || 'square'];

    onProgress?.('Generating image with Flux Schnell...');

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
        size: size,
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json().catch(() => ({}));
      console.error('Image generation error:', imageResponse.status, errorData);
      throw new Error(`Image generation error: ${imageResponse.status} - ${errorData.error?.message || errorData.message || imageResponse.statusText}`);
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
