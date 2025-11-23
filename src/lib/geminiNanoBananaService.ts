/**
 * Nano Banana Fast Image Generation
 * Uses Pollinations.ai with Flux Schnell model for fast image generation
 */

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Flux Schnell via Pollinations.ai (fast generation)
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Nano Banana fast generation...');

    const { prompt, aspectRatio = 'square' } = params;

    // Determine dimensions based on aspect ratio
    let width = 1024;
    let height = 1024;

    if (aspectRatio === 'landscape') {
      width = 1280;
      height = 720;
    } else if (aspectRatio === 'portrait') {
      width = 720;
      height = 1280;
    }

    const timestamp = Date.now();
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${timestamp}&nologo=true&model=flux`;

    onProgress?.('Image generated successfully');
    return imageUrl;

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  return true; // Pollinations.ai is always available
}
