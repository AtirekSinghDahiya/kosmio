/**
 * Google Imagen 3 Image Generation Service
 * Uses Google's official Imagen API via Gemini
 * Documentation: https://ai.google.dev/gemini-api/docs/imagen
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
 * Generate images using Google Imagen 3
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

    onProgress?.('Initializing Google Imagen 3...');

    // Map aspect ratios to Imagen format
    const aspectRatioMap: Record<string, string> = {
      'square': '1:1',
      'landscape': '16:9',
      'portrait': '9:16'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'square'];

    // Google Imagen 3 API endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_KEY}`;

    onProgress?.('Generating image with Imagen 3...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: params.prompt,
            ...(params.negativePrompt && { negative_prompt: params.negativePrompt }),
            aspect_ratio: aspectRatio,
            number_of_images: params.numberOfImages || 1,
            safety_filter_level: 'block_some',
            person_generation: 'allow_adult',
          },
        ],
        parameters: {
          sampleCount: params.numberOfImages || 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Imagen API Error:', errorData);
      throw new Error(
        `Google Imagen API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    onProgress?.('Image generated successfully!');

    // Extract image data from response
    // Google returns base64 encoded images
    const prediction = data.predictions?.[0];
    if (!prediction) {
      throw new Error('No image data in response');
    }

    // Check for different possible response formats
    let imageData: string;
    if (prediction.bytesBase64Encoded) {
      imageData = prediction.bytesBase64Encoded;
    } else if (prediction.image) {
      imageData = prediction.image;
    } else {
      throw new Error('Unexpected response format from Imagen API');
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageData}`;

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
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
