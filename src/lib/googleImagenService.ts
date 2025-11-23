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

    // Use FAL.ai API for image generation
    const FAL_KEY = import.meta.env.VITE_FAL_KEY;

    if (!FAL_KEY || FAL_KEY.includes('your-')) {
      throw new Error('FAL API key not configured');
    }

    // Submit generation request
    const submitResponse = await fetch('https://queue.fal.run/fal-ai/flux-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        image_size: aspectRatio === '16:9' ? 'landscape_16_9' : aspectRatio === '9:16' ? 'portrait_9_16' : 'square',
        num_images: params.numberOfImages || 1,
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('FAL API Error:', errorText);
      throw new Error(`FAL API Error: ${submitResponse.status}`);
    }

    const { request_id } = await submitResponse.json();
    onProgress?.('Image generation queued...');

    // Poll for result
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `https://queue.fal.run/fal-ai/flux-pro/requests/${request_id}/status`,
        {
          headers: {
            'Authorization': `Key ${FAL_KEY}`,
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.status === 'COMPLETED') {
        const resultResponse = await fetch(
          `https://queue.fal.run/fal-ai/flux-pro/requests/${request_id}`,
          {
            headers: {
              'Authorization': `Key ${FAL_KEY}`,
            },
          }
        );

        const result = await resultResponse.json();

        if (result.images && result.images.length > 0) {
          onProgress?.('Image generated successfully!');
          return result.images[0].url;
        }
        throw new Error('No images in result');
      } else if (statusData.status === 'FAILED') {
        throw new Error(statusData.error || 'Generation failed');
      }

      onProgress?.(`Generating image... (${attempts * 2}s)`);
      attempts++;
    }

    throw new Error('Image generation timed out');

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
