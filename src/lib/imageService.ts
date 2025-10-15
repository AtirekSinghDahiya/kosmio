/**
 * Image Generation Service
 * Uses Stability AI / Stable Diffusion for image generation
 */

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface GeneratedImage {
  url: string;
  seed: number;
  prompt: string;
  timestamp: Date;
}

/**
 * Generate image using Stability AI
 */
export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error('Stability AI API key not configured. Add VITE_STABILITY_API_KEY to .env file.');
  }

  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 30,
    guidanceScale = 7.5,
  } = options;

  console.log('🎨 Generating image with prompt:', prompt);

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          ...(negativePrompt ? [{
            text: negativePrompt,
            weight: -1,
          }] : []),
        ],
        cfg_scale: guidanceScale,
        height: height,
        width: width,
        steps: steps,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Stability API error:', errorText);
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error('No image generated');
    }

    const imageBase64 = data.artifacts[0].base64;
    const seed = data.artifacts[0].seed;

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageBase64}`;

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
  return !!import.meta.env.VITE_STABILITY_API_KEY;
}

/**
 * Generate image using alternative free service (Pollinations.ai)
 */
export async function generateImageFree(prompt: string): Promise<GeneratedImage> {
  console.log('🎨 Generating image with free service:', prompt);

  try {
    // Pollinations.ai provides free image generation
    const encodedPrompt = encodeURIComponent(prompt);
    const timestamp = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${timestamp}&nologo=true`;

    console.log('🔄 Fetching image from Pollinations.ai...');

    // Fetch the image and convert to base64 to avoid CORS issues
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('✅ Image generated and converted to base64');

    return {
      url: base64,
      seed: timestamp,
      prompt: prompt,
      timestamp: new Date(),
    };

  } catch (error: any) {
    console.error('❌ Free image generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
}
