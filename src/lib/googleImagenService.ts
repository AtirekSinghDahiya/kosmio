/**
 * Google Imagen 4.0 Image Generation Service
 * Uses Google's latest Imagen model for high-quality image generation
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
 * Generate images using Google Imagen 4.0
 */
export async function generateWithImagen(
  params: ImagenParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_KEY || GEMINI_KEY.includes('your-')) {
      throw new Error('Google Gemini API key not configured');
    }

    onProgress?.('Initializing Imagen 4.0...');

    // Map aspect ratios to Imagen format
    const aspectRatioMap: Record<string, string> = {
      'square': '1:1',
      'landscape': '16:9',
      'portrait': '9:16'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'square'];

    // Call Google Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0:generateImages?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          negativePrompt: params.negativePrompt || '',
          numberOfImages: params.numberOfImages || 1,
          aspectRatio: aspectRatio,
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
          personGeneration: 'ALLOW_ADULT'
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API Error:', errorText);
      throw new Error(`Imagen API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.generatedImages || data.generatedImages.length === 0) {
      throw new Error('No images generated');
    }

    onProgress?.('Image generated successfully!');

    // Return the base64 image data as a data URL
    const imageData = data.generatedImages[0];
    return `data:${imageData.mimeType};base64,${imageData.bytesBase64Encoded}`;

  } catch (error: any) {
    console.error('Imagen generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Imagen');
  }
}

/**
 * Check if Imagen is available
 */
export function isImagenAvailable(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
