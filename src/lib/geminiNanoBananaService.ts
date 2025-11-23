/**
 * Nano Banana Fast Image Generation
 * Uses FAL.ai REST API with Flux Schnell model for fast image generation
 * Documentation: https://fal.ai/models/fal-ai/flux/schnell/api
 */

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Flux Schnell via FAL.ai REST API
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const FAL_KEY = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY;

    if (!FAL_KEY) {
      throw new Error('FAL.ai API key not configured');
    }

    onProgress?.('Initializing fast image generation...');

    // Map aspect ratios to FAL format
    const aspectRatioMap: Record<string, string> = {
      'square': 'square',
      'landscape': 'landscape_4_3',
      'portrait': 'portrait_4_3'
    };

    const imageSize = aspectRatioMap[params.aspectRatio || 'square'];

    onProgress?.('Generating image with Flux Schnell...');

    // Submit generation request to FAL.ai queue
    const queueResponse = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        image_size: imageSize,
        num_inference_steps: 4,
        num_images: params.numberOfImages || 1,
        enable_safety_checker: true,
      }),
    });

    if (!queueResponse.ok) {
      const errorData = await queueResponse.json().catch(() => ({}));
      console.error('FAL.ai queue error:', queueResponse.status, errorData);
      throw new Error(`Image generation error: ${queueResponse.status} - ${errorData.detail || errorData.message || queueResponse.statusText}`);
    }

    const queueData = await queueResponse.json();
    const requestId = queueData.request_id;

    if (!requestId) {
      throw new Error('No request ID received from FAL.ai');
    }

    // Poll for result
    const maxAttempts = 60; // 2 minutes timeout
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`, {
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'COMPLETED') {
        const resultResponse = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`, {
          headers: {
            'Authorization': `Key ${FAL_KEY}`,
          },
        });

        if (!resultResponse.ok) {
          throw new Error(`Result fetch failed: ${resultResponse.status}`);
        }

        const result = await resultResponse.json();
        onProgress?.('Image generated successfully!');

        if (result.images && result.images.length > 0) {
          return result.images[0].url;
        }

        throw new Error('No image data in response');
      } else if (statusData.status === 'FAILED') {
        throw new Error(statusData.error || 'Image generation failed');
      }

      onProgress?.('Processing...');
      attempts++;
    }

    throw new Error('Image generation timed out');

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  const key = import.meta.env.VITE_FAL_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY;
  return !!key;
}
