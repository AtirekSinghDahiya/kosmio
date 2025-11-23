/**
 * Simple Image Generation Service using FAL.ai
 * Reliable image generation with Flux model
 */

export interface ImageResult {
  url: string;
  seed?: number;
}

/**
 * Generate image using FAL.ai Flux model
 */
export async function generateImageSimple(
  prompt: string,
  onProgress?: (status: string) => void,
  model: string = 'flux-schnell'
): Promise<string> {
  try {
    const FAL_KEY = import.meta.env.VITE_FAL_KEY;

    if (!FAL_KEY || FAL_KEY.includes('your-')) {
      throw new Error('FAL.ai API key not configured. Please add VITE_FAL_KEY to your .env file.');
    }

    onProgress?.('Initializing image generation...');

    // Model mapping
    const modelMap: Record<string, string> = {
      'flux-schnell': 'fal-ai/flux/schnell',
      'flux-dev': 'fal-ai/flux/dev',
      'flux-pro': 'fal-ai/flux-pro'
    };

    const falModel = modelMap[model] || 'fal-ai/flux/schnell';
    const steps = model === 'flux-schnell' ? 4 : 28;

    // Direct FAL API call
    const response = await fetch(`https://queue.fal.run/${falModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_inference_steps: steps,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API Error:', errorText);
      throw new Error(`FAL API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Handle queue response
    if (data.request_id) {
      onProgress?.('In queue, waiting...');

      // Poll for result
      const resultUrl = `https://queue.fal.run/${falModel}/requests/${data.request_id}`;
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(resultUrl, {
          headers: {
            'Authorization': `Key ${FAL_KEY}`,
          },
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'COMPLETED') {
          const imageUrl = statusData.images?.[0]?.url;
          if (!imageUrl) {
            throw new Error('No image URL in completed response');
          }
          onProgress?.('Image generated successfully!');
          return imageUrl;
        } else if (statusData.status === 'FAILED') {
          throw new Error(statusData.error || 'Image generation failed');
        }

        onProgress?.(`Generating... (${attempts + 1}s)`);
        attempts++;
      }

      throw new Error('Image generation timed out');
    }

    // Direct response (no queue)
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    onProgress?.('Image generated successfully!');
    return imageUrl;

  } catch (error: any) {
    console.error('Image generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
}

/**
 * Check if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  const key = import.meta.env.VITE_FAL_KEY;
  return !!key && !key.includes('your-');
}
