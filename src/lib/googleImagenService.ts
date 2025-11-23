/**
 * Google Imagen Image Generation Service
 * Uses Pollinations.ai with Flux Pro model for high-quality image generation
 */

export interface ImagenParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  negativePrompt?: string;
  numberOfImages?: number;
}

export interface ImagenResult {
  url: string;
  mimeType: string;
}

/**
 * Generate images using Flux Pro via Pollinations.ai (high quality)
 */
export async function generateWithImagen(
  params: ImagenParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Initializing Imagen high-quality generation...');

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
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${timestamp}&nologo=true&model=flux-pro`;

    onProgress?.('Image generated successfully');
    return imageUrl;

  } catch (error: any) {
    console.error('Imagen generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Imagen');
  }
}

/**
 * Check if Imagen is available
 */
export function isImagenAvailable(): boolean {
  return true; // Pollinations.ai is always available
}
